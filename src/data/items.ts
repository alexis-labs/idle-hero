import type { EquipmentSlot, ItemDefinition, ItemId } from '../types/game';

export const equipmentSlots: { id: EquipmentSlot; label: string }[] = [
  { id: 'weapon', label: 'Weapon' },
  { id: 'shield', label: 'Shield' },
  { id: 'helm', label: 'Helm' },
  { id: 'body', label: 'Body' },
  { id: 'legs', label: 'Legs' },
  { id: 'gloves', label: 'Gloves' },
  { id: 'boots', label: 'Boots' },
  { id: 'amulet', label: 'Amulet' },
  { id: 'ring', label: 'Ring' },
  { id: 'ammo', label: 'Ammo' },
];

export const items: Record<ItemId, ItemDefinition> = {
  normal_log: { id: 'normal_log', name: 'Normal Log', type: 'resource', rarity: 'common', iconText: 'LG', color: '#8b5e34', description: 'Basic wood for fires and early tools.', sellValue: 2, stackable: true, category: 'wood' },
  oak_log: { id: 'oak_log', name: 'Oak Log', type: 'resource', rarity: 'common', iconText: 'OK', color: '#a8793f', description: 'Sturdy wood for bows and stronger fires.', sellValue: 5, stackable: true, category: 'wood' },
  willow_log: { id: 'willow_log', name: 'Willow Log', type: 'resource', rarity: 'uncommon', iconText: 'WL', color: '#84cc16', description: 'Flexible wood used for mid-tier bows and wand shafts.', sellValue: 9, stackable: true, category: 'wood' },
  charcoal: { id: 'charcoal', name: 'Charcoal', type: 'material', rarity: 'common', iconText: 'CH', color: '#334155', description: 'Fuel used by smithing and runecrafting.', sellValue: 4, stackable: true, category: 'material' },

  raw_shrimp: { id: 'raw_shrimp', name: 'Raw Shrimp', type: 'resource', rarity: 'common', iconText: 'RS', color: '#fb7185', description: 'Raw food. Cook it before combat.', sellValue: 3, stackable: true, category: 'fish' },
  cooked_shrimp: { id: 'cooked_shrimp', name: 'Cooked Shrimp', type: 'food', rarity: 'common', iconText: 'CS', color: '#f97316', description: 'Restores 9 HP automatically in combat.', sellValue: 6, stackable: true, category: 'food', healAmount: 9 },
  raw_trout: { id: 'raw_trout', name: 'Raw Trout', type: 'resource', rarity: 'uncommon', iconText: 'RT', color: '#38bdf8', description: 'A better fish for cooking practice.', sellValue: 7, stackable: true, category: 'fish' },
  cooked_trout: { id: 'cooked_trout', name: 'Cooked Trout', type: 'food', rarity: 'uncommon', iconText: 'CT', color: '#0ea5e9', description: 'Restores 18 HP automatically in combat.', sellValue: 14, stackable: true, category: 'food', healAmount: 18 },
  raw_salmon: { id: 'raw_salmon', name: 'Raw Salmon', type: 'resource', rarity: 'uncommon', iconText: 'RA', color: '#fb7185', description: 'A richer catch that needs fuel to cook well.', sellValue: 11, stackable: true, category: 'fish' },
  cooked_salmon: { id: 'cooked_salmon', name: 'Smoked Salmon', type: 'food', rarity: 'uncommon', iconText: 'SA', color: '#f43f5e', description: 'Restores 28 HP automatically in combat.', sellValue: 23, stackable: true, category: 'food', healAmount: 28 },

  copper_ore: { id: 'copper_ore', name: 'Copper Ore', type: 'resource', rarity: 'common', iconText: 'CO', color: '#b45309', description: 'Smelt with tin to create bronze.', sellValue: 4, stackable: true, category: 'ore' },
  tin_ore: { id: 'tin_ore', name: 'Tin Ore', type: 'resource', rarity: 'common', iconText: 'TO', color: '#94a3b8', description: 'Smelt with copper to create bronze.', sellValue: 4, stackable: true, category: 'ore' },
  iron_ore: { id: 'iron_ore', name: 'Iron Ore', type: 'resource', rarity: 'uncommon', iconText: 'IO', color: '#64748b', description: 'A reliable ore for stronger equipment.', sellValue: 9, stackable: true, category: 'ore' },
  coal_ore: { id: 'coal_ore', name: 'Coal Ore', type: 'resource', rarity: 'uncommon', iconText: 'CL', color: '#1f2937', description: 'Dense fuel needed for steel and deep forge work.', sellValue: 10, stackable: true, category: 'ore' },
  bronze_bar: { id: 'bronze_bar', name: 'Bronze Bar', type: 'material', rarity: 'common', iconText: 'BB', color: '#cd7f32', description: 'Used to forge simple weapons and armor.', sellValue: 14, stackable: true, category: 'bar' },
  iron_bar: { id: 'iron_bar', name: 'Iron Bar', type: 'material', rarity: 'uncommon', iconText: 'IB', color: '#9ca3af', description: 'Used for sturdier combat equipment.', sellValue: 25, stackable: true, category: 'bar' },
  steel_bar: { id: 'steel_bar', name: 'Steel Bar', type: 'material', rarity: 'rare', iconText: 'ST', color: '#64748b', description: 'A refined bar that links mining, firemaking, and smithing.', sellValue: 42, stackable: true, category: 'bar' },

  leather: { id: 'leather', name: 'Leather', type: 'material', rarity: 'common', iconText: 'LE', color: '#92400e', description: 'Flexible material dropped by early monsters.', sellValue: 8, stackable: true, category: 'material' },
  rune_essence: { id: 'rune_essence', name: 'Rune Essence', type: 'material', rarity: 'common', iconText: 'RE', color: '#c4b5fd', description: 'Raw magical matter used to craft runes.', sellValue: 6, stackable: true, category: 'rune' },
  air_rune: { id: 'air_rune', name: 'Air Rune', type: 'rune', rarity: 'common', iconText: 'AR', color: '#a5f3fc', description: 'Basic rune for magic combat.', sellValue: 2, stackable: true, category: 'rune' },
  fire_rune: { id: 'fire_rune', name: 'Fire Rune', type: 'rune', rarity: 'common', iconText: 'FR', color: '#fb923c', description: 'A warm rune used by early damage spells.', sellValue: 3, stackable: true, category: 'rune' },
  rune_focus: { id: 'rune_focus', name: 'Rune Focus', type: 'material', rarity: 'uncommon', iconText: 'RF', color: '#a78bfa', description: 'Bound runes and fuel used to craft magical equipment.', sellValue: 38, stackable: true, category: 'rune' },

  training_sword: { id: 'training_sword', name: 'Training Sword', type: 'equipment', rarity: 'common', iconText: 'TS', color: '#cbd5e1', description: 'A simple blade for new heroes.', sellValue: 10, stackable: false, category: 'weapon', equipment: { slot: 'weapon', stats: { attack: 2, strength: 1, maxHit: 1 } } },
  bronze_sword: { id: 'bronze_sword', name: 'Bronze Sword', type: 'equipment', rarity: 'common', iconText: 'BS', color: '#cd7f32', description: 'A forged sword with reliable balance.', sellValue: 55, stackable: false, category: 'weapon', equipment: { slot: 'weapon', stats: { attack: 6, strength: 4, maxHit: 2 }, levelRequirements: { attack: 3 } } },
  iron_sword: { id: 'iron_sword', name: 'Iron Sword', type: 'equipment', rarity: 'uncommon', iconText: 'IS', color: '#cbd5e1', description: 'Sharper and heavier than bronze.', sellValue: 120, stackable: false, category: 'weapon', equipment: { slot: 'weapon', stats: { attack: 12, strength: 8, maxHit: 4 }, levelRequirements: { attack: 8 } } },
  steel_sword: { id: 'steel_sword', name: 'Steel Sword', type: 'equipment', rarity: 'rare', iconText: 'SS', color: '#94a3b8', description: 'A serious blade for pushing deeper into the Ember Vault.', sellValue: 240, stackable: false, category: 'weapon', equipment: { slot: 'weapon', stats: { attack: 18, strength: 14, maxHit: 6 }, levelRequirements: { attack: 14 } } },
  wooden_shield: { id: 'wooden_shield', name: 'Wooden Shield', type: 'equipment', rarity: 'common', iconText: 'WS', color: '#8b5e34', description: 'A light shield made from oak.', sellValue: 35, stackable: false, category: 'shield', equipment: { slot: 'shield', stats: { defence: 5 }, levelRequirements: { defence: 2 } } },
  iron_shield: { id: 'iron_shield', name: 'Iron Shield', type: 'equipment', rarity: 'uncommon', iconText: 'IH', color: '#9ca3af', description: 'A reinforced shield that consumes metal, wood, and fuel.', sellValue: 105, stackable: false, category: 'shield', equipment: { slot: 'shield', stats: { defence: 9 }, levelRequirements: { defence: 8 } } },
  leather_body: { id: 'leather_body', name: 'Leather Body', type: 'equipment', rarity: 'common', iconText: 'LB', color: '#92400e', description: 'Flexible armor for early fights.', sellValue: 45, stackable: false, category: 'armor', equipment: { slot: 'body', stats: { defence: 4, ranged: 2 }, levelRequirements: { defence: 3 } } },
  bronze_helm: { id: 'bronze_helm', name: 'Bronze Helm', type: 'equipment', rarity: 'common', iconText: 'BH', color: '#cd7f32', description: 'Basic protection for dungeon attempts.', sellValue: 45, stackable: false, category: 'armor', equipment: { slot: 'helm', stats: { defence: 3 }, levelRequirements: { defence: 3 } } },
  bronze_platelegs: { id: 'bronze_platelegs', name: 'Bronze Platelegs', type: 'equipment', rarity: 'common', iconText: 'BP', color: '#cd7f32', description: 'Heavy early armor.', sellValue: 70, stackable: false, category: 'armor', equipment: { slot: 'legs', stats: { defence: 5 }, levelRequirements: { defence: 4 } } },
  shortbow: { id: 'shortbow', name: 'Shortbow', type: 'equipment', rarity: 'common', iconText: 'SB', color: '#a3e635', description: 'A fast bow for ranged training.', sellValue: 45, stackable: false, category: 'weapon', equipment: { slot: 'weapon', stats: { ranged: 6, maxHit: 2, intervalReduction: 100 }, levelRequirements: { ranged: 3 } } },
  longbow: { id: 'longbow', name: 'Longbow', type: 'equipment', rarity: 'uncommon', iconText: 'LW', color: '#84cc16', description: 'A stronger ranged weapon shaped from flexible willow.', sellValue: 125, stackable: false, category: 'weapon', equipment: { slot: 'weapon', stats: { ranged: 11, maxHit: 4, intervalReduction: 160 }, levelRequirements: { ranged: 9 } } },
  training_arrows: { id: 'training_arrows', name: 'Training Arrows', type: 'equipment', rarity: 'common', iconText: 'TA', color: '#facc15', description: 'Simple arrows for the shortbow.', sellValue: 1, stackable: true, category: 'ammo', equipment: { slot: 'ammo', stats: { ranged: 2 } } },
  hardened_arrows: { id: 'hardened_arrows', name: 'Hardened Arrows', type: 'equipment', rarity: 'uncommon', iconText: 'HA', color: '#fde68a', description: 'Iron-tipped arrows for mid-tier ranged training.', sellValue: 2, stackable: true, category: 'ammo', equipment: { slot: 'ammo', stats: { ranged: 5 }, levelRequirements: { ranged: 8 } } },
  apprentice_wand: { id: 'apprentice_wand', name: 'Apprentice Wand', type: 'equipment', rarity: 'uncommon', iconText: 'AW', color: '#818cf8', description: 'Focuses crafted runes into small bursts.', sellValue: 80, stackable: false, category: 'weapon', equipment: { slot: 'weapon', stats: { magic: 8, maxHit: 3 }, levelRequirements: { magic: 4 } } },
  ember_amulet: { id: 'ember_amulet', name: 'Ember Amulet', type: 'equipment', rarity: 'rare', iconText: 'EA', color: '#fb923c', description: 'A rare charm from the Ember Vault.', sellValue: 320, stackable: false, category: 'amulet', equipment: { slot: 'amulet', stats: { attack: 2, strength: 2, magic: 2, prayer: 1, maxHit: 1 } } },

  vault_key: { id: 'vault_key', name: 'Vault Key', type: 'relic', rarity: 'rare', iconText: 'VK', color: '#facc15', description: 'Opens the first dungeon path.', sellValue: 90, stackable: true, category: 'relic' },
  ancient_page: { id: 'ancient_page', name: 'Ancient Page', type: 'relic', rarity: 'epic', iconText: 'AP', color: '#fde68a', description: 'A lore page used by future Atlas upgrades.', sellValue: 180, stackable: true, category: 'relic' },
  tiny_wisp: { id: 'tiny_wisp', name: 'Tiny Wisp', type: 'pet', rarity: 'legendary', iconText: 'TW', color: '#67e8f9', description: 'A rare companion that marks your luck.', sellValue: 0, stackable: false, category: 'pet' },
};

export const startingBank: Record<ItemId, number> = {
  training_sword: 1,
  cooked_shrimp: 8,
  normal_log: 6,
};

export function getItem(itemId: ItemId): ItemDefinition | undefined {
  return items[itemId];
}
