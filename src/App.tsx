import { GameProvider, useGame } from './app/useGameStore';
import { GameCanvas } from './game/GameCanvas';
import { AchievementsView } from './ui/AchievementsView';
import { BankView } from './ui/BankView';
import { MapView } from './ui/MapView';
import { OfflineModal } from './ui/OfflineModal';
import { RightPanel } from './ui/RightPanel';
import { SettingsView } from './ui/SettingsView';
import { ShopView } from './ui/ShopView';
import { Sidebar } from './ui/Sidebar';
import { SkillView } from './ui/SkillView';
import { TopBar } from './ui/TopBar';

function CurrentView() {
  const { state } = useGame();

  if (state.activeView === 'map') return <MapView />;
  if (state.activeView === 'bank') return <BankView />;
  if (state.activeView === 'shop') return <ShopView />;
  if (state.activeView === 'achievements') return <AchievementsView />;
  if (state.activeView === 'settings') return <SettingsView />;
  return <SkillView />;
}

function GameShell() {
  const { state } = useGame();

  return (
    <div className="app-shell">
      <GameCanvas state={state} />
      <div className="ui-shell">
        <TopBar />
        <Sidebar />
        <main className="main-panel">
          <CurrentView />
        </main>
        <RightPanel />
      </div>
      <OfflineModal />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  );
}
