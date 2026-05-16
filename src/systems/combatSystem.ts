import { dungeonsById, monstersById } from '../data/monsters';
import { items } from '../data/items';
import type { GameState, MonsterId } from '../types/game';
import { clamp, getMaxPlayerHp, getPlayerCombatStats, getSkillLevel } from './formulas';
import { addItem, addLog, addSkillXp, grantRewards, removeItem } from './stateUtils';

function rollDamage(maxHit: number): number {
  return Math.max(1, Math.floor(1 + Math.random() * maxHit));
}

function chooseBestFood(state: GameState): string | null {
  const options = Object.entries(state.bank)
    .map(([itemId, quantity]) => ({ item: items[itemId], itemId, quantity }))
    .filter((entry) => entry.quantity > 0 && Boolean(entry.item?.healAmount))
    .sort((left, right) => (right.item?.healAmount ?? 0) - (left.item?.healAmount ?? 0));

  return options[0]?.itemId ?? null;
}

function autoEatIfNeeded(state: GameState): void {
  const maxHp = getMaxPlayerHp(state);
  if (state.combat.playerHp > maxHp * 0.38) return;

  const foodId = chooseBestFood(state);
  if (!foodId) return;

  const food = items[foodId];
  if (!food?.healAmount || !removeItem(state, foodId, 1)) return;

  state.combat.playerHp = Math.min(maxHp, state.combat.playerHp + food.healAmount);
  addLog(state, 'info', `Auto-ate ${food.name} for ${food.healAmount} HP.`);
}

function setActiveMonster(state: GameState, monsterId: MonsterId): void {
  const monster = monstersById[monsterId];
  if (!monster) return;

  state.combat.activeMonsterId = monster.id;
  state.combat.selectedMonsterId = monster.id;
  state.combat.monsterHp = monster.maxHp;
  state.combat.playerProgressMs = 0;
  state.combat.monsterProgressMs = 0;
  state.combat.lastHit = null;
}

function finishMonster(state: GameState): void {
  const monsterId = state.combat.activeMonsterId;
  const monster = monsterId ? monstersById[monsterId] : undefined;
  if (!monster) return;

  Object.entries(monster.xp).forEach(([skillId, xp]) => addSkillXp(state, skillId as keyof GameState['skills'], xp ?? 0, 0));
  const rewards = grantRewards(state, monster.drops);
  const rewardText = rewards.length > 0 ? ` Rewards: ${rewards.map((line) => `${line.quantity} ${line.label}`).join(', ')}.` : '';
  addLog(state, 'success', `${monster.name} defeated.${rewardText}`);

  if (state.combat.mode === 'dungeon' && state.combat.dungeonId) {
    const dungeon = dungeonsById[state.combat.dungeonId];
    const nextStep = state.combat.dungeonStep + 1;

    if (!dungeon || nextStep >= dungeon.monsters.length) {
      if (dungeon) {
        grantRewards(state, dungeon.reward);
        state.combat.dungeonClears += 1;
        addLog(state, 'success', `${dungeon.name} cleared.`);
      }
      state.combat.mode = 'idle';
      state.combat.activeMonsterId = null;
      state.combat.dungeonId = null;
      state.combat.dungeonStep = 0;
      state.combat.monsterHp = 0;
      return;
    }

    state.combat.dungeonStep = nextStep;
    setActiveMonster(state, dungeon.monsters[nextStep]);
    return;
  }

  setActiveMonster(state, monster.id);
}

export function processCombatTick(state: GameState, deltaMs: number): void {
  if (state.combat.mode === 'idle' || !state.combat.activeMonsterId) return;

  const monster = monstersById[state.combat.activeMonsterId];
  if (!monster) return;

  const playerStats = getPlayerCombatStats(state);
  const maxHp = getMaxPlayerHp(state);
  if (state.combat.playerHp <= 0) state.combat.playerHp = maxHp;

  state.combat.playerProgressMs += deltaMs;
  state.combat.monsterProgressMs += deltaMs;

  while (state.combat.playerProgressMs >= playerStats.attackIntervalMs && state.combat.activeMonsterId) {
    state.combat.playerProgressMs -= playerStats.attackIntervalMs;
    const hitChance = clamp(playerStats.accuracy / (playerStats.accuracy + monster.stats.defence * 8), 0.18, 0.94);
    const missed = Math.random() > hitChance;
    const critical = !missed && Math.random() < 0.08;
    const damage = missed ? 0 : rollDamage(playerStats.maxHit + (critical ? 2 : 0));

    state.combat.lastHit = { source: 'hero', amount: damage, missed, critical };
    if (!missed) {
      state.combat.monsterHp -= damage;
      addSkillXp(state, 'attack', damage * 0.55, 0);
      addSkillXp(state, 'strength', damage * 0.55, 0);
      addSkillXp(state, 'hitpoints', damage * 0.35, 0);
    }

    if (state.combat.monsterHp <= 0) {
      finishMonster(state);
      break;
    }
  }

  const activeAfterPlayerHit = state.combat.activeMonsterId ? monstersById[state.combat.activeMonsterId] : null;
  if (!activeAfterPlayerHit) return;

  while (state.combat.monsterProgressMs >= activeAfterPlayerHit.attackIntervalMs && state.combat.activeMonsterId) {
    state.combat.monsterProgressMs -= activeAfterPlayerHit.attackIntervalMs;
    const hitChance = clamp(activeAfterPlayerHit.stats.accuracy / (activeAfterPlayerHit.stats.accuracy + playerStats.defence * 4.5), 0.12, 0.88);
    const missed = Math.random() > hitChance;
    const damage = missed ? 0 : rollDamage(activeAfterPlayerHit.stats.maxHit);

    state.combat.lastHit = { source: 'monster', amount: damage, missed };
    if (!missed) {
      state.combat.playerHp -= damage;
      addSkillXp(state, 'defence', damage * 0.25, 0);
    }

    autoEatIfNeeded(state);
    if (state.combat.playerHp <= 0) {
      addLog(state, 'danger', 'You retreated after running out of food.');
      stopCombat(state);
      state.combat.playerHp = Math.ceil(getMaxPlayerHp(state) * 0.55);
      break;
    }
  }
}

export function startMonsterFight(state: GameState, monsterId: MonsterId): void {
  const monster = monstersById[monsterId];
  if (!monster) return;

  state.activeActionId = null;
  state.actionProgressMs = 0;
  state.activeView = 'combat';
  state.combat.mode = 'monster';
  state.combat.dungeonId = null;
  state.combat.dungeonStep = 0;
  state.combat.playerHp = Math.max(1, Math.min(state.combat.playerHp || getMaxPlayerHp(state), getMaxPlayerHp(state)));
  setActiveMonster(state, monster.id);
  addLog(state, 'info', `Engaging ${monster.name}.`);
}

export function startDungeon(state: GameState, dungeonId: string): void {
  const dungeon = dungeonsById[dungeonId];
  if (!dungeon) return;

  const combatLevel = Math.max(getSkillLevel(state, 'attack'), getSkillLevel(state, 'strength'), getSkillLevel(state, 'defence'));
  if (combatLevel < dungeon.levelRequired) {
    addLog(state, 'warning', `${dungeon.name} requires combat level ${dungeon.levelRequired}.`);
    return;
  }

  state.activeActionId = null;
  state.actionProgressMs = 0;
  state.activeView = 'combat';
  state.combat.mode = 'dungeon';
  state.combat.dungeonId = dungeon.id;
  state.combat.dungeonStep = 0;
  state.combat.playerHp = Math.max(1, Math.min(state.combat.playerHp || getMaxPlayerHp(state), getMaxPlayerHp(state)));
  setActiveMonster(state, dungeon.monsters[0]);
  addLog(state, 'info', `${dungeon.name} started.`);
}

export function stopCombat(state: GameState): void {
  state.combat.mode = 'idle';
  state.combat.activeMonsterId = null;
  state.combat.dungeonId = null;
  state.combat.dungeonStep = 0;
  state.combat.monsterHp = 0;
  state.combat.playerProgressMs = 0;
  state.combat.monsterProgressMs = 0;
}

export function collectManualFood(state: GameState, itemId: string): void {
  const item = items[itemId];
  if (!item?.healAmount || !removeItem(state, itemId, 1)) return;
  state.combat.playerHp = Math.min(getMaxPlayerHp(state), state.combat.playerHp + item.healAmount);
  addLog(state, 'info', `Ate ${item.name}.`);
}

export function grantStarterCombatDrop(state: GameState): void {
  addItem(state, 'rune_essence', 1);
}
