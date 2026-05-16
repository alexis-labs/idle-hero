import { achievements } from '../data/achievements';
import { equipmentSlots, items, startingBank } from '../data/items';
import { skills, skillsById } from '../data/skills';
import type { EquipmentSlot, GameState, ItemId, ItemQuantity, LogEntry, RewardRoll, SkillId } from '../types/game';
import { getUsedBankSlots, levelForXp, rollQuantity, xpForLevel } from './formulas';

export const SAVE_VERSION = 1;

export function cloneState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState;
}

export function createInitialState(now = Date.now()): GameState {
  const skillState = skills.reduce((acc, skill) => {
    acc[skill.id] = {
      xp: skill.id === 'hitpoints' ? xpForLevel(5) : 0,
      masteryXp: 0,
      unlocked: skill.unlockedByDefault,
    };
    return acc;
  }, {} as GameState['skills']);

  const equipment = equipmentSlots.reduce((acc, slot) => {
    acc[slot.id] = null;
    return acc;
  }, {} as Record<EquipmentSlot, ItemId | null>);

  return {
    version: SAVE_VERSION,
    playerName: 'Idle Hero',
    mode: 'standard',
    gp: 50,
    bankSlots: 28,
    activeView: 'skills',
    selectedSkill: 'woodcutting',
    activeActionId: null,
    actionProgressMs: 0,
    skills: skillState,
    bank: { ...startingBank },
    equipment,
    combat: {
      mode: 'idle',
      selectedMonsterId: 'training_dummy',
      activeMonsterId: null,
      dungeonId: null,
      dungeonStep: 0,
      dungeonClears: 0,
      playerHp: 67,
      monsterHp: 0,
      playerProgressMs: 0,
      monsterProgressMs: 0,
      lastHit: null,
    },
    pets: {},
    achievements: achievements.reduce<Record<string, boolean>>((acc, achievement) => {
      acc[achievement.id] = false;
      return acc;
    }, {}),
    shopPurchases: {},
    activityLog: [
      {
        id: `log-${now}`,
        time: now,
        tone: 'info',
        message: 'Welcome to Idle Hero. Pick a skill or start combat.',
      },
    ],
    offlineSummary: null,
    settings: {
      reduceMotion: false,
      compactNumbers: true,
    },
    createdAt: now,
    lastSavedAt: now,
  };
}

export function addLog(state: GameState, tone: LogEntry['tone'], message: string): void {
  state.activityLog = [
    {
      id: `log-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      time: Date.now(),
      tone,
      message,
    },
    ...state.activityLog,
  ].slice(0, 40);
}

export function addSkillXp(state: GameState, skillId: SkillId, xp: number, masteryXp = 0): void {
  const skill = state.skills[skillId];
  if (!skill || xp <= 0) return;

  const beforeLevel = levelForXp(skill.xp);
  skill.xp += xp;
  skill.masteryXp += masteryXp;
  const afterLevel = levelForXp(skill.xp);

  if (afterLevel > beforeLevel) {
    addLog(state, 'success', `${skillsById[skillId].name} reached level ${afterLevel}.`);
  }
}

export function hasItems(state: GameState, requiredItems: ItemQuantity[] = []): boolean {
  return requiredItems.every((required) => (state.bank[required.itemId] ?? 0) >= required.quantity);
}

export function removeItem(state: GameState, itemId: ItemId, quantity: number): boolean {
  const current = state.bank[itemId] ?? 0;
  if (current < quantity) return false;

  const nextQuantity = current - quantity;
  if (nextQuantity <= 0) {
    delete state.bank[itemId];
  } else {
    state.bank[itemId] = nextQuantity;
  }

  return true;
}

export function consumeItems(state: GameState, requiredItems: ItemQuantity[] = []): boolean {
  if (!hasItems(state, requiredItems)) return false;
  requiredItems.forEach((required) => removeItem(state, required.itemId, required.quantity));
  return true;
}

export function addItem(state: GameState, itemId: ItemId, quantity: number): boolean {
  const item = items[itemId];
  if (!item || quantity <= 0) return false;

  if (item.type === 'pet') {
    state.pets[itemId] = true;
    addLog(state, 'success', `${item.name} joined your collection.`);
    return true;
  }

  const current = state.bank[itemId] ?? 0;
  if (current <= 0 && getUsedBankSlots(state) >= state.bankSlots) {
    addLog(state, 'warning', `Bank is full. ${item.name} was left behind.`);
    return false;
  }

  state.bank[itemId] = current + quantity;
  return true;
}

export function grantReward(state: GameState, reward: RewardRoll): { label: string; quantity: number } | null {
  const chance = reward.chance ?? 1;
  if (Math.random() > chance) return null;

  const quantity = rollQuantity(reward.minQuantity, reward.maxQuantity, reward.quantity);

  if (reward.gp && reward.gp > 0) {
    const amount = reward.gp * quantity;
    state.gp += amount;
    return { label: 'GP', quantity: amount };
  }

  if (reward.itemId) {
    const added = addItem(state, reward.itemId, quantity);
    return added ? { label: items[reward.itemId]?.name ?? reward.itemId, quantity } : null;
  }

  return null;
}

export function grantRewards(state: GameState, rewards: RewardRoll[]): { label: string; quantity: number }[] {
  return rewards.map((reward) => grantReward(state, reward)).filter((line): line is { label: string; quantity: number } => Boolean(line));
}

export function getFirstOwnedEquipment(state: GameState): string | null {
  const ownedEquipment = Object.entries(state.bank).find(([itemId, quantity]) => {
    return quantity > 0 && Boolean(items[itemId]?.equipment);
  });
  return ownedEquipment?.[0] ?? null;
}
