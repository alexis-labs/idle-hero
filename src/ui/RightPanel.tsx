import { Activity, Compass, PackageCheck, Shirt, Sparkles } from 'lucide-react';
import { useGame } from '../app/useGameStore';
import { actionsById } from '../data/actions';
import { equipmentSlots, items } from '../data/items';
import { skillsById } from '../data/skills';
import { formatNumber, getEquipmentStats, getMaxPlayerHp, getSkillLevel } from '../systems/formulas';
import { Coins } from './iconMaps';
import { ItemIcon } from './ItemIcon';

export function RightPanel() {
  const { state, dispatch } = useGame();
  const activeAction = state.activeActionId ? actionsById[state.activeActionId] : null;
  const selectedSkill = skillsById[state.selectedSkill];
  const equipmentStats = getEquipmentStats(state);
  const petCount = Object.values(state.pets).filter(Boolean).length;
  const activeMapTile = state.map.activeTileKey ? state.map.knownTiles[state.map.activeTileKey] : null;
  const selectedMapTile = state.map.selectedTileKey ? state.map.knownTiles[state.map.selectedTileKey] : null;

  return (
    <aside className="right-panel">
      <section className="side-card">
        <div className="panel-title-row"><Sparkles size={18} /><h2>Focus</h2></div>
        {activeAction ? (
          <div className="focus-block">
            <strong>{activeAction.name}</strong>
            <span>{skillsById[activeAction.skillId].name} level {getSkillLevel(state, activeAction.skillId)}</span>
            <span>{activeAction.area}</span>
          </div>
        ) : state.combat.mode !== 'idle' ? (
          <div className="focus-block">
            <strong>Map encounter</strong>
            <span>{activeMapTile?.name ?? 'Threat active'}</span>
            <span>HP {Math.ceil(state.combat.playerHp)} / {getMaxPlayerHp(state)}</span>
          </div>
        ) : state.map.destination ? (
          <div className="focus-block">
            <strong>Travelling</strong>
            <span>From {state.map.position.x},{state.map.position.y} to {state.map.destination.x},{state.map.destination.y}</span>
            <span>{Math.round((state.map.travelProgressMs / Math.max(1, state.map.travelIntervalMs)) * 100)}% complete</span>
          </div>
        ) : state.activeView === 'map' ? (
          <div className="focus-block">
            <strong>{selectedMapTile?.name ?? activeMapTile?.name ?? 'Exploration map'}</strong>
            <span>Position {state.map.position.x},{state.map.position.y}</span>
            <span>{Object.keys(state.map.revealed).length} tiles discovered</span>
          </div>
        ) : (
          <div className="focus-block">
            <strong>{selectedSkill.name}</strong>
            <span>Ready for a new action</span>
            <span>{selectedSkill.category}</span>
          </div>
        )}
      </section>

      <section className="side-card">
        <div className="panel-title-row"><Shirt size={18} /><h2>Equipment</h2></div>
        <div className="equipment-grid">
          {equipmentSlots.map((slot) => {
            const itemId = state.equipment[slot.id];
            return (
              <button key={slot.id} className="equipment-slot" onClick={() => dispatch({ type: 'unequipItem', slot: slot.id })} title={itemId ? `Unequip ${items[itemId]?.name}` : slot.label}>
                <span>{slot.label}</span>
                {itemId ? <ItemIcon itemId={itemId} /> : <strong>Empty</strong>}
              </button>
            );
          })}
        </div>
        <div className="stat-grid compact-stats">
          <span>Attack</span><strong>{equipmentStats.attack}</strong>
          <span>Strength</span><strong>{equipmentStats.strength}</strong>
          <span>Defence</span><strong>{equipmentStats.defence}</strong>
          <span>Ranged</span><strong>{equipmentStats.ranged}</strong>
          <span>Magic</span><strong>{equipmentStats.magic}</strong>
          <span>Max hit</span><strong>{equipmentStats.maxHit}</strong>
        </div>
      </section>

      <section className="side-card">
        <div className="panel-title-row"><PackageCheck size={18} /><h2>Collections</h2></div>
        <div className="collection-row">
          <span>Pets</span><strong>{petCount}</strong>
          <span className="inline-icon-value"><Compass size={14} />Discovered</span><strong>{Object.keys(state.map.revealed).length}</strong>
          <span>Bosses defeated</span><strong>{state.map.bossesDefeated}</strong>
          <span>Secrets found</span><strong>{state.map.secretsFound}</strong>
          <span>Achievements</span><strong>{Object.values(state.achievements).filter(Boolean).length}</strong>
          <span>Total GP</span><strong className="inline-icon-value"><Coins size={14} />{formatNumber(state.gp, state.settings.compactNumbers)}</strong>
        </div>
      </section>

      <section className="side-card log-card">
        <div className="panel-title-row"><Activity size={18} /><h2>Log</h2></div>
        <div className="activity-log">
          {state.activityLog.slice(0, 10).map((entry) => (
            <div key={entry.id} className={`log-entry ${entry.tone}`}>
              {state.settings.showLogTimestamps && <span>{new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
              <p>{entry.message}</p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
