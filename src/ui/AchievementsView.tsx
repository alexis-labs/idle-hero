import { Trophy } from 'lucide-react';
import { achievements } from '../data/achievements';
import { useGame } from '../app/useGameStore';

export function AchievementsView() {
  const { state } = useGame();
  const unlocked = achievements.filter((achievement) => state.achievements[achievement.id]).length;

  return (
    <section className="main-view achievements-view">
      <div className="view-header">
        <div>
          <span className="eyebrow">Milestones</span>
          <h2>Goals</h2>
          <p>{unlocked} / {achievements.length} completed.</p>
        </div>
        <div className="level-badge"><span>Score</span><strong>{unlocked}</strong></div>
      </div>

      <div className="achievement-grid">
        {achievements.map((achievement) => {
          const done = state.achievements[achievement.id];
          return (
            <article key={achievement.id} className={`achievement-card ${done ? 'done' : ''}`}>
              <Trophy size={22} />
              <div>
                <h3>{achievement.name}</h3>
                <p>{achievement.description}</p>
              </div>
              <span>{done ? 'Done' : 'Open'}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
