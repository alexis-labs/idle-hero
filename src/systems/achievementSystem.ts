import { achievements, type AchievementDefinition } from '../data/achievements';
import { items } from '../data/items';
import type { GameState, ItemId, SkillId } from '../types/game';
import { getSkillLevel, rarityRank } from './formulas';
import { addLog, grantRewards } from './stateUtils';

export interface AchievementProgress {
  current: number;
  target: number;
  ratio: number;
  label: string;
  complete: boolean;
}

const craftedEquipmentIds = new Set<ItemId>([
  'bronze_sword',
  'iron_sword',
  'steel_sword',
  'wooden_shield',
  'iron_shield',
  'leather_body',
  'bronze_helm',
  'bronze_platelegs',
  'shortbow',
  'longbow',
  'hardened_arrows',
  'apprentice_wand',
]);

const supplyCategories = new Set(['wood', 'material', 'fish', 'food', 'ore', 'bar', 'rune']);

function clampProgress(current: number, target: number): AchievementProgress {
  const safeTarget = Math.max(1, target);
  const safeCurrent = Math.max(0, current);
  return {
    current: safeCurrent,
    target: safeTarget,
    ratio: Math.min(1, safeCurrent / safeTarget),
    label: `${Math.min(safeCurrent, safeTarget)} / ${safeTarget}`,
    complete: safeCurrent >= safeTarget,
  };
}

function skillLevels(state: GameState): number[] {
  return (Object.keys(state.skills) as SkillId[]).map((skillId) => getSkillLevel(state, skillId));
}

function ownedItemQuantity(state: GameState, itemId: ItemId): number {
  const bankQuantity = state.bank[itemId] ?? 0;
  const equippedQuantity = Object.values(state.equipment).filter((equippedItemId) => equippedItemId === itemId).length;
  return bankQuantity + equippedQuantity;
}

function ownsAnyItem(state: GameState, itemIds: ItemId[]): boolean {
  return itemIds.some((itemId) => ownedItemQuantity(state, itemId) > 0 || Boolean(state.pets[itemId]));
}

function ownedRequirementCount(state: GameState, requirements: { itemId: ItemId; quantity?: number }[]): number {
  return requirements.filter((requirement) => ownedItemQuantity(state, requirement.itemId) >= (requirement.quantity ?? 1)).length;
}

function totalLogs(state: GameState): number {
  return (state.bank.normal_log ?? 0) + (state.bank.oak_log ?? 0) + (state.bank.willow_log ?? 0);
}

function totalSupplies(state: GameState): number {
  return Object.entries(state.bank).reduce((total, [itemId, quantity]) => {
    const item = items[itemId];
    if (!item?.stackable || !supplyCategories.has(item.category)) return total;
    return total + quantity;
  }, 0);
}

function ownsRareItem(state: GameState): boolean {
  const bankHasRare = Object.entries(state.bank).some(([itemId, quantity]) => {
    const item = items[itemId];
    return quantity > 0 && item && rarityRank(item) >= 3;
  });

  const equipmentHasRare = Object.values(state.equipment).some((itemId) => {
    const item = itemId ? items[itemId] : undefined;
    return item ? rarityRank(item) >= 3 : false;
  });

  return bankHasRare || equipmentHasRare || Object.values(state.pets).some(Boolean);
}

function ownsCraftedEquipment(state: GameState): boolean {
  return Object.entries(state.bank).some(([itemId, quantity]) => craftedEquipmentIds.has(itemId) && quantity > 0) || Object.values(state.equipment).some((itemId) => Boolean(itemId && craftedEquipmentIds.has(itemId)));
}

export function getAchievementProgress(state: GameState, achievement: AchievementDefinition): AchievementProgress {
  if (achievement.check === 'level10') {
    return clampProgress(Math.max(...skillLevels(state)), 10);
  }
  if (achievement.check === 'threeLevel10') {
    return clampProgress(skillLevels(state).filter((level) => level >= 10).length, 3);
  }
  if (achievement.check === 'firstDungeon') {
    return clampProgress(state.combat.dungeonClears, 1);
  }
  if (achievement.check === 'threeDungeonClears') {
    return clampProgress(state.combat.dungeonClears, 3);
  }
  if (achievement.check === 'hundredLogs') {
    return clampProgress(totalLogs(state), 100);
  }
  if (achievement.check === 'supplyCache') {
    return clampProgress(totalSupplies(state), 350);
  }
  if (achievement.check === 'rareItem') {
    return clampProgress(ownsRareItem(state) ? 1 : 0, 1);
  }
  if (achievement.check === 'firstCraft') {
    return clampProgress(ownsCraftedEquipment(state) ? 1 : 0, 1);
  }
  if (achievement.check === 'mapScout') {
    return clampProgress(Object.keys(state.map.revealed).length, 12);
  }
  if (achievement.check === 'secretHunter') {
    return clampProgress(state.map.secretsFound, 3);
  }
  if (achievement.check === 'rangedKit') {
    return clampProgress(ownedRequirementCount(state, [{ itemId: 'longbow' }, { itemId: 'hardened_arrows' }]), 2);
  }
  if (achievement.check === 'vaultPrep') {
    return clampProgress(ownedRequirementCount(state, [{ itemId: 'iron_shield' }, { itemId: 'cooked_salmon', quantity: 10 }]), 2);
  }
  if (achievement.check === 'steelWeapon') {
    return clampProgress(ownsAnyItem(state, ['steel_sword']) ? 1 : 0, 1);
  }
  if (achievement.check === 'runeFocus') {
    return clampProgress(ownsAnyItem(state, ['rune_focus', 'apprentice_wand']) ? 1 : 0, 1);
  }

  return clampProgress(0, 1);
}

export function getAchievementScore(state: GameState): number {
  return achievements.reduce((score, achievement) => score + (state.achievements[achievement.id] ? achievement.points : 0), 0);
}

export function syncAchievements(state: GameState): void {
  achievements.forEach((achievement) => {
    if (state.achievements[achievement.id]) return;

    const progress = getAchievementProgress(state, achievement);
    if (progress.complete) {
      state.achievements[achievement.id] = true;
      const rewards = achievement.reward ? grantRewards(state, achievement.reward) : [];
      const rewardText = rewards.length > 0 ? ` Rewards: ${rewards.map((line) => `${line.quantity} ${line.label}`).join(', ')}.` : '';
      addLog(state, 'success', `Goal completed: ${achievement.name}.${rewardText}`);
    }
  });
}
