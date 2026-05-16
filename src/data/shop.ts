import type { ShopUpgradeDefinition } from '../types/game';

export const shopUpgrades: ShopUpgradeDefinition[] = [
  {
    id: 'bank_slot_bundle',
    name: 'Bank Slot Bundle',
    description: 'Adds 8 permanent bank slots.',
    cost: 180,
    maxPurchases: 8,
    effectLabel: '+8 bank slots',
  },
  {
    id: 'tool_oil',
    name: 'Tool Oil',
    description: 'Future upgrade hook for skilling speed.',
    cost: 500,
    maxPurchases: 1,
    effectLabel: 'Prepared for speed upgrades',
  },
];
