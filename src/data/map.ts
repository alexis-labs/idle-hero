import type { MapBounds, MapCoord, MapPuzzleDefinition, MapState, MapTile, MapTileType, MonsterId, RewardRoll } from '../types/game';

export const MAP_VIEW_RADIUS = 6;
export const RUN_MAP_RADIUS = MAP_VIEW_RADIUS;
export const BASE_TRAVEL_INTERVAL_MS = 2200;
export const DEFAULT_RUN_BOUNDS: MapBounds = {
  minX: -RUN_MAP_RADIUS,
  maxX: RUN_MAP_RADIUS,
  minY: -RUN_MAP_RADIUS,
  maxY: RUN_MAP_RADIUS,
};

export const mapTileMeta: Record<MapTileType, { label: string; color: string; short: string }> = {
  origin: { label: 'Camp', color: '#38bdf8', short: 'Safe camp and survey point.' },
  plains: { label: 'Wilds', color: '#84cc16', short: 'Open ground with small discoveries.' },
  grove: { label: 'Grove', color: '#22c55e', short: 'Trees, herbs, and hidden paths.' },
  mine: { label: 'Mine', color: '#94a3b8', short: 'Stone seams and buried caches.' },
  coast: { label: 'Coast', color: '#0ea5e9', short: 'Waterways, tide pools, and wreckage.' },
  ruins: { label: 'Ruins', color: '#a78bfa', short: 'Old masonry with secrets inside.' },
  shrine: { label: 'Shrine', color: '#facc15', short: 'A quiet place for offerings and relics.' },
  npc: { label: 'NPC', color: '#14b8a6', short: 'A wanderer with a story or trade.' },
  puzzle: { label: 'Puzzle', color: '#c084fc', short: 'A lock, riddle, or strange mechanism.' },
  treasure: { label: 'Treasure', color: '#f59e0b', short: 'A stash waiting to be searched.' },
  encounter: { label: 'Encounter', color: '#fb7185', short: 'Hostile movement in the dark.' },
  boss: { label: 'Boss', color: '#ef4444', short: 'A dangerous guardian blocks this place.' },
  locked: { label: 'Locked', color: '#64748b', short: 'Something bars the way for now.' },
};

export const mapPuzzles: Record<string, MapPuzzleDefinition> = {
  rune_order: {
    id: 'rune_order',
    title: 'Runic Sequence',
    prompt: 'Three stones glow in sequence: air, ember, shadow. Which rune do you touch last?',
    choices: [
      { id: 'air', label: 'Air' },
      { id: 'ember', label: 'Ember' },
      { id: 'shadow', label: 'Shadow' },
    ],
    solutionId: 'shadow',
    solvedText: 'The stones settle and reveal a small cache of essence.',
    failureText: 'The runes dim. The sequence resets, waiting for a calmer hand.',
    rewards: [{ itemId: 'rune_essence', quantity: 6, chance: 1 }, { itemId: 'air_rune', quantity: 12, chance: 1 }],
  },
  ancient_lock: {
    id: 'ancient_lock',
    title: 'Ancient Lock',
    prompt: 'A bronze lock has three worn teeth. Which craft answers it?',
    choices: [
      { id: 'forge', label: 'Forge heat' },
      { id: 'thread', label: 'Leather thread' },
      { id: 'water', label: 'River water' },
    ],
    solutionId: 'forge',
    solvedText: 'Heat softens the old mechanism. The lock gives way.',
    failureText: 'The lock grinds and refuses to move.',
    rewards: [{ itemId: 'bronze_bar', quantity: 2, chance: 1 }, { gp: 28, quantity: 1, chance: 1 }],
  },
  offering_shrine: {
    id: 'offering_shrine',
    title: 'Offering Shrine',
    prompt: 'A shrine asks for a humble offering. What belongs here?',
    choices: [
      { id: 'log', label: 'A clean log' },
      { id: 'ore', label: 'A cold ore' },
      { id: 'coin', label: 'A coin' },
    ],
    solutionId: 'log',
    solvedText: 'The shrine accepts the simple gift and uncovers a relic page.',
    failureText: 'The shrine remains silent.',
    rewards: [{ itemId: 'ancient_page', quantity: 1, chance: 1 }, { gp: 42, quantity: 1, chance: 1 }],
  },
};

export function coordKey(coord: MapCoord): string {
  return `${coord.x},${coord.y}`;
}

export function parseCoordKey(key: string): MapCoord {
  const [x, y] = key.split(',').map(Number);
  return { x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0 };
}

export function manhattanDistance(a: MapCoord, b: MapCoord = { x: 0, y: 0 }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function isSameCoord(a: MapCoord, b: MapCoord): boolean {
  return a.x === b.x && a.y === b.y;
}

export function isAdjacentCoord(a: MapCoord, b: MapCoord): boolean {
  return manhattanDistance(a, b) === 1;
}

export function getAdjacentCoords(coord: MapCoord): MapCoord[] {
  return [
    { x: coord.x, y: coord.y - 1 },
    { x: coord.x + 1, y: coord.y },
    { x: coord.x, y: coord.y + 1 },
    { x: coord.x - 1, y: coord.y },
  ];
}

export function getVisibleCoords(center: MapCoord, radius = MAP_VIEW_RADIUS): MapCoord[] {
  const coords: MapCoord[] = [];
  for (let y = center.y - radius; y <= center.y + radius; y += 1) {
    for (let x = center.x - radius; x <= center.x + radius; x += 1) {
      coords.push({ x, y });
    }
  }
  return coords;
}

export function isCoordWithinBounds(coord: MapCoord, bounds: MapBounds): boolean {
  return coord.x >= bounds.minX && coord.x <= bounds.maxX && coord.y >= bounds.minY && coord.y <= bounds.maxY;
}

export function getRunCoords(bounds: MapBounds = DEFAULT_RUN_BOUNDS): MapCoord[] {
  const coords: MapCoord[] = [];
  for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      coords.push({ x, y });
    }
  }
  return coords;
}

export function getRunMapSize(bounds: MapBounds = DEFAULT_RUN_BOUNDS): { columns: number; rows: number } {
  return {
    columns: bounds.maxX - bounds.minX + 1,
    rows: bounds.maxY - bounds.minY + 1,
  };
}

function hash(seed: number, coord: MapCoord, salt: number): number {
  let value = seed ^ Math.imul(coord.x + 374761393, 668265263) ^ Math.imul(coord.y + 1442695041, 2246822519) ^ Math.imul(salt, 3266489917);
  value = Math.imul(value ^ (value >>> 15), 2246822507);
  value = Math.imul(value ^ (value >>> 13), 3266489909);
  return (value ^ (value >>> 16)) >>> 0;
}

function randomAt(seed: number, coord: MapCoord, salt: number): number {
  return hash(seed, coord, salt) / 4294967295;
}

function pick<T>(items: T[], seed: number, coord: MapCoord, salt: number): T {
  return items[Math.floor(randomAt(seed, coord, salt) * items.length) % items.length];
}

function monsterForDistance(distance: number, seed: number, coord: MapCoord, boss = false): MonsterId {
  if (boss || distance >= 7) return 'vault_warden';
  if (distance >= 5) return pick(['cave_sentry', 'ember_acolyte'], seed, coord, 20);
  if (distance >= 3) return pick(['lane_bandit', 'cave_sentry'], seed, coord, 21);
  return pick(['training_dummy', 'lane_bandit'], seed, coord, 22);
}

function puzzleForCoord(seed: number, coord: MapCoord): string {
  return pick(Object.keys(mapPuzzles), seed, coord, 30);
}

export function createMapSeed(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

export function chooseRunBossCoord(seed: number, bounds: MapBounds = DEFAULT_RUN_BOUNDS): MapCoord {
  const coords = getRunCoords(bounds).filter((coord) => {
    return manhattanDistance(coord) >= RUN_MAP_RADIUS + 3 && isCoordWithinBounds(coord, bounds) && !isSameCoord(coord, { x: 0, y: 0 });
  });
  const fallback = { x: bounds.maxX, y: bounds.maxY };
  if (!coords.length) return fallback;
  return coords[Math.floor(randomAt(seed, fallback, 42) * coords.length) % coords.length];
}

function rewardsForTile(type: MapTileType, distance: number): RewardRoll[] {
  if (type === 'treasure') return [{ gp: 20 + distance * 9, quantity: 1, chance: 1 }, { itemId: 'vault_key', quantity: 1, chance: distance > 3 ? 0.25 : 0.08 }];
  if (type === 'grove') return [{ itemId: distance > 3 ? 'oak_log' : 'normal_log', quantity: 3 + Math.floor(distance / 2), chance: 1 }];
  if (type === 'mine') return [{ itemId: distance > 4 ? 'iron_ore' : 'copper_ore', quantity: 2 + Math.floor(distance / 2), chance: 1 }, { itemId: 'tin_ore', quantity: 2, chance: distance <= 4 ? 0.7 : 0.15 }];
  if (type === 'coast') return [{ itemId: distance > 4 ? 'raw_trout' : 'raw_shrimp', quantity: 3, chance: 1 }];
  if (type === 'npc') return [{ gp: 18 + distance * 4, quantity: 1, chance: 1 }, { itemId: 'cooked_shrimp', quantity: 2, chance: 0.6 }];
  if (type === 'shrine') return [{ itemId: 'rune_essence', quantity: 3 + distance, chance: 1 }, { itemId: 'ancient_page', quantity: 1, chance: distance > 4 ? 0.18 : 0.04 }];
  if (type === 'ruins') return [{ itemId: 'ancient_page', quantity: 1, chance: 0.18 }, { gp: 30 + distance * 6, quantity: 1, chance: 1 }];
  return [];
}

function chooseTileType(seed: number, coord: MapCoord, bossCoord: MapCoord | null = null): MapTileType {
  const distance = manhattanDistance(coord);
  if (distance === 0) return 'origin';
  if (bossCoord && isSameCoord(coord, bossCoord)) return 'boss';

  const roll = randomAt(seed, coord, 1);
  if (distance >= 6 && roll > 0.9) return 'encounter';
  if (roll > 0.76) return 'encounter';
  if (roll > 0.66) return 'treasure';
  if (roll > 0.56) return 'puzzle';
  if (roll > 0.49) return 'npc';
  if (roll > 0.42) return 'shrine';
  if (roll > 0.34) return 'ruins';

  const biomeRoll = randomAt(seed, coord, 2);
  if (biomeRoll > 0.75) return 'coast';
  if (biomeRoll > 0.5) return 'mine';
  if (biomeRoll > 0.25) return 'grove';
  return 'plains';
}

export function generateMapTile(seed: number, coord: MapCoord, bossCoord: MapCoord | null = null): MapTile {
  const key = coordKey(coord);
  const distance = manhattanDistance(coord);
  const type = chooseTileType(seed, coord, bossCoord);
  const meta = mapTileMeta[type];
  const biome = pick(['Greenrise', 'Lowrock', 'Glasswater', 'Emberfall', 'Old Vale'], seed, coord, 3);
  const secret = randomAt(seed, coord, 4) > 0.92 && distance > 1;
  const danger = type === 'boss' ? 5 : type === 'encounter' ? Math.min(4, 1 + Math.floor(distance / 2)) : type === 'locked' ? 3 : Math.max(0, Math.floor(distance / 4));
  const travelTimeMs = BASE_TRAVEL_INTERVAL_MS + Math.min(4200, distance * 260 + danger * 360);
  const rewards = rewardsForTile(type, distance);

  const tile: MapTile = {
    key,
    coord,
    type,
    name: type === 'origin' ? 'Hero Camp' : `${biome} ${meta.label}`,
    description: type === 'origin' ? 'The center of your expedition. Routes branch in every direction.' : `${meta.short} Distance ${distance} from camp.`,
    biome,
    color: meta.color,
    danger,
    travelTimeMs,
    rewards,
    secret,
  };

  if (type === 'encounter' || type === 'boss') tile.monsterId = monsterForDistance(distance, seed, coord, type === 'boss');
  if (type === 'puzzle') tile.puzzleId = puzzleForCoord(seed, coord);

  return tile;
}

export function createRunMap(seed: number, bounds: MapBounds = DEFAULT_RUN_BOUNDS, bossCoord = chooseRunBossCoord(seed, bounds)): Record<string, MapTile> {
  return getRunCoords(bounds).reduce<Record<string, MapTile>>((tiles, coord) => {
    const tile = generateMapTile(seed, coord, bossCoord);
    tiles[tile.key] = tile;
    return tiles;
  }, {});
}

function filterTileFlags(record: Record<string, true>, allowedKeys: Set<string>): Record<string, true> {
  return Object.entries(record).reduce<Record<string, true>>((flags, [key, value]) => {
    if (value && allowedKeys.has(key)) flags[key] = true;
    return flags;
  }, {});
}

export function createInitialMapState(seed = createMapSeed(), runId = 1, bounds: MapBounds = DEFAULT_RUN_BOUNDS): MapState {
  const position = { x: 0, y: 0 };
  const origin = { x: 0, y: 0 };
  const bossCoord = chooseRunBossCoord(seed, bounds);
  const knownTiles = createRunMap(seed, bounds, bossCoord);
  const revealed: MapState['revealed'] = {};
  [position, ...getAdjacentCoords(position)].forEach((coord) => {
    if (!isCoordWithinBounds(coord, bounds)) return;
    const tile = knownTiles[coordKey(coord)] ?? generateMapTile(seed, coord, bossCoord);
    knownTiles[tile.key] = tile;
    revealed[tile.key] = true;
  });

  const originKey = coordKey(position);
  return {
    runId,
    runStatus: 'active',
    seed,
    bounds,
    origin,
    position,
    destination: null,
    travelProgressMs: 0,
    travelIntervalMs: BASE_TRAVEL_INTERVAL_MS,
    revealed,
    explored: { [originKey]: true },
    completed: { [originKey]: true },
    knownTiles,
    selectedTileKey: originKey,
    activeTileKey: originKey,
    activePuzzleId: null,
    bossTileKey: coordKey(bossCoord),
    runStartedAt: Date.now(),
    runCompletedAt: null,
    secretsFound: 0,
    bossesDefeated: 0,
    mapLog: [],
  };
}

export function normalizeMapState(candidate?: Partial<MapState>): MapState {
  const seed = candidate?.seed ?? createMapSeed();
  const bounds = candidate?.bounds ?? DEFAULT_RUN_BOUNDS;
  const base = createInitialMapState(seed, candidate?.runId ?? 1, bounds);
  if (!candidate) return base;

  const candidatePosition = candidate.position && isCoordWithinBounds(candidate.position, bounds) ? candidate.position : base.position;
  const candidateDestination = candidate.destination && isCoordWithinBounds(candidate.destination, bounds) ? candidate.destination : null;

  const map: MapState = {
    ...base,
    ...candidate,
    runId: candidate.runId ?? base.runId,
    runStatus: candidate.runStatus ?? base.runStatus,
    bounds,
    origin: candidate.origin ?? base.origin,
    position: candidatePosition,
    destination: candidateDestination,
    revealed: { ...base.revealed, ...(candidate.revealed ?? {}) },
    explored: { ...base.explored, ...(candidate.explored ?? {}) },
    completed: { ...base.completed, ...(candidate.completed ?? {}) },
    knownTiles: base.knownTiles,
    bossTileKey: candidate.bossTileKey && base.knownTiles[candidate.bossTileKey]?.type === 'boss' ? candidate.bossTileKey : base.bossTileKey,
    runStartedAt: candidate.runStartedAt ?? base.runStartedAt,
    runCompletedAt: candidate.runCompletedAt ?? base.runCompletedAt,
    mapLog: candidate.mapLog ?? base.mapLog,
  };

  const currentKey = coordKey(map.position);
  if (!map.knownTiles[currentKey]) map.knownTiles[currentKey] = generateMapTile(map.seed, map.position, map.bossTileKey ? parseCoordKey(map.bossTileKey) : null);
  const allowedKeys = new Set(Object.keys(map.knownTiles));
  map.revealed = filterTileFlags(map.revealed, allowedKeys);
  map.explored = filterTileFlags(map.explored, allowedKeys);
  map.completed = filterTileFlags(map.completed, allowedKeys);
  map.revealed[currentKey] = true;
  map.explored[currentKey] = true;
  if (!map.selectedTileKey || !map.knownTiles[map.selectedTileKey]) map.selectedTileKey = currentKey;
  if (!map.activeTileKey || !map.knownTiles[map.activeTileKey]) map.activeTileKey = currentKey;
  return map;
}

export function getMapTile(map: MapState, coord: MapCoord): MapTile {
  return map.knownTiles[coordKey(coord)] ?? generateMapTile(map.seed, coord, map.bossTileKey ? parseCoordKey(map.bossTileKey) : null);
}
