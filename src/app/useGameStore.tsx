import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { actionsById } from '../data/actions';
import { items } from '../data/items';
import { shopUpgrades } from '../data/shop';
import { skillsById } from '../data/skills';
import type { EquipmentSlot, GameState, ItemId, SkillId, ViewId } from '../types/game';
import { syncAchievements } from '../systems/achievementSystem';
import { collectManualFood, processCombatTick, startDungeon, startMonsterFight, stopCombat } from '../systems/combatSystem';
import { getSkillLevel, meetsEquipmentRequirements } from '../systems/formulas';
import { processActiveAction, stopActiveAction } from '../systems/idleSystem';
import { clearSave, importSave, loadGame, saveGame } from '../systems/saveSystem';
import { addItem, addLog, cloneState, createInitialState, removeItem } from '../systems/stateUtils';

type StoreAction =
  | { type: 'tick'; deltaMs: number }
  | { type: 'selectView'; view: ViewId }
  | { type: 'selectSkill'; skillId: SkillId }
  | { type: 'startAction'; actionId: string }
  | { type: 'stopAction' }
  | { type: 'startCombat'; monsterId: string }
  | { type: 'startDungeon'; dungeonId: string }
  | { type: 'stopCombat' }
  | { type: 'equipItem'; itemId: ItemId }
  | { type: 'unequipItem'; slot: EquipmentSlot }
  | { type: 'useFood'; itemId: ItemId }
  | { type: 'sellItem'; itemId: ItemId; quantity: number }
  | { type: 'buyUpgrade'; upgradeId: string }
  | { type: 'dismissOffline' }
  | { type: 'toggleSetting'; key: keyof GameState['settings'] }
  | { type: 'replaceState'; state: GameState }
  | { type: 'importRawSave'; raw: string }
  | { type: 'resetGame' };

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<StoreAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

function getActiveSkillingName(state: GameState): string | null {
  const activeAction = state.activeActionId ? actionsById[state.activeActionId] : null;
  if (!activeAction) return null;
  return skillsById[activeAction.skillId]?.name ?? activeAction.name;
}

function reducer(state: GameState, action: StoreAction): GameState {
  if (action.type === 'replaceState') return action.state;
  if (action.type === 'resetGame') {
    clearSave();
    return createInitialState();
  }
  if (action.type === 'importRawSave') {
    const imported = importSave(action.raw);
    if (!imported) {
      const next = cloneState(state);
      addLog(next, 'danger', 'Import failed: invalid save data.');
      return next;
    }
    saveGame(imported);
    return imported;
  }

  const next = cloneState(state);

  switch (action.type) {
    case 'tick':
      processActiveAction(next, action.deltaMs);
      processCombatTick(next, action.deltaMs);
      syncAchievements(next);
      return next;

    case 'selectView':
      next.activeView = action.view;
      return next;

    case 'selectSkill':
      next.selectedSkill = action.skillId;
      next.activeView = 'skills';
      return next;

    case 'startAction': {
      const skillingAction = actionsById[action.actionId];
      if (!skillingAction) return next;
      const skill = skillsById[skillingAction.skillId];

      if (!skill.implemented || !next.skills[skill.id].unlocked) {
        addLog(next, 'warning', `${skill.name} is not ready yet.`);
        return next;
      }

      const level = getSkillLevel(next, skillingAction.skillId);
      if (level < skillingAction.levelRequired) {
        addLog(next, 'warning', `${skillingAction.name} requires ${skill.name} level ${skillingAction.levelRequired}.`);
        return next;
      }

      if (next.combat.mode !== 'idle') {
        addLog(next, 'warning', `Stop combat before starting ${skill.name}.`);
        return next;
      }

      const activeSkillingAction = next.activeActionId ? actionsById[next.activeActionId] : null;
      if (activeSkillingAction && activeSkillingAction.skillId !== skillingAction.skillId) {
        const activeSkillName = skillsById[activeSkillingAction.skillId]?.name ?? activeSkillingAction.name;
        addLog(next, 'warning', `Stop ${activeSkillName} before starting ${skill.name}.`);
        return next;
      }

      next.activeActionId = skillingAction.id;
      next.actionProgressMs = 0;
      next.selectedSkill = skillingAction.skillId;
      next.activeView = 'skills';
      addLog(next, 'info', `${skillingAction.name} started.`);
      return next;
    }

    case 'stopAction':
      stopActiveAction(next);
      return next;

    case 'startCombat': {
      const activeSkillName = getActiveSkillingName(next);
      if (activeSkillName) {
        addLog(next, 'warning', `Stop ${activeSkillName} before starting combat.`);
        return next;
      }
      startMonsterFight(next, action.monsterId);
      return next;
    }

    case 'startDungeon': {
      const activeSkillName = getActiveSkillingName(next);
      if (activeSkillName) {
        addLog(next, 'warning', `Stop ${activeSkillName} before starting combat.`);
        return next;
      }
      startDungeon(next, action.dungeonId);
      return next;
    }

    case 'stopCombat':
      stopCombat(next);
      addLog(next, 'info', 'Combat stopped.');
      return next;

    case 'equipItem': {
      const item = items[action.itemId];
      if (!item?.equipment) {
        addLog(next, 'warning', 'That item cannot be equipped.');
        return next;
      }
      if (!meetsEquipmentRequirements(next, item)) {
        addLog(next, 'warning', `${item.name} requirements are not met.`);
        return next;
      }

      const slot = item.equipment.slot;
      if (!item.stackable && !removeItem(next, item.id, 1)) {
        addLog(next, 'warning', `${item.name} is not in the bank.`);
        return next;
      }

      const previous = next.equipment[slot];
      if (previous && previous !== item.id) {
        const previousItem = items[previous];
        if (!previousItem?.stackable) addItem(next, previous, 1);
      }

      next.equipment[slot] = item.id;
      addLog(next, 'success', `${item.name} equipped.`);
      return next;
    }

    case 'unequipItem': {
      const itemId = next.equipment[action.slot];
      if (!itemId) return next;
      const item = items[itemId];
      if (!item?.stackable && !addItem(next, itemId, 1)) return next;
      next.equipment[action.slot] = null;
      addLog(next, 'info', `${item?.name ?? itemId} unequipped.`);
      return next;
    }

    case 'useFood':
      collectManualFood(next, action.itemId);
      return next;

    case 'sellItem': {
      const item = items[action.itemId];
      if (!item || item.sellValue <= 0) return next;
      const owned = next.bank[action.itemId] ?? 0;
      const quantity = Math.max(1, Math.min(action.quantity, owned));
      if (!removeItem(next, action.itemId, quantity)) return next;
      const gp = item.sellValue * quantity;
      next.gp += gp;
      addLog(next, 'success', `Sold ${quantity} ${item.name} for ${gp} GP.`);
      return next;
    }

    case 'buyUpgrade': {
      const upgrade = shopUpgrades.find((entry) => entry.id === action.upgradeId);
      if (!upgrade) return next;
      const purchases = next.shopPurchases[upgrade.id] ?? 0;
      if (purchases >= upgrade.maxPurchases) {
        addLog(next, 'warning', `${upgrade.name} is already maxed.`);
        return next;
      }
      if (next.gp < upgrade.cost) {
        addLog(next, 'warning', `Need ${upgrade.cost} GP for ${upgrade.name}.`);
        return next;
      }

      next.gp -= upgrade.cost;
      next.shopPurchases[upgrade.id] = purchases + 1;
      if (upgrade.id === 'bank_slot_bundle') {
        next.bankSlots += 8;
      }
      addLog(next, 'success', `${upgrade.name} purchased.`);
      return next;
    }

    case 'dismissOffline':
      next.offlineSummary = null;
      return next;

    case 'toggleSetting':
      next.settings[action.key] = !next.settings[action.key];
      return next;

    default:
      return next;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadGame);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let last = performance.now();
    const intervalId = window.setInterval(() => {
      const now = performance.now();
      const deltaMs = Math.min(1000, now - last);
      last = now;
      dispatch({ type: 'tick', deltaMs });
    }, 200);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const saveInterval = window.setInterval(() => saveGame(stateRef.current), 2500);
    const saveBeforeUnload = () => saveGame(stateRef.current);
    window.addEventListener('beforeunload', saveBeforeUnload);

    return () => {
      window.clearInterval(saveInterval);
      window.removeEventListener('beforeunload', saveBeforeUnload);
      saveGame(stateRef.current);
    };
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
