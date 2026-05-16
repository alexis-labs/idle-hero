import { CheckCircle2, CircleDot, Coins, Gift, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { achievements, achievementCategories, type AchievementCategory } from '../data/achievements';
import { useGame } from '../app/useGameStore';
import { items } from '../data/items';
import { getAchievementProgress, getAchievementScore } from '../systems/achievementSystem';
import { formatNumber } from '../systems/formulas';
import type { RewardRoll } from '../types/game';
import { ItemIcon } from './ItemIcon';
import { ProgressBar } from './ProgressBar';

type GoalFilter = 'all' | AchievementCategory;

function rewardQuantity(reward: RewardRoll): number {
  return reward.quantity ?? reward.minQuantity ?? 1;
}

function RewardChip({ reward }: { reward: RewardRoll }) {
  if (reward.gp) {
    return <span className="reward-chip money-chip"><Coins size={15} />{reward.gp * rewardQuantity(reward)} GP</span>;
  }

  if (!reward.itemId) return <span className="reward-chip"><Gift size={15} />Reward</span>;
  return (
    <span className="reward-chip">
      <ItemIcon itemId={reward.itemId} quantity={rewardQuantity(reward)} />
      {items[reward.itemId]?.name ?? reward.itemId}
    </span>
  );
}

export function AchievementsView() {
  const { state } = useGame();
  const [filter, setFilter] = useState<GoalFilter>('all');
  const unlocked = achievements.filter((achievement) => state.achievements[achievement.id]).length;
  const score = getAchievementScore(state);
  const maxScore = achievements.reduce((total, achievement) => total + achievement.points, 0);
  const goalRows = useMemo(() => {
    return achievements.map((achievement) => ({
      achievement,
      done: Boolean(state.achievements[achievement.id]),
      progress: getAchievementProgress(state, achievement),
    }));
  }, [state]);
  const filteredGoals = goalRows
    .filter(({ achievement }) => filter === 'all' || achievement.category === filter)
    .sort((left, right) => {
      if (left.done !== right.done) return left.done ? 1 : -1;
      return right.progress.ratio - left.progress.ratio || right.achievement.points - left.achievement.points;
    });
  const nextGoal = goalRows.filter((goal) => !goal.done).sort((left, right) => right.progress.ratio - left.progress.ratio)[0];

  return (
    <section className="main-view achievements-view">
      <div className="view-header" style={{ '--view-color': '#facc15' } as CSSProperties}>
        <div>
          <span className="eyebrow">Milestones</span>
          <h2>Goals</h2>
          <p>{unlocked} / {achievements.length} completed. Score {formatNumber(score, state.settings.compactNumbers)} / {formatNumber(maxScore, state.settings.compactNumbers)}.</p>
        </div>
        <div className="goal-score-stack">
          <div className="level-badge"><span>Score</span><strong>{score}</strong></div>
          {nextGoal && <div className="level-badge"><span>Next</span><strong>{Math.round(nextGoal.progress.ratio * 100)}%</strong></div>}
        </div>
      </div>

      <div className="goal-toolbar">
        <div className="category-tabs" aria-label="Goal categories">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          {achievementCategories.map((category) => (
            <button key={category.id} className={filter === category.id ? 'active' : ''} onClick={() => setFilter(category.id)}>{category.label}</button>
          ))}
        </div>
      </div>

      <div className="achievement-grid">
        {filteredGoals.map(({ achievement, done, progress }) => {
          const StateIcon = done ? CheckCircle2 : CircleDot;
          return (
            <article key={achievement.id} className={`achievement-card ${done ? 'done' : ''} ${achievement.tier}`}>
              <span className="achievement-icon"><Trophy size={21} /></span>
              <div className="achievement-content">
                <div className="achievement-title-row">
                  <h3>{achievement.name}</h3>
                  <span className={`tier-pill ${achievement.tier}`}>{achievement.tier}</span>
                </div>
                <div className="achievement-meta">
                  <span>{achievement.category}</span>
                  <span>{achievement.points} pts</span>
                </div>
                <p>{achievement.description}</p>
                <ProgressBar value={done ? 1 : progress.ratio} label={done ? 'Completed' : 'Progress'} detail={progress.label} />
                {achievement.reward?.length ? (
                  <div className="reward-line goal-rewards">
                    <span className="tiny-label">Reward</span>
                    {achievement.reward.map((reward, index) => <RewardChip key={`${achievement.id}-reward-${index}`} reward={reward} />)}
                  </div>
                ) : null}
              </div>
              <span className={`goal-state ${done ? 'done' : ''}`}><StateIcon size={15} />{done ? 'Done' : `${Math.round(progress.ratio * 100)}%`}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
