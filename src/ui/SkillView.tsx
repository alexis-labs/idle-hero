import { Play, Square } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useGame } from '../app/useGameStore';
import { actionsById, getActionsForSkill } from '../data/actions';
import { items } from '../data/items';
import { skillsById } from '../data/skills';
import { formatNumber, getLevelProgress, getSkillLevel } from '../systems/formulas';
import type { ActionDefinition, RewardRoll } from '../types/game';
import { Coins, getActionShapeIcon, getSkillIcon } from './iconMaps';
import { ItemIcon } from './ItemIcon';
import { ProgressBar } from './ProgressBar';

function rewardQuantity(reward: RewardRoll): number {
  return reward.quantity ?? reward.minQuantity ?? 1;
}

function RewardChip({ reward }: { reward: RewardRoll }) {
  if (reward.gp) {
    return <span className="reward-chip money-chip"><Coins size={15} />{reward.gp} GP</span>;
  }

  if (!reward.itemId) return <span className="reward-chip">Reward</span>;
  return (
    <span className="reward-chip">
      <ItemIcon itemId={reward.itemId} quantity={rewardQuantity(reward)} />
      {items[reward.itemId]?.name ?? reward.itemId}
    </span>
  );
}

function ActionCard({ action }: { action: ActionDefinition }) {
  const { state, dispatch } = useGame();
  const level = getSkillLevel(state, action.skillId);
  const active = state.activeActionId === action.id;
  const activeSkillingAction = state.activeActionId ? actionsById[state.activeActionId] : null;
  const activeSkillName = activeSkillingAction ? skillsById[activeSkillingAction.skillId]?.name : null;
  const blockedByOtherSkill = Boolean(activeSkillingAction && activeSkillingAction.skillId !== action.skillId);
  const blockedByCombat = state.combat.mode !== 'idle';
  const levelLocked = level < action.levelRequired;
  const canStart = !levelLocked && !blockedByCombat;
  const progress = active ? state.actionProgressMs / action.intervalMs : 0;
  const ActionIcon = getActionShapeIcon(action.visual.shape);
  const startLabel = levelLocked ? `Level ${action.levelRequired}` : blockedByCombat ? 'Combat active' : blockedByOtherSkill ? 'Switch' : 'Start';
  const disabledReason = blockedByCombat ? 'Stop combat first' : blockedByOtherSkill && activeSkillName ? `Stops ${activeSkillName}` : undefined;

  return (
    <article className={`action-card ${active ? 'active' : ''}`} style={{ '--card-color': action.visual.color } as CSSProperties}>
      <div className="action-card-head">
        <span className="action-icon" style={{ '--action-color': action.visual.color } as CSSProperties}><ActionIcon size={19} strokeWidth={2.35} /></span>
        <div>
          <h3>{action.name}</h3>
          <span>{action.area}</span>
        </div>
        <strong>{(action.intervalMs / 1000).toFixed(1)}s</strong>
      </div>
      <p>{action.description}</p>
      <div className="action-meta-grid">
        <span>Level</span><strong>{action.levelRequired}</strong>
        <span>XP</span><strong>{action.xp}</strong>
        <span>Mastery</span><strong>{action.masteryXp}</strong>
      </div>
      <div className="item-row compact">
        {action.inputs?.length ? action.inputs.map((input) => <ItemIcon key={input.itemId} itemId={input.itemId} quantity={input.quantity} muted={(state.bank[input.itemId] ?? 0) < input.quantity} />) : <span className="tiny-label">No inputs</span>}
      </div>
      <div className="reward-line">{action.outputs.map((reward, index) => <RewardChip key={`${action.id}-reward-${index}`} reward={reward} />)}</div>
      <ProgressBar value={progress} label={active ? 'Progress' : ''} detail={active ? `${Math.round(progress * 100)}%` : ''} />
      <button className={active ? 'secondary-button' : 'primary-button'} disabled={!active && !canStart} title={disabledReason} onClick={() => dispatch(active ? { type: 'stopAction' } : { type: 'startAction', actionId: action.id })}>
        {active ? <Square size={16} /> : <Play size={16} />}
        {active ? 'Stop' : startLabel}
      </button>
    </article>
  );
}

export function SkillView() {
  const { state } = useGame();
  const skill = skillsById[state.selectedSkill];
  const actions = getActionsForSkill(skill.id);
  const level = getSkillLevel(state, skill.id);
  const progress = getLevelProgress(state, skill.id);
  const skillState = state.skills[skill.id];
  const SkillIcon = getSkillIcon(skill.id);

  return (
    <section className="main-view skill-view">
      <div className="view-header" style={{ '--view-color': skill.color } as CSSProperties}>
        <div className="view-title-block">
          <span className="view-icon"><SkillIcon size={24} strokeWidth={2.35} /></span>
          <span className="eyebrow">{skill.category}</span>
          <h2>{skill.name}</h2>
          <p>{skill.description}</p>
        </div>
        <div className="level-badge">
          <span>Level</span>
          <strong>{skill.implemented ? level : 'Soon'}</strong>
        </div>
      </div>

      {skill.implemented ? (
        <>
          <div className="skill-summary-strip">
            <ProgressBar value={progress} label="Level progress" detail={`${Math.round(progress * 100)}%`} />
            <div><span>Total XP</span><strong>{formatNumber(skillState.xp, state.settings.compactNumbers)}</strong></div>
            <div><span>Mastery XP</span><strong>{formatNumber(skillState.masteryXp, state.settings.compactNumbers)}</strong></div>
          </div>
          <div className="action-grid">
            {actions.map((action) => <ActionCard key={action.id} action={action} />)}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <h3>{skill.lockedNote ?? 'Coming soon'}</h3>
          <p>This skill is present in the account plan and will plug into the same XP, bank, and mastery systems.</p>
        </div>
      )}
    </section>
  );
}
