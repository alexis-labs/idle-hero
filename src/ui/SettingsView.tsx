import { useGame } from '../app/useGameStore';
import type { GameState } from '../types/game';

type SettingKey = keyof GameState['settings'];

interface SettingOption {
  key: SettingKey;
  label: string;
  description: string;
}

const settingGroups: { title: string; eyebrow: string; options: SettingOption[] }[] = [
  {
    title: 'Display',
    eyebrow: 'Interface',
    options: [
      { key: 'compactNumbers', label: 'Compact numbers', description: 'Shortens large quantities in the UI.' },
      { key: 'highContrastMode', label: 'High contrast mode', description: 'Boosts borders and panels for better readability.' },
      { key: 'denseBank', label: 'Dense bank grid', description: 'Fits more item slots into the bank at once.' },
      { key: 'showMapLabels', label: 'Map tile labels', description: 'Shows type labels inside the exploration grid.' },
      { key: 'showLogTimestamps', label: 'Log timestamps', description: 'Shows times next to activity and expedition log entries.' },
    ],
  },
  {
    title: 'Comfort',
    eyebrow: 'Gameplay feel',
    options: [
      { key: 'reduceMotion', label: 'Reduce motion', description: 'Calms panel animations and background scene movement.' },
      { key: 'showBackgroundScene', label: 'Animated background scene', description: 'Renders the 3D hero backdrop behind the interface.' },
      { key: 'hideLockedSkills', label: 'Hide locked skills', description: 'Keeps the sidebar focused on playable skills.' },
      { key: 'confirmReset', label: 'Confirm reset', description: 'Asks before wiping the current local save.' },
    ],
  },
];

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
        {settingGroups.map((group) => (
          <section key={group.title} className="settings-section">
            <div className="settings-section-header">
              <span className="eyebrow">{group.eyebrow}</span>
              <h3>{group.title}</h3>
            </div>
            <div className="settings-grid">
              {group.options.map((option) => (
                <label key={option.key} className="setting-row">
                  <span className="setting-copy">
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                  <input type="checkbox" checked={state.settings[option.key]} onChange={() => dispatch({ type: 'toggleSetting', key: option.key })} aria-label={option.label} />
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
