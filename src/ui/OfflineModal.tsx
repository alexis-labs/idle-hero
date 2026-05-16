import { Clock } from 'lucide-react';
import { useGame } from '../app/useGameStore';
import { skillsById } from '../data/skills';
import { formatNumber } from '../systems/formulas';

export function OfflineModal() {
  const { state, dispatch } = useGame();
  const summary = state.offlineSummary;
  if (!summary) return null;

  const minutes = Math.floor(summary.secondsAway / 60);
  const seconds = summary.secondsAway % 60;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="offline-title">
        <div className="modal-title-row">
          <Clock size={22} />
          <h2 id="offline-title">Offline gains</h2>
        </div>
        <p className="muted-copy">
          Away for {minutes}m {seconds}s{summary.capped ? ' (24h cap applied)' : ''}.
        </p>
        {summary.actionName ? (
          <div className="offline-grid">
            <span>Action</span>
            <strong>{summary.actionName}</strong>
            <span>Completions</span>
            <strong>{formatNumber(summary.completions, state.settings.compactNumbers)}</strong>
            {Object.entries(summary.xp).map(([skillId, xp]) => (
              <span key={skillId}>{skillsById[skillId as keyof typeof skillsById].name} XP</span>
            ))}
            {Object.entries(summary.xp).map(([skillId, xp]) => (
              <strong key={`${skillId}-xp`}>{formatNumber(xp ?? 0, state.settings.compactNumbers)}</strong>
            ))}
            {summary.rewards.map((reward) => (
              <span key={reward.label}>{reward.label}</span>
            ))}
            {summary.rewards.map((reward) => (
              <strong key={`${reward.label}-qty`}>{formatNumber(reward.quantity, state.settings.compactNumbers)}</strong>
            ))}
          </div>
        ) : (
          <p>No active action was running.</p>
        )}
        <button className="primary-button" onClick={() => dispatch({ type: 'dismissOffline' })}>OK</button>
      </section>
    </div>
  );
}
