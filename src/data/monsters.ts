import type { DungeonDefinition, MonsterDefinition } from '../types/game';

export const monsters: MonsterDefinition[] = [
  {
    id: 'training_dummy',
    name: 'Training Dummy',
    zone: 'Practice Yard',
    level: 1,
    maxHp: 30,
    attackIntervalMs: 2400,
    stats: { attack: 3, strength: 2, defence: 2, maxHit: 3, accuracy: 52 },
    xp: { attack: 5, strength: 5, defence: 3, hitpoints: 4 },
    drops: [{ gp: 3, quantity: 1, chance: 1 }, { itemId: 'rune_essence', quantity: 1, chance: 0.08 }],
    color: '#94a3b8',
  },
  {
    id: 'lane_bandit',
    name: 'Lane Bandit',
    zone: 'Old Road',
    level: 4,
    maxHp: 48,
    attackIntervalMs: 2200,
    stats: { attack: 6, strength: 5, defence: 5, maxHit: 5, accuracy: 60 },
    xp: { attack: 8, strength: 8, defence: 5, hitpoints: 7 },
    drops: [{ gp: 7, quantity: 1, chance: 1 }, { itemId: 'leather', quantity: 1, chance: 0.35 }, { itemId: 'vault_key', quantity: 1, chance: 0.04 }],
    color: '#f97316',
  },
  {
    id: 'cave_sentry',
    name: 'Cave Sentry',
    zone: 'Lowrock Gate',
    level: 8,
    maxHp: 78,
    attackIntervalMs: 2300,
    stats: { attack: 10, strength: 9, defence: 10, maxHit: 7, accuracy: 66 },
    xp: { attack: 13, strength: 13, defence: 10, hitpoints: 10 },
    drops: [{ gp: 14, quantity: 1, chance: 1 }, { itemId: 'iron_ore', quantity: 1, chance: 0.26 }, { itemId: 'leather', quantity: 2, chance: 0.22 }, { itemId: 'vault_key', quantity: 1, chance: 0.07 }],
    color: '#64748b',
  },
  {
    id: 'ember_acolyte',
    name: 'Ember Acolyte',
    zone: 'Ember Vault',
    level: 13,
    maxHp: 112,
    attackIntervalMs: 2100,
    stats: { attack: 15, strength: 14, defence: 12, maxHit: 10, accuracy: 71 },
    xp: { attack: 18, strength: 18, defence: 14, hitpoints: 14, magic: 4 },
    drops: [{ gp: 24, quantity: 1, chance: 1 }, { itemId: 'fire_rune', quantity: 8, chance: 0.4 }, { itemId: 'ancient_page', quantity: 1, chance: 0.04 }],
    color: '#fb923c',
  },
  {
    id: 'vault_warden',
    name: 'Vault Warden',
    zone: 'Ember Vault',
    level: 18,
    maxHp: 180,
    attackIntervalMs: 2000,
    stats: { attack: 21, strength: 20, defence: 18, maxHit: 14, accuracy: 80 },
    xp: { attack: 34, strength: 34, defence: 24, hitpoints: 24, prayer: 8 },
    drops: [{ gp: 65, quantity: 1, chance: 1 }, { itemId: 'ember_amulet', quantity: 1, chance: 0.18 }, { itemId: 'ancient_page', quantity: 1, chance: 0.35 }, { itemId: 'tiny_wisp', quantity: 1, chance: 0.01 }],
    isBoss: true,
    color: '#f43f5e',
  },
];

export const monstersById = monsters.reduce<Record<string, MonsterDefinition>>((acc, monster) => {
  acc[monster.id] = monster;
  return acc;
}, {});

export const dungeons: DungeonDefinition[] = [
  {
    id: 'ember_vault',
    name: 'Ember Vault',
    description: 'A short dungeon ending with the Vault Warden.',
    levelRequired: 10,
    monsters: ['cave_sentry', 'ember_acolyte', 'vault_warden'],
    reward: [{ gp: 100, quantity: 1, chance: 1 }, { itemId: 'ancient_page', quantity: 1, chance: 1 }],
    color: '#f97316',
  },
];

export const dungeonsById = dungeons.reduce<Record<string, DungeonDefinition>>((acc, dungeon) => {
  acc[dungeon.id] = dungeon;
  return acc;
}, {});
