import { achievements } from '../data/achievements';
import { items } from '../data/items';
import type { GameState } from '../types/game';
import { getSkillLevel, rarityRank } from './formulas';
import { addLog } from './stateUtils';

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
  const craftedIds = new Set(['bronze_sword', 'iron_sword', 'wooden_shield', 'leather_body', 'bronze_helm', 'bronze_platelegs', 'shortbow', 'apprentice_wand']);
  return Object.entries(state.bank).some(([itemId, quantity]) => craftedIds.has(itemId) && quantity > 0) || Object.values(state.equipment).some((itemId) => Boolean(itemId && craftedIds.has(itemId)));
}

export function syncAchievements(state: GameState): void {
  achievements.forEach((achievement) => {
    if (state.achievements[achievement.id]) return;

    let achieved = false;
    if (achievement.check === 'level10') {
      achieved = Object.keys(state.skills).some((skillId) => getSkillLevel(state, skillId as keyof GameState['skills']) >= 10);
    }
    if (achievement.check === 'firstDungeon') {
      achieved = state.combat.dungeonClears > 0;
    }
    if (achievement.check === 'hundredLogs') {
      achieved = (state.bank.normal_log ?? 0) + (state.bank.oak_log ?? 0) >= 100;
    }
    if (achievement.check === 'rareItem') {
      achieved = ownsRareItem(state);
    }
    if (achievement.check === 'firstCraft') {
      achieved = ownsCraftedEquipment(state);
    }

    if (achieved) {
      state.achievements[achievement.id] = true;
      addLog(state, 'success', `Achievement unlocked: ${achievement.name}.`);
    }
  });
}
