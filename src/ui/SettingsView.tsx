import { useGame } from '../app/useGameStore';

export function SettingsView() {
  const { state, dispatch } = useGame();

  return (
    <section className="main-view settings-view">
      <div className="view-header">
        <div>
          <span className="eyebrow">Preferences</span>
          <h2>Settings</h2>
          <p>Local options for the prototype.</p>
        </div>
      </div>

      <div className="settings-list">
        <label className="setting-row">
          <span>
            <strong>Compact numbers</strong>
            <small>Shortens large quantities in the UI.</small>
          </span>
          <input type="checkbox" checked={state.settings.compactNumbers} onChange={() => dispatch({ type: 'toggleSetting', key: 'compactNumbers' })} />
        </label>
        <label className="setting-row">
          <span>
            <strong>Reduce motion</strong>
            <small>Reserves the setting for a lower-motion visual mode.</small>
          </span>
          <input type="checkbox" checked={state.settings.reduceMotion} onChange={() => dispatch({ type: 'toggleSetting', key: 'reduceMotion' })} />
        </label>
      </div>
    </section>
  );
}
