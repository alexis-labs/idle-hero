import type { SkillDefinition, SkillId } from '../types/game';

export const skills: SkillDefinition[] = [
  { id: 'attack', name: 'Attack', category: 'combat', description: 'Accuracy with melee weapons.', color: '#ef4444', accent: '#fecaca', order: 10, implemented: true, unlockedByDefault: true },
  { id: 'strength', name: 'Strength', category: 'combat', description: 'Raw melee damage.', color: '#f97316', accent: '#fed7aa', order: 11, implemented: true, unlockedByDefault: true },
  { id: 'defence', name: 'Defence', category: 'combat', description: 'Reduces incoming damage.', color: '#0ea5e9', accent: '#bae6fd', order: 12, implemented: true, unlockedByDefault: true },
  { id: 'hitpoints', name: 'Hitpoints', category: 'combat', description: 'Keeps your hero standing.', color: '#dc2626', accent: '#fecaca', order: 13, implemented: true, unlockedByDefault: true },
  { id: 'ranged', name: 'Ranged', category: 'combat', description: 'Marksman training and ammo mastery.', color: '#22c55e', accent: '#bbf7d0', order: 14, implemented: true, unlockedByDefault: true },
  { id: 'magic', name: 'Magic', category: 'combat', description: 'Spell accuracy and magical force.', color: '#6366f1', accent: '#c7d2fe', order: 15, implemented: true, unlockedByDefault: true },
  { id: 'prayer', name: 'Prayer', category: 'combat', description: 'Passive combat blessings.', color: '#eab308', accent: '#fef08a', order: 16, implemented: false, unlockedByDefault: true, lockedNote: 'Blessings arrive after the first dungeon.' },
  { id: 'slayer', name: 'Slayer', category: 'combat', description: 'Task-based monster hunting.', color: '#a855f7', accent: '#e9d5ff', order: 17, implemented: false, unlockedByDefault: false, lockedNote: 'Unlocks in a later combat pass.' },

  { id: 'woodcutting', name: 'Woodcutting', category: 'gathering', description: 'Harvest logs used by firemaking and fletching.', color: '#16a34a', accent: '#bbf7d0', order: 20, implemented: true, unlockedByDefault: true },
  { id: 'fishing', name: 'Fishing', category: 'gathering', description: 'Catch fish that become combat food.', color: '#0284c7', accent: '#bae6fd', order: 21, implemented: true, unlockedByDefault: true },
  { id: 'mining', name: 'Mining', category: 'gathering', description: 'Mine ore for smithing bars and gear.', color: '#64748b', accent: '#cbd5e1', order: 22, implemented: true, unlockedByDefault: true },
  { id: 'thieving', name: 'Thieving', category: 'gathering', description: 'Risky GP and material gathering.', color: '#d946ef', accent: '#f5d0fe', order: 23, implemented: false, unlockedByDefault: false, lockedNote: 'Planned for the next town update.' },

  { id: 'firemaking', name: 'Firemaking', category: 'processing', description: 'Burn logs for XP and useful charcoal.', color: '#f59e0b', accent: '#fde68a', order: 30, implemented: true, unlockedByDefault: true },
  { id: 'cooking', name: 'Cooking', category: 'processing', description: 'Turn raw fish into food for combat.', color: '#fb7185', accent: '#ffe4e6', order: 31, implemented: true, unlockedByDefault: true },
  { id: 'smithing', name: 'Smithing', category: 'processing', description: 'Smelt bars and forge early equipment.', color: '#94a3b8', accent: '#e2e8f0', order: 32, implemented: true, unlockedByDefault: true },
  { id: 'fletching', name: 'Fletching', category: 'processing', description: 'Make bows and ammo from wood.', color: '#84cc16', accent: '#d9f99d', order: 33, implemented: true, unlockedByDefault: true },
  { id: 'crafting', name: 'Crafting', category: 'processing', description: 'Create gear and accessories from monster materials.', color: '#14b8a6', accent: '#99f6e4', order: 34, implemented: true, unlockedByDefault: true },
  { id: 'runecrafting', name: 'Runecrafting', category: 'processing', description: 'Craft runes for magic combat.', color: '#8b5cf6', accent: '#ddd6fe', order: 35, implemented: true, unlockedByDefault: true },
  { id: 'herblore', name: 'Herblore', category: 'processing', description: 'Brew potions from farming and monster drops.', color: '#10b981', accent: '#a7f3d0', order: 36, implemented: false, unlockedByDefault: false, lockedNote: 'Potion lab is planned after Farming.' },
  { id: 'farming', name: 'Farming', category: 'processing', description: 'Grow ingredients on long timers.', color: '#65a30d', accent: '#bef264', order: 37, implemented: false, unlockedByDefault: false, lockedNote: 'Long-cycle timers arrive in a future pass.' },

  { id: 'summoning', name: 'Summoning', category: 'support', description: 'Create familiars and synergies.', color: '#06b6d4', accent: '#a5f3fc', order: 40, implemented: false, unlockedByDefault: false, lockedNote: 'Synergies are visible but not active yet.' },
  { id: 'astrology', name: 'Astrology', category: 'support', description: 'Passive constellations and small bonuses.', color: '#7c3aed', accent: '#ddd6fe', order: 41, implemented: false, unlockedByDefault: false, lockedNote: 'Planned as a passive mastery system.' },
  { id: 'agility', name: 'Agility', category: 'support', description: 'Build courses that modify your whole account.', color: '#0891b2', accent: '#a5f3fc', order: 42, implemented: false, unlockedByDefault: false, lockedNote: 'Course building comes later.' },
  { id: 'altMagic', name: 'Alt. Magic', category: 'support', description: 'Utility spells for converting resources.', color: '#4f46e5', accent: '#c7d2fe', order: 43, implemented: false, unlockedByDefault: false, lockedNote: 'Utility spells will use crafted runes.' },
  { id: 'township', name: 'Township', category: 'world', description: 'Manage a settlement that feeds the economy.', color: '#0f766e', accent: '#99f6e4', order: 50, implemented: false, unlockedByDefault: false, lockedNote: 'Large expansion feature.' },
  { id: 'atlas', name: 'Atlas', category: 'world', description: 'Discover regions, relics, and long-term goals.', color: '#b45309', accent: '#fed7aa', order: 51, implemented: false, unlockedByDefault: false, lockedNote: 'Discovery map planned as endgame progression.' },
];

export const skillsById = skills.reduce<Record<SkillId, SkillDefinition>>((acc, skill) => {
  acc[skill.id] = skill;
  return acc;
}, {} as Record<SkillId, SkillDefinition>);

export const skillGroups = [
  { id: 'combat', label: 'Combat' },
  { id: 'gathering', label: 'Gathering' },
  { id: 'processing', label: 'Processing' },
  { id: 'support', label: 'Support' },
  { id: 'world', label: 'World' },
] as const;
