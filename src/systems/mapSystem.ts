import { generateMapTile, getAdjacentCoords, getMapTile, isAdjacentCoord, isSameCoord, mapPuzzles, coordKey } from '../data/map';
import { monstersById } from '../data/monsters';
import type { GameState, MapCoord, MapTile } from '../types/game';
import { startMapEncounter } from './combatSystem';
import { addLog, grantRewards } from './stateUtils';

function addMapLog(state: GameState, tone: 'info' | 'success' | 'warning' | 'danger', message: string): void {
  const entry = {
    id: `map-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    time: Date.now(),
    tone,
    message,
  };
  state.map.mapLog = [entry, ...state.map.mapLog].slice(0, 24);
  addLog(state, tone, message);
}

export function ensureMapTile(state: GameState, coord: MapCoord): MapTile {
  const key = coordKey(coord);
  if (!state.map.knownTiles[key]) {
    state.map.knownTiles[key] = generateMapTile(state.map.seed, coord);
  }
  return state.map.knownTiles[key];
}

export function revealAround(state: GameState, coord: MapCoord, includeDiagonals = false): void {
  const coords = [coord, ...getAdjacentCoords(coord)];
  if (includeDiagonals) {
    coords.push(
      { x: coord.x - 1, y: coord.y - 1 },
      { x: coord.x + 1, y: coord.y - 1 },
      { x: coord.x - 1, y: coord.y + 1 },
      { x: coord.x + 1, y: coord.y + 1 },
    );
  }

  coords.forEach((nextCoord) => {
    const tile = ensureMapTile(state, nextCoord);
    state.map.revealed[tile.key] = true;
  });
}

export function selectMapTile(state: GameState, coord: MapCoord): void {
  const tile = ensureMapTile(state, coord);
  state.map.selectedTileKey = tile.key;
}

function completeTile(state: GameState, tile: MapTile): void {
  if (state.map.completed[tile.key]) return;
  state.map.completed[tile.key] = true;
  state.map.activePuzzleId = null;
  if (tile.secret) state.map.secretsFound += 1;
}

function describeRewards(rewards: ReturnType<typeof grantRewards>): string {
  if (!rewards.length) return '';
  return ` Found ${rewards.map((reward) => `${reward.quantity} ${reward.label}`).join(', ')}.`;
}

export function resolveMapTile(state: GameState, tileKey = state.map.activeTileKey ?? state.map.selectedTileKey): void {
  if (!tileKey) return;
  const tile = state.map.knownTiles[tileKey];
  if (!tile) return;

  if (coordKey(state.map.position) !== tile.key) {
    addMapLog(state, 'warning', 'Travel to this location before searching it.');
    return;
  }

  if (state.map.completed[tile.key]) {
    addMapLog(state, 'info', `${tile.name} is already resolved.`);
    return;
  }

  if (tile.type === 'puzzle') {
    state.map.activePuzzleId = tile.puzzleId ?? null;
    addMapLog(state, 'info', `${tile.name} waits for an answer.`);
    return;
  }

  if (tile.type === 'encounter' || tile.type === 'boss') {
    if (tile.monsterId) startMapEncounter(state, tile.monsterId, tile.key);
    return;
  }

  const rewards = grantRewards(state, tile.rewards ?? []);
  completeTile(state, tile);
  const suffix = describeRewards(rewards);
  addMapLog(state, tile.secret ? 'success' : 'info', `${tile.name} explored.${suffix}`);
}

export function solveMapPuzzle(state: GameState, tileKey: string, choiceId: string): void {
  const tile = state.map.knownTiles[tileKey];
  if (!tile?.puzzleId) return;
  const puzzle = mapPuzzles[tile.puzzleId];
  if (!puzzle) return;

  if (coordKey(state.map.position) !== tile.key) {
    addMapLog(state, 'warning', 'You need to stand at the puzzle to solve it.');
    return;
  }

  if (state.map.completed[tile.key]) {
    addMapLog(state, 'info', `${puzzle.title} is already solved.`);
    return;
  }

  if (choiceId !== puzzle.solutionId) {
    addMapLog(state, 'warning', puzzle.failureText);
    return;
  }

  const rewards = grantRewards(state, puzzle.rewards);
  completeTile(state, tile);
  addMapLog(state, 'success', `${puzzle.solvedText}${describeRewards(rewards)}`);
}

function triggerTileArrival(state: GameState, tile: MapTile): void {
  state.map.activeTileKey = tile.key;
  state.map.selectedTileKey = tile.key;

  if (state.map.completed[tile.key]) {
    addMapLog(state, 'info', `Returned to ${tile.name}.`);
    return;
  }

  if (tile.type === 'encounter' || tile.type === 'boss') {
    const monster = tile.monsterId ? monstersById[tile.monsterId] : null;
    if (tile.monsterId && monster) {
      addMapLog(state, tile.type === 'boss' ? 'danger' : 'warning', `${monster.name} emerges at ${tile.name}.`);
      startMapEncounter(state, tile.monsterId, tile.key);
      return;
    }
  }

  if (tile.type === 'puzzle') {
    state.map.activePuzzleId = tile.puzzleId ?? null;
    addMapLog(state, 'info', `${tile.name} reveals a puzzle.`);
    return;
  }

  if (['treasure', 'npc', 'shrine', 'ruins', 'grove', 'mine', 'coast'].includes(tile.type)) {
    addMapLog(state, 'info', `${tile.name} has something to inspect.`);
    return;
  }

  addMapLog(state, 'info', `${tile.name} charted.`);
  if (tile.type === 'plains') completeTile(state, tile);
}

export function startMapTravel(state: GameState, destination: MapCoord): void {
  if (state.combat.mode !== 'idle') {
    addMapLog(state, 'warning', 'Finish or flee the current encounter before travelling.');
    return;
  }

  if (state.activeActionId) {
    addMapLog(state, 'warning', 'Stop your current skill action before travelling.');
    return;
  }

  if (!isAdjacentCoord(state.map.position, destination)) {
    addMapLog(state, 'warning', 'You can only travel to adjacent tiles.');
    selectMapTile(state, destination);
    return;
  }

  const destinationTile = ensureMapTile(state, destination);
  if (!state.map.revealed[destinationTile.key]) {
    addMapLog(state, 'warning', 'The fog hides that route. Reveal it first.');
    return;
  }

  if (isSameCoord(state.map.position, destination)) return;

  state.activeView = 'map';
  state.map.destination = destination;
  state.map.travelProgressMs = 0;
  state.map.travelIntervalMs = destinationTile.travelTimeMs;
  state.map.selectedTileKey = destinationTile.key;
  state.map.activePuzzleId = null;
  addMapLog(state, 'info', `Travelling to ${destinationTile.name}.`);
}

export function processMapTick(state: GameState, deltaMs: number): void {
  if (!state.map.destination || state.combat.mode !== 'idle') return;

  const destination = state.map.destination;
  const destinationTile = ensureMapTile(state, destination);
  state.map.travelIntervalMs = destinationTile.travelTimeMs;
  state.map.travelProgressMs += deltaMs;

  if (state.map.travelProgressMs < state.map.travelIntervalMs) return;

  state.map.position = destination;
  state.map.destination = null;
  state.map.travelProgressMs = 0;
  state.map.explored[destinationTile.key] = true;
  revealAround(state, destination, destinationTile.secret ?? false);
  addMapLog(state, 'success', `Arrived at ${destinationTile.name}.`);
  triggerTileArrival(state, destinationTile);
}

export function completeOfflineTravel(state: GameState, deltaMs: number): boolean {
  if (!state.map.destination || state.combat.mode !== 'idle') return false;
  processMapTick(state, deltaMs);
  return !state.map.destination;
}

export function getCurrentMapTile(state: GameState): MapTile {
  return getMapTile(state.map, state.map.position);
}
