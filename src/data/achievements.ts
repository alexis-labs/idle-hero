import type { RewardRoll } from '../types/game';

export type AchievementCategory = 'training' | 'crafting' | 'combat' | 'exploration' | 'collection';
export type AchievementTier = 'bronze' | 'silver' | 'gold';
export type AchievementCheck =
  | 'level10'
  | 'threeLevel10'
  | 'firstDungeon'
  | 'threeDungeonClears'
  | 'hundredLogs'
  | 'supplyCache'
  | 'rareItem'
  | 'firstCraft'
  | 'mapScout'
  | 'secretHunter'
  | 'rangedKit'
  | 'vaultPrep'
  | 'steelWeapon'
  | 'runeFocus';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  points: number;
  check: AchievementCheck;
  reward?: RewardRoll[];
}

export const achievementCategories: { id: AchievementCategory; label: string }[] = [
  { id: 'training', label: 'Training' },
  { id: 'crafting', label: 'Crafting' },
  { id: 'combat', label: 'Combat' },
  { id: 'exploration', label: 'Exploration' },
  { id: 'collection', label: 'Collection' },
];

export const achievements: AchievementDefinition[] = [
  { id: 'level_10_any', name: 'First Rhythm', description: 'Reach level 10 in any skill.', category: 'training', tier: 'bronze', points: 5, check: 'level10', reward: [{ gp: 50, quantity: 1 }] },
  { id: 'three_level_10', name: 'Balanced Routine', description: 'Reach level 10 in three different skills.', category: 'training', tier: 'silver', points: 12, check: 'threeLevel10', reward: [{ gp: 120, quantity: 1 }] },
  { id: 'first_craft', name: 'Hands On', description: 'Craft or forge your first equipment item.', category: 'crafting', tier: 'bronze', points: 5, check: 'firstCraft', reward: [{ gp: 35, quantity: 1 }] },
  { id: 'steel_weapon', name: 'Steel Intent', description: 'Own or equip a Steel Sword.', category: 'crafting', tier: 'gold', points: 20, check: 'steelWeapon', reward: [{ gp: 180, quantity: 1 }] },
  { id: 'rune_focus', name: 'Bound Focus', description: 'Craft a Rune Focus or Apprentice Wand.', category: 'crafting', tier: 'silver', points: 14, check: 'runeFocus', reward: [{ gp: 90, quantity: 1 }] },
  { id: 'first_dungeon_clear', name: 'Vault Breaker', description: 'Clear the Ember Vault once.', category: 'combat', tier: 'silver', points: 15, check: 'firstDungeon', reward: [{ gp: 140, quantity: 1 }] },
  { id: 'three_dungeon_clears', name: 'Vault Regular', description: 'Clear dungeons three times.', category: 'combat', tier: 'gold', points: 25, check: 'threeDungeonClears', reward: [{ itemId: 'ancient_page', quantity: 1 }] },
  { id: 'vault_prep', name: 'Ready for the Heat', description: 'Own an Iron Shield and at least 10 Smoked Salmon.', category: 'combat', tier: 'silver', points: 12, check: 'vaultPrep', reward: [{ gp: 110, quantity: 1 }] },
  { id: 'map_scout', name: 'Camp Cartographer', description: 'Discover 12 map tiles.', category: 'exploration', tier: 'bronze', points: 6, check: 'mapScout', reward: [{ gp: 70, quantity: 1 }] },
  { id: 'secret_hunter', name: 'Under the Ash', description: 'Find three map secrets.', category: 'exploration', tier: 'gold', points: 20, check: 'secretHunter', reward: [{ itemId: 'vault_key', quantity: 1 }] },
  { id: 'hundred_logs', name: 'Timber Routine', description: 'Hold 100 total logs in the bank.', category: 'collection', tier: 'bronze', points: 8, check: 'hundredLogs', reward: [{ itemId: 'charcoal', quantity: 15 }] },
  { id: 'supply_cache', name: 'Supply Cache', description: 'Hold 350 stackable resources, food, materials, bars, ores, or runes.', category: 'collection', tier: 'silver', points: 14, check: 'supplyCache', reward: [{ gp: 125, quantity: 1 }] },
  { id: 'rare_find', name: 'Rare Spark', description: 'Discover a rare or better item.', category: 'collection', tier: 'silver', points: 12, check: 'rareItem', reward: [{ gp: 100, quantity: 1 }] },
  { id: 'ranged_kit', name: 'Full Draw', description: 'Own a Longbow and Hardened Arrows.', category: 'collection', tier: 'silver', points: 12, check: 'rangedKit', reward: [{ itemId: 'training_arrows', quantity: 100 }] },
];
