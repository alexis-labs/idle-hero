export type SkillCategory = 'combat' | 'gathering' | 'processing' | 'support' | 'world';

export type SkillId =
  | 'attack'
  | 'strength'
  | 'defence'
  | 'hitpoints'
  | 'ranged'
  | 'magic'
  | 'prayer'
  | 'slayer'
  | 'woodcutting'
  | 'fishing'
  | 'mining'
  | 'thieving'
  | 'firemaking'
  | 'cooking'
  | 'smithing'
  | 'fletching'
  | 'crafting'
  | 'runecrafting'
  | 'herblore'
  | 'farming'
  | 'summoning'
  | 'astrology'
  | 'agility'
  | 'altMagic'
  | 'township'
  | 'atlas';

export type ViewId = 'skills' | 'combat' | 'bank' | 'shop' | 'achievements' | 'settings';
export type GameMode = 'standard' | 'hardcore' | 'adventure';
export type ActionId = string;
export type ItemId = string;
export type MonsterId = string;
export type DungeonId = string;
export type PetId = string;
export type AchievementId = string;

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'resource' | 'material' | 'food' | 'equipment' | 'rune' | 'consumable' | 'pet' | 'relic';
export type EquipmentSlot = 'weapon' | 'shield' | 'helm' | 'body' | 'legs' | 'gloves' | 'boots' | 'amulet' | 'ring' | 'ammo';
export type ActionTag = 'gathering' | 'processing' | 'crafting' | 'utility' | 'magic';

export interface SkillDefinition {
  id: SkillId;
  name: string;
  category: SkillCategory;
  description: string;
  color: string;
  accent: string;
  order: number;
  implemented: boolean;
  unlockedByDefault: boolean;
  lockedNote?: string;
}

export interface SkillState {
  xp: number;
  masteryXp: number;
  unlocked: boolean;
}

export interface EquipmentStats {
  attack?: number;
  strength?: number;
  defence?: number;
  ranged?: number;
  magic?: number;
  prayer?: number;
  maxHit?: number;
  intervalReduction?: number;
}

export interface EquipmentDefinition {
  slot: EquipmentSlot;
  stats: EquipmentStats;
  levelRequirements?: Partial<Record<SkillId, number>>;
}

export interface ItemDefinition {
  id: ItemId;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  iconText: string;
  color: string;
  description: string;
  sellValue: number;
  stackable: boolean;
  category: string;
  healAmount?: number;
  equipment?: EquipmentDefinition;
}

export interface ItemQuantity {
  itemId: ItemId;
  quantity: number;
}

export interface RewardRoll {
  itemId?: ItemId;
  gp?: number;
  quantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  chance?: number;
}

export interface ActionVisualDefinition {
  targetName: string;
  color: string;
  shape: 'tree' | 'rock' | 'water' | 'flame' | 'forge' | 'workbench' | 'runes' | 'field';
}

export interface ActionDefinition {
  id: ActionId;
  skillId: SkillId;
  name: string;
  levelRequired: number;
  intervalMs: number;
  xp: number;
  masteryXp: number;
  description: string;
  area: string;
  tags: ActionTag[];
  inputs?: ItemQuantity[];
  outputs: RewardRoll[];
  visual: ActionVisualDefinition;
}

export interface MonsterStats {
  attack: number;
  strength: number;
  defence: number;
  maxHit: number;
  accuracy: number;
}

export interface MonsterDefinition {
  id: MonsterId;
  name: string;
  zone: string;
  level: number;
  maxHp: number;
  attackIntervalMs: number;
  stats: MonsterStats;
  xp: Partial<Record<SkillId, number>>;
  drops: RewardRoll[];
  isBoss?: boolean;
  color: string;
}

export interface DungeonDefinition {
  id: DungeonId;
  name: string;
  description: string;
  levelRequired: number;
  monsters: MonsterId[];
  reward: RewardRoll[];
  color: string;
}

export type BankState = Record<ItemId, number>;

export interface CombatHit {
  source: 'hero' | 'monster';
  amount: number;
  missed: boolean;
  critical?: boolean;
}

export interface CombatState {
  mode: 'idle' | 'monster' | 'dungeon';
  selectedMonsterId: MonsterId | null;
  activeMonsterId: MonsterId | null;
  dungeonId: DungeonId | null;
  dungeonStep: number;
  dungeonClears: number;
  playerHp: number;
  monsterHp: number;
  playerProgressMs: number;
  monsterProgressMs: number;
  lastHit: CombatHit | null;
}

export interface OfflineRewardLine {
  label: string;
  quantity: number;
}

export interface OfflineSummary {
  secondsAway: number;
  capped: boolean;
  actionName: string | null;
  completions: number;
  rewards: OfflineRewardLine[];
  xp: Partial<Record<SkillId, number>>;
}

export interface LogEntry {
  id: string;
  time: number;
  tone: 'info' | 'success' | 'warning' | 'danger';
  message: string;
}

export interface GameSettings {
  reduceMotion: boolean;
  compactNumbers: boolean;
}

export interface GameState {
  version: number;
  playerName: string;
  mode: GameMode;
  gp: number;
  bankSlots: number;
  activeView: ViewId;
  selectedSkill: SkillId;
  activeActionId: ActionId | null;
  actionProgressMs: number;
  skills: Record<SkillId, SkillState>;
  bank: BankState;
  equipment: Record<EquipmentSlot, ItemId | null>;
  combat: CombatState;
  pets: Record<PetId, boolean>;
  achievements: Record<AchievementId, boolean>;
  shopPurchases: Record<string, number>;
  activityLog: LogEntry[];
  offlineSummary: OfflineSummary | null;
  settings: GameSettings;
  createdAt: number;
  lastSavedAt: number;
}

export interface ShopUpgradeDefinition {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxPurchases: number;
  effectLabel: string;
}
