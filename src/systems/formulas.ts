import { items } from '../data/items';
import type { EquipmentStats, GameState, ItemDefinition, SkillId } from '../types/game';

const XP_REQUIREMENT_MULTIPLIER = 1.25;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;

  let total = 0;
  for (let step = 1; step < level; step += 1) {
    total += Math.floor((55 + step * 22 + Math.pow(step, 2.12) * 10) * XP_REQUIREMENT_MULTIPLIER);
  }

  return total;
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (level < 120 && xp >= xpForLevel(level + 1)) {
    level += 1;
  }
  return level;
}

export function getSkillLevel(state: GameState, skillId: SkillId): number {
  return levelForXp(state.skills[skillId]?.xp ?? 0);
}

export function getLevelProgress(state: GameState, skillId: SkillId): number {
  const xp = state.skills[skillId]?.xp ?? 0;
  const level = levelForXp(xp);
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return next === current ? 1 : clamp((xp - current) / (next - current), 0, 1);
}

export function formatNumber(value: number, compact = true): string {
  if (!compact) return Math.floor(value).toLocaleString();
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K`;
  return Math.floor(value).toLocaleString();
}

export function getUsedBankSlots(state: GameState): number {
  return Object.values(state.bank).filter((quantity) => quantity > 0).length;
}

export function getBankQuantity(state: GameState, itemId: string): number {
  return state.bank[itemId] ?? 0;
}

export function rollQuantity(minQuantity?: number, maxQuantity?: number, quantity?: number): number {
  if (typeof quantity === 'number') return quantity;
  const min = minQuantity ?? 1;
  const max = maxQuantity ?? min;
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function getEquipmentStats(state: GameState): Required<EquipmentStats> {
  const stats: Required<EquipmentStats> = {
    attack: 0,
    strength: 0,
    defence: 0,
    ranged: 0,
    magic: 0,
    prayer: 0,
    maxHit: 0,
    intervalReduction: 0,
  };

  Object.values(state.equipment).forEach((itemId) => {
    if (!itemId) return;
    const item = items[itemId];
    if (!item?.equipment) return;

    Object.entries(item.equipment.stats).forEach(([key, value]) => {
      const statKey = key as keyof EquipmentStats;
      stats[statKey] += value ?? 0;
    });
  });

  return stats;
}

export function getMaxPlayerHp(state: GameState): number {
  const level = getSkillLevel(state, 'hitpoints');
  const equipment = getEquipmentStats(state);
  return Math.floor(32 + level * 7 + equipment.defence * 0.65);
}

export function getPlayerCombatStats(state: GameState) {
  const equipment = getEquipmentStats(state);
  const attackLevel = getSkillLevel(state, 'attack');
  const strengthLevel = getSkillLevel(state, 'strength');
  const defenceLevel = getSkillLevel(state, 'defence');
  const rangedLevel = getSkillLevel(state, 'ranged');
  const magicLevel = getSkillLevel(state, 'magic');

  const accuracy = Math.floor(
    42 +
      attackLevel * 2.4 +
      rangedLevel * 0.9 +
      magicLevel * 0.9 +
      equipment.attack * 2.6 +
      equipment.ranged * 2.1 +
      equipment.magic * 2.1,
  );
  const defence = Math.floor(28 + defenceLevel * 2.2 + equipment.defence * 2.8);
  const maxHit = Math.max(1, Math.floor(2 + strengthLevel / 3 + equipment.strength / 2 + equipment.maxHit));
  const attackIntervalMs = clamp(2600 - equipment.intervalReduction, 1400, 3400);

  return { accuracy, defence, maxHit, attackIntervalMs };
}

export function meetsEquipmentRequirements(state: GameState, item: ItemDefinition): boolean {
  const requirements = item.equipment?.levelRequirements;
  if (!requirements) return true;

  return Object.entries(requirements).every(([skillId, requiredLevel]) => {
    return getSkillLevel(state, skillId as SkillId) >= (requiredLevel ?? 1);
  });
}

export function rarityRank(item: ItemDefinition): number {
  const ranks: Record<ItemDefinition['rarity'], number> = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
  };
  return ranks[item.rarity];
}
