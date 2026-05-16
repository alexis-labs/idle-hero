import { HeartPulse, Play, Shield, Square, Swords } from 'lucide-react';
import { useGame } from '../app/useGameStore';
import { actionsById } from '../data/actions';
import { items } from '../data/items';
import { dungeons, monsters, monstersById } from '../data/monsters';
import { skillsById } from '../data/skills';
import { formatNumber, getMaxPlayerHp, getPlayerCombatStats, getSkillLevel } from '../systems/formulas';
import { ItemIcon } from './ItemIcon';
import { ProgressBar } from './ProgressBar';

export function CombatView() {
  const { state, dispatch } = useGame();
  const activeMonster = state.combat.activeMonsterId ? monstersById[state.combat.activeMonsterId] : null;
  const playerStats = getPlayerCombatStats(state);
  const maxHp = getMaxPlayerHp(state);
  const food = Object.entries(state.bank).filter(([itemId, quantity]) => quantity > 0 && Boolean(items[itemId]?.healAmount));
  const activeSkillingAction = state.activeActionId ? actionsById[state.activeActionId] : null;
  const activeSkillName = activeSkillingAction ? skillsById[activeSkillingAction.skillId]?.name : null;
  const combatBlocked = Boolean(activeSkillingAction);
  const combatBlockedTitle = activeSkillName ? `Stop ${activeSkillName} first` : undefined;

  return (
    <section className="main-view combat-view">
      <div className="view-header combat-header">
        <div>
          <span className="eyebrow">Combat</span>
          <h2>Battle Training</h2>
          <p>Train Attack, Strength, Defence, Hitpoints, Ranged and Magic through repeatable encounters.</p>
        </div>
        <div className="combat-stat-stack">
          <span className="inline-icon-value"><HeartPulse size={16} />HP {Math.max(0, Math.ceil(state.combat.playerHp))} / {maxHp}</span>
          <ProgressBar value={state.combat.playerHp / maxHp} />
        </div>
      </div>

      <div className="combat-dashboard">
        <article className="combat-panel primary-combat-panel">
          <div className="panel-title-row">
            <Swords size={18} />
            <h3>{activeMonster ? activeMonster.name : 'No enemy selected'}</h3>
          </div>
          {activeMonster ? (
            <>
              <ProgressBar value={state.combat.monsterHp / activeMonster.maxHp} label="Enemy HP" detail={`${Math.max(0, Math.ceil(state.combat.monsterHp))} / ${activeMonster.maxHp}`} />
              <ProgressBar value={state.combat.playerProgressMs / playerStats.attackIntervalMs} label="Hero attack" detail={`${(playerStats.attackIntervalMs / 1000).toFixed(1)}s`} />
              <div className="combat-hit-line">
                {state.combat.lastHit ? state.combat.lastHit.missed ? `${state.combat.lastHit.source} missed` : `${state.combat.lastHit.source} hit ${state.combat.lastHit.amount}${state.combat.lastHit.critical ? ' critical' : ''}` : 'Waiting for first hit'}
              </div>
              <button className="secondary-button" onClick={() => dispatch({ type: 'stopCombat' })}><Square size={16} />Stop combat</button>
            </>
          ) : (
            <p className="muted-copy">Pick an enemy or dungeon to start a combat loop.</p>
          )}
        </article>

        <article className="combat-panel stats-panel">
          <div className="panel-title-row"><Shield size={18} /><h3>Hero stats</h3></div>
          <div className="stat-grid">
            <span>Accuracy</span><strong>{playerStats.accuracy}</strong>
            <span>Defence</span><strong>{playerStats.defence}</strong>
            <span>Max hit</span><strong>{playerStats.maxHit}</strong>
            <span>Interval</span><strong>{(playerStats.attackIntervalMs / 1000).toFixed(1)}s</strong>
          </div>
          <div className="food-strip">
            {food.length ? food.map(([itemId, quantity]) => (
              <button key={itemId} className="food-button" onClick={() => dispatch({ type: 'useFood', itemId })} title={`Eat ${items[itemId]?.name}`}>
                <ItemIcon itemId={itemId} quantity={quantity} />
              </button>
            )) : <span className="tiny-label">No food in bank</span>}
          </div>
        </article>
      </div>

      <div className="monster-grid">
        {monsters.filter((monster) => !monster.isBoss).map((monster) => {
          const active = state.combat.activeMonsterId === monster.id && state.combat.mode === 'monster';
          return (
            <article key={monster.id} className={`monster-card ${active ? 'active' : ''}`} style={{ '--card-color': monster.color } as React.CSSProperties}>
              <div>
                <h3>{monster.name}</h3>
                <span>{monster.zone}</span>
              </div>
              <div className="monster-stats">
                <span>Lvl {monster.level}</span>
                <span>{monster.maxHp} HP</span>
                <span>Max {monster.stats.maxHit}</span>
              </div>
              <button className="primary-button" disabled={combatBlocked} title={combatBlockedTitle} onClick={() => dispatch({ type: 'startCombat', monsterId: monster.id })}><Play size={16} />{combatBlocked ? 'Skill active' : 'Fight'}</button>
            </article>
          );
        })}
      </div>

      <div className="dungeon-row">
        {dungeons.map((dungeon) => (
          <article key={dungeon.id} className="dungeon-card" style={{ '--card-color': dungeon.color } as React.CSSProperties}>
            <div>
              <span className="eyebrow">Dungeon</span>
              <h3>{dungeon.name}</h3>
              <p>{dungeon.description}</p>
              <span>Required combat level {dungeon.levelRequired}. Current {Math.max(getSkillLevel(state, 'attack'), getSkillLevel(state, 'strength'), getSkillLevel(state, 'defence'))}</span>
            </div>
            <button className="primary-button" disabled={combatBlocked} title={combatBlockedTitle} onClick={() => dispatch({ type: 'startDungeon', dungeonId: dungeon.id })}><Play size={16} />{combatBlocked ? 'Skill active' : 'Start'}</button>
          </article>
        ))}
      </div>
    </section>
  );
}
