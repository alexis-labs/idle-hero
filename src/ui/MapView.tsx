import { Compass, HeartPulse, Map as MapIcon, Search, Shield, Square, Swords, Utensils } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useGame } from '../app/useGameStore';
import { coordKey, generateMapTile, getMapTile, getVisibleCoords, isAdjacentCoord, isSameCoord, mapPuzzles, mapTileMeta, MAP_VIEW_RADIUS, parseCoordKey } from '../data/map';
import { items } from '../data/items';
import { monstersById } from '../data/monsters';
import { formatNumber, getMaxPlayerHp, getPlayerCombatStats } from '../systems/formulas';
import type { MapTile, RewardRoll } from '../types/game';
import { Coins, getMapTileIcon } from './iconMaps';
import { ItemIcon } from './ItemIcon';
import { ProgressBar } from './ProgressBar';

function RewardPill({ reward }: { reward: RewardRoll }) {
  if (reward.gp) return <span className="reward-chip money-chip"><Coins size={15} />{reward.gp} GP</span>;
  if (!reward.itemId) return null;
  return (
    <span className="reward-chip">
      <ItemIcon itemId={reward.itemId} quantity={reward.quantity ?? reward.minQuantity ?? 1} />
      {items[reward.itemId]?.name ?? reward.itemId}
    </span>
  );
}

function TileBadge({ tile }: { tile: MapTile }) {
  const Icon = getMapTileIcon(tile.type);
  return (
    <span className="tile-type-badge" style={{ '--tile-color': tile.color } as CSSProperties}>
      <Icon size={15} />
      {mapTileMeta[tile.type].label}
    </span>
  );
}

function EncounterPanel() {
  const { state, dispatch } = useGame();
  const activeMonster = state.combat.activeMonsterId ? monstersById[state.combat.activeMonsterId] : null;
  const playerStats = getPlayerCombatStats(state);
  const maxHp = getMaxPlayerHp(state);
  const food = Object.entries(state.bank).filter(([itemId, quantity]) => quantity > 0 && Boolean(items[itemId]?.healAmount));

  if (!activeMonster) return null;

  return (
    <article className="map-encounter-panel" style={{ '--tile-color': activeMonster.color } as CSSProperties}>
      <div className="panel-title-row">
        <Swords size={18} />
        <h3>{activeMonster.name}</h3>
      </div>
      <p>{activeMonster.zone} threat level {activeMonster.level}. Defeat it to secure this tile.</p>
      <ProgressBar value={state.combat.monsterHp / activeMonster.maxHp} label="Enemy HP" detail={`${Math.max(0, Math.ceil(state.combat.monsterHp))} / ${activeMonster.maxHp}`} />
      <ProgressBar value={state.combat.playerProgressMs / playerStats.attackIntervalMs} label="Hero attack" detail={`${(playerStats.attackIntervalMs / 1000).toFixed(1)}s`} />
      <div className="map-combat-stats">
        <span className="inline-icon-value"><HeartPulse size={15} />HP {Math.max(0, Math.ceil(state.combat.playerHp))} / {maxHp}</span>
        <span>Max hit {playerStats.maxHit}</span>
        <span>Accuracy {playerStats.accuracy}</span>
      </div>
      <div className="combat-hit-line">
        {state.combat.lastHit ? state.combat.lastHit.missed ? `${state.combat.lastHit.source} missed` : `${state.combat.lastHit.source} hit ${state.combat.lastHit.amount}${state.combat.lastHit.critical ? ' critical' : ''}` : 'Waiting for first strike'}
      </div>
      <div className="food-strip">
        {food.length ? food.map(([itemId, quantity]) => (
          <button key={itemId} className="food-button" onClick={() => dispatch({ type: 'useFood', itemId })} title={`Eat ${items[itemId]?.name}`}>
            <ItemIcon itemId={itemId} quantity={quantity} />
          </button>
        )) : <span className="tiny-label">No food in bank</span>}
      </div>
      <button className="secondary-button" onClick={() => dispatch({ type: 'stopCombat' })}><Square size={16} />Flee encounter</button>
    </article>
  );
}

export function MapView() {
  const { state, dispatch } = useGame();
  const currentKey = coordKey(state.map.position);
  const destinationKey = state.map.destination ? coordKey(state.map.destination) : null;
  const selectedKey = state.map.selectedTileKey ?? currentKey;
  const selectedCoord = parseCoordKey(selectedKey);
  const selectedTile = state.map.knownTiles[selectedKey] ?? generateMapTile(state.map.seed, selectedCoord);
  const selectedRevealed = Boolean(state.map.revealed[selectedKey]);
  const selectedCurrent = selectedTile.key === currentKey;
  const selectedAdjacent = isAdjacentCoord(state.map.position, selectedTile.coord);
  const selectedCompleted = Boolean(state.map.completed[selectedTile.key]);
  const selectedPuzzle = selectedTile.puzzleId ? mapPuzzles[selectedTile.puzzleId] : null;
  const activePuzzle = selectedCurrent && !selectedCompleted && selectedPuzzle ? selectedPuzzle : null;
  const currentTile = getMapTile(state.map, state.map.position);
  const travelProgress = state.map.destination ? state.map.travelProgressMs / Math.max(1, state.map.travelIntervalMs) : 0;

  const visibleTiles = useMemo(() => {
    return getVisibleCoords(state.map.position, MAP_VIEW_RADIUS).map((coord) => {
      const key = coordKey(coord);
      return {
        coord,
        key,
        tile: state.map.knownTiles[key] ?? generateMapTile(state.map.seed, coord),
        revealed: Boolean(state.map.revealed[key]),
        completed: Boolean(state.map.completed[key]),
        current: isSameCoord(coord, state.map.position),
        destination: destinationKey === key,
        selected: selectedKey === key,
        adjacent: isAdjacentCoord(state.map.position, coord),
      };
    });
  }, [destinationKey, selectedKey, state.map.completed, state.map.knownTiles, state.map.position, state.map.revealed, state.map.seed]);

  const handleTileClick = (tile: MapTile, revealed: boolean, adjacent: boolean, current: boolean) => {
    if (!revealed) return;
    if (adjacent && !current && !state.map.destination && state.combat.mode === 'idle') {
      dispatch({ type: 'startMapTravel', x: tile.coord.x, y: tile.coord.y });
      return;
    }
    dispatch({ type: 'selectMapTile', x: tile.coord.x, y: tile.coord.y });
  };

  return (
    <section className={`main-view map-view ${state.settings.showMapLabels ? '' : 'hide-map-labels'}`}>
      <div className="view-header" style={{ '--view-color': currentTile.color } as CSSProperties}>
        <div className="view-title-block">
          <span className="view-icon"><MapIcon size={24} strokeWidth={2.35} /></span>
          <span className="eyebrow">Procedural map seed {state.map.seed}</span>
          <h2>{currentTile.name}</h2>
          <p>Navigate the fog one step at a time. Secrets, puzzles, NPCs and fights are discovered by travelling through the grid.</p>
        </div>
        <div className="level-badge map-coordinate-badge">
          <span>Position</span>
          <strong>{state.map.position.x},{state.map.position.y}</strong>
        </div>
      </div>

      <div className="map-status-strip">
        <div className="map-status-card">
          <span className="inline-icon-value"><Compass size={16} />Current</span>
          <strong>{currentTile.biome}</strong>
        </div>
        <div className="map-status-card">
          <span>Discovered</span>
          <strong>{Object.keys(state.map.revealed).length}</strong>
        </div>
        <div className="map-status-card">
          <span>Secrets</span>
          <strong>{state.map.secretsFound}</strong>
        </div>
        <div className="map-status-card wide">
          <ProgressBar value={travelProgress} label={state.map.destination ? 'Travelling' : 'Ready'} detail={state.map.destination ? `${Math.round(travelProgress * 100)}%` : 'Choose an adjacent tile'} />
        </div>
      </div>

      <div className="map-layout">
        <div className="adventure-grid" style={{ '--map-size': MAP_VIEW_RADIUS * 2 + 1 } as CSSProperties}>
          {visibleTiles.map(({ tile, key, revealed, completed, current, destination, selected, adjacent }) => {
            const Icon = getMapTileIcon(tile.type);
            return (
              <button
                key={key}
                className={`map-tile ${revealed ? 'revealed' : 'hidden'} ${current ? 'current' : ''} ${destination ? 'destination' : ''} ${selected ? 'selected' : ''} ${completed ? 'completed' : ''} ${adjacent ? 'adjacent' : ''} ${tile.type}`}
                style={{ '--tile-color': tile.color } as CSSProperties}
                onClick={() => handleTileClick(tile, revealed, adjacent, current)}
                title={revealed ? tile.name : 'Uncharted fog'}
              >
                {revealed ? <Icon size={18} /> : <span className="fog-dot" />}
                {state.settings.showMapLabels && <span>{revealed ? mapTileMeta[tile.type].label : '?'}</span>}
                {tile.secret && revealed && !completed && <small>?</small>}
              </button>
            );
          })}
        </div>

        <aside className="map-detail-panel">
          {selectedRevealed ? (
            <>
              <div className="map-detail-head">
                <TileBadge tile={selectedTile} />
                <span>{selectedTile.coord.x},{selectedTile.coord.y}</span>
              </div>
              <h3>{selectedTile.name}</h3>
              <p>{selectedTile.description}</p>
              <div className="stat-grid">
                <span>Danger</span><strong>{selectedTile.danger}</strong>
                <span>Travel</span><strong>{(selectedTile.travelTimeMs / 1000).toFixed(1)}s</strong>
                <span>Status</span><strong>{selectedCompleted ? 'Completed' : selectedCurrent ? 'Here' : selectedAdjacent ? 'Adjacent' : 'Distant'}</strong>
              </div>
              {selectedTile.monsterId && <p className="map-hint"><Shield size={15} /> Encounter: {monstersById[selectedTile.monsterId]?.name}</p>}
              {selectedTile.rewards?.length ? <div className="reward-line">{selectedTile.rewards.map((reward, index) => <RewardPill key={`${selectedTile.key}-${index}`} reward={reward} />)}</div> : null}
              {!selectedCurrent && selectedAdjacent && (
                <button className="primary-button" disabled={Boolean(state.map.destination) || state.combat.mode !== 'idle'} onClick={() => dispatch({ type: 'startMapTravel', x: selectedTile.coord.x, y: selectedTile.coord.y })}>
                  <Compass size={16} />Travel
                </button>
              )}
              {selectedCurrent && !selectedCompleted && selectedTile.type !== 'encounter' && selectedTile.type !== 'boss' && selectedTile.type !== 'puzzle' && (
                <button className="primary-button" onClick={() => dispatch({ type: 'resolveMapTile', tileKey: selectedTile.key })}>
                  <Search size={16} />Search
                </button>
              )}
              {selectedCurrent && !selectedCompleted && (selectedTile.type === 'encounter' || selectedTile.type === 'boss') && state.combat.mode === 'idle' && (
                <button className="primary-button" onClick={() => dispatch({ type: 'resolveMapTile', tileKey: selectedTile.key })}>
                  <Swords size={16} />Engage
                </button>
              )}
              {activePuzzle && (
                <div className="puzzle-panel">
                  <h4>{activePuzzle.title}</h4>
                  <p>{activePuzzle.prompt}</p>
                  <div className="puzzle-choice-grid">
                    {activePuzzle.choices.map((choice) => (
                      <button key={choice.id} className="secondary-button" onClick={() => dispatch({ type: 'solveMapPuzzle', tileKey: selectedTile.key, choiceId: choice.id })}>{choice.label}</button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state compact">
              <h3>Uncharted fog</h3>
              <p>Move closer to reveal this tile.</p>
            </div>
          )}
        </aside>
      </div>

      <div className="map-lower-panels">
        <EncounterPanel />
        <article className="map-log-panel">
          <div className="panel-title-row"><Utensils size={18} /><h3>Expedition log</h3></div>
          {(state.map.mapLog.length ? state.map.mapLog : state.activityLog).slice(0, 6).map((entry) => (
            <div key={entry.id} className={`log-entry ${entry.tone}`}>
              {state.settings.showLogTimestamps && <span>{new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
              <p>{entry.message}</p>
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}
