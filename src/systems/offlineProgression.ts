import { actionsById } from '../data/actions';
import { items } from '../data/items';
import type { GameState, OfflineRewardLine, RewardRoll } from '../types/game';
import { completeOfflineTravel } from './mapSystem';
import { addItem, addLog, addSkillXp, cloneState, consumeItems, hasItems } from './stateUtils';

const MAX_OFFLINE_MS = 24 * 60 * 60 * 1000;
const MIN_REPORT_MS = 5000;

function rewardLabel(reward: RewardRoll): string {
  if (reward.gp) return 'GP';
  return reward.itemId ? items[reward.itemId]?.name ?? reward.itemId : 'Reward';
}

function expectedQuantity(reward: RewardRoll, completions: number): number {
  const chance = reward.chance ?? 1;
  const baseQuantity = reward.quantity ?? ((reward.minQuantity ?? 1) + (reward.maxQuantity ?? reward.minQuantity ?? 1)) / 2;
  const expected = baseQuantity * chance * completions;
  const whole = Math.floor(expected);
  const remainder = expected - whole;
  return whole + (Math.random() < remainder ? 1 : 0);
}

function maxCompletionsFromInputs(state: GameState, actionId: string, theoretical: number): number {
  const action = actionsById[actionId];
  if (!action?.inputs?.length) return theoretical;

  return action.inputs.reduce((max, input) => {
    return Math.min(max, Math.floor((state.bank[input.itemId] ?? 0) / input.quantity));
  }, theoretical);
}

export function applyOfflineProgression(state: GameState, now = Date.now()): GameState {
  const elapsed = Math.max(0, now - state.lastSavedAt);
  if (elapsed < MIN_REPORT_MS) {
    return { ...state, lastSavedAt: now };
  }

  const cappedElapsed = Math.min(elapsed, MAX_OFFLINE_MS);
  const next = cloneState(state);
  next.lastSavedAt = now;

  const completedTravel = completeOfflineTravel(next, cappedElapsed);

  if (!next.activeActionId) {
    next.offlineSummary = {
      secondsAway: Math.floor(cappedElapsed / 1000),
      capped: elapsed > MAX_OFFLINE_MS,
      actionName: completedTravel ? 'Map travel' : null,
      completions: completedTravel ? 1 : 0,
      rewards: [],
      xp: {},
    };
    return next;
  }

  const action = actionsById[next.activeActionId];
  if (!action) {
    next.activeActionId = null;
    next.actionProgressMs = 0;
    return next;
  }

  const theoretical = Math.floor((cappedElapsed + next.actionProgressMs) / action.intervalMs);
  const completions = maxCompletionsFromInputs(next, action.id, theoretical);
  const rewards: OfflineRewardLine[] = [];

  for (let index = 0; index < completions; index += 1) {
    if (!hasItems(next, action.inputs)) break;
    consumeItems(next, action.inputs);
  }

  if (completions > 0) {
    addSkillXp(next, action.skillId, action.xp * completions, action.masteryXp * completions);

    action.outputs.forEach((reward) => {
      const quantity = expectedQuantity(reward, completions);
      if (quantity <= 0) return;

      if (reward.gp) {
        const amount = reward.gp * quantity;
        next.gp += amount;
        rewards.push({ label: 'GP', quantity: amount });
        return;
      }

      if (reward.itemId && addItem(next, reward.itemId, quantity)) {
        rewards.push({ label: rewardLabel(reward), quantity });
      }
    });
  }

  if (completions < theoretical && action.inputs?.length) {
    next.activeActionId = null;
    next.actionProgressMs = 0;
    addLog(next, 'warning', `${action.name} stopped offline: missing resources.`);
  } else {
    next.actionProgressMs = (cappedElapsed + next.actionProgressMs) % action.intervalMs;
  }

  next.offlineSummary = {
    secondsAway: Math.floor(cappedElapsed / 1000),
    capped: elapsed > MAX_OFFLINE_MS,
    actionName: action.name,
    completions,
    rewards,
    xp: completions > 0 ? { [action.skillId]: action.xp * completions } : {},
  };

  return next;
}
