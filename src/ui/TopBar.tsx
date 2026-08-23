import { Activity, Backpack, Compass, Crown, Download, Hammer, RotateCcw, Save, Swords, Upload, HelpCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { useGame } from '../app/useGameStore';
import { exportSave, saveGame } from '../systems/saveSystem';
import { formatNumber, getUsedBankSlots } from '../systems/formulas';
import { Coins } from './iconMaps';
import { TutorialModal } from './TutorialModal';

export function TopBar() {
  const { state, dispatch } = useGame();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const StatusIcon = state.activeActionId ? Hammer : state.combat.mode !== 'idle' ? Swords : state.map.destination ? Compass : Activity;
  const statusLabel = state.activeActionId ? 'Skilling' : state.combat.mode !== 'idle' ? 'Encounter' : state.map.destination ? 'Travelling' : state.activeView === 'map' ? 'Exploring' : 'Idle';

  const exportCurrentSave = () => {
    const blob = new Blob([exportSave(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'idle-hero-save.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importSelectedSave = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      dispatch({ type: 'importRawSave', raw: String(reader.result ?? '') });
    };
    reader.readAsText(file);
  };

  const resetGame = () => {
    if (!state.settings.confirmReset || window.confirm('Reset Idle Hero?')) {
      dispatch({ type: 'resetGame' });
    }
  };

  return (
    <>
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      <header className="top-bar">
        <div className="brand-lockup">
          <div className="brand-mark"><Crown size={21} /></div>
          <div>
            <h1>Idle Hero</h1>
            <span>{state.mode} mode</span>
          </div>
        </div>
        <div className="top-stats">
          <span className="stat-chip money-chip"><Coins size={16} />{formatNumber(state.gp, state.settings.compactNumbers)} GP</span>
          <span className="stat-chip"><Backpack size={16} />Bank {getUsedBankSlots(state)} / {state.bankSlots}</span>
          <span className="stat-chip"><StatusIcon size={16} />{statusLabel}</span>
          {state.activeView === 'map' && <span className="stat-chip"><Compass size={16} />{state.map.position.x},{state.map.position.y}</span>}
        </div>
        <div className="top-actions">
          <button title="Help & Tutorial" className="icon-button" onClick={() => setShowTutorial(true)}><HelpCircle size={18} /></button>
          <button title="Save now" className="icon-button" onClick={() => saveGame(state)}><Save size={18} /></button>
          <button title="Export save" className="icon-button" onClick={exportCurrentSave}><Download size={18} /></button>
          <button title="Import save" className="icon-button" onClick={() => inputRef.current?.click()}><Upload size={18} /></button>
          <button title="Reset game" className="icon-button danger" onClick={resetGame}><RotateCcw size={18} /></button>
          <input ref={inputRef} hidden type="file" accept="application/json" onChange={(event) => importSelectedSave(event.target.files?.[0])} />
        </div>
      </header>
    </>
  );
}
