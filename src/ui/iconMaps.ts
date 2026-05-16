import {
  Activity,
  Axe,
  Backpack,
  CircleDot,
  Coins,
  Compass,
  CookingPot,
  Crosshair,
  Dumbbell,
  Feather,
  Flame,
  FlaskConical,
  Footprints,
  Gem,
  Hammer,
  HandCoins,
  HeartPulse,
  KeyRound,
  Landmark,
  Map,
  Mountain,
  Orbit,
  Package,
  Pickaxe,
  ScrollText,
  Shield,
  Shirt,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Swords,
  Target,
  Telescope,
  TreePine,
  Utensils,
  WandSparkles,
  Waves,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import type { ActionVisualDefinition, ItemId, SkillId } from '../types/game';

const skillIconMap: Record<SkillId, LucideIcon> = {
  attack: Swords,
  strength: Dumbbell,
  defence: Shield,
  hitpoints: HeartPulse,
  ranged: Crosshair,
  magic: Sparkles,
  prayer: Sun,
  slayer: Target,
  woodcutting: Axe,
  fishing: Waves,
  mining: Pickaxe,
  thieving: HandCoins,
  firemaking: Flame,
  cooking: CookingPot,
  smithing: Hammer,
  fletching: Feather,
  crafting: Gem,
  runecrafting: Orbit,
  herblore: FlaskConical,
  farming: Sprout,
  summoning: Sparkles,
  astrology: Telescope,
  agility: Footprints,
  altMagic: WandSparkles,
  township: Landmark,
  atlas: Map,
};

const itemIconMap: Record<ItemId, LucideIcon> = {
  normal_log: TreePine,
  oak_log: TreePine,
  charcoal: Flame,
  raw_shrimp: Waves,
  cooked_shrimp: Utensils,
  raw_trout: Waves,
  cooked_trout: CookingPot,
  copper_ore: Pickaxe,
  tin_ore: Pickaxe,
  iron_ore: Mountain,
  bronze_bar: Hammer,
  iron_bar: Hammer,
  leather: Shirt,
  rune_essence: Sparkles,
  air_rune: Wind,
  fire_rune: Flame,
  training_sword: Swords,
  bronze_sword: Swords,
  iron_sword: Swords,
  wooden_shield: Shield,
  leather_body: Shirt,
  bronze_helm: Shield,
  bronze_platelegs: Shield,
  shortbow: Crosshair,
  training_arrows: Feather,
  apprentice_wand: WandSparkles,
  ember_amulet: Gem,
  vault_key: KeyRound,
  ancient_page: ScrollText,
  tiny_wisp: Star,
};

const categoryIconMap: Record<string, LucideIcon> = {
  all: Backpack,
  wood: TreePine,
  material: Package,
  fish: Waves,
  food: Utensils,
  ore: Pickaxe,
  bar: Hammer,
  rune: Sparkles,
  weapon: Swords,
  shield: Shield,
  armor: Shirt,
  ammo: Feather,
  amulet: Gem,
  relic: ScrollText,
  pet: Star,
};

const actionShapeIconMap: Record<ActionVisualDefinition['shape'], LucideIcon> = {
  tree: TreePine,
  rock: Pickaxe,
  water: Waves,
  flame: Flame,
  forge: Hammer,
  workbench: Gem,
  runes: Sparkles,
  field: Compass,
};

export function getSkillIcon(skillId: SkillId): LucideIcon {
  return skillIconMap[skillId] ?? CircleDot;
}

export function getItemIcon(itemId: ItemId): LucideIcon {
  return itemIconMap[itemId] ?? Package;
}

export function getCategoryIcon(category: string): LucideIcon {
  return categoryIconMap[category] ?? Package;
}

export function getActionShapeIcon(shape: ActionVisualDefinition['shape']): LucideIcon {
  return actionShapeIconMap[shape] ?? Activity;
}

export { Coins };
