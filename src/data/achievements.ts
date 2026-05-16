export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  check: 'level10' | 'firstDungeon' | 'hundredLogs' | 'rareItem' | 'firstCraft';
}

export const achievements: AchievementDefinition[] = [
  { id: 'level_10_any', name: 'First Rhythm', description: 'Reach level 10 in any skill.', check: 'level10' },
  { id: 'first_dungeon_clear', name: 'Vault Breaker', description: 'Clear the Ember Vault once.', check: 'firstDungeon' },
  { id: 'hundred_logs', name: 'Timber Routine', description: 'Hold 100 total logs in the bank.', check: 'hundredLogs' },
  { id: 'rare_find', name: 'Rare Spark', description: 'Discover a rare or better item.', check: 'rareItem' },
  { id: 'first_craft', name: 'Hands On', description: 'Craft or forge your first equipment item.', check: 'firstCraft' },
];
