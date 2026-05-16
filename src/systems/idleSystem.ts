import { actionsById } from '../data/actions';
import { skillsById } from '../data/skills';
import type { GameState } from '../types/game';
import { getSkillLevel } from './formulas';
import { addLog, addSkillXp, consumeItems, grantRewards, hasItems } from './stateUtils';

export function processActiveAction(state: GameState, deltaMs: number): void {
  if (!state.activeActionId) return;

  const action = actionsById[state.activeActionId];
  if (!action) {
    state.activeActionId = null;
    state.actionProgressMs = 0;
    return;
  }

  const level = getSkillLevel(state, action.skillId);
  if (level < action.levelRequired) {
    addLog(state, 'warning', `${action.name} requires ${skillsById[action.skillId].name} level ${action.levelRequired}.`);
    state.activeActionId = null;
    state.actionProgressMs = 0;
    return;
  }

  state.actionProgressMs += deltaMs;

  let completions = 0;
  while (state.actionProgressMs >= action.intervalMs && completions < 40) {
    if (!hasItems(state, action.inputs)) {
      addLog(state, 'warning', `${action.name} stopped: missing resources.`);
      state.activeActionId = null;
      state.actionProgressMs = 0;
      break;
    }

    consumeItems(state, action.inputs);
    addSkillXp(state, action.skillId, action.xp, action.masteryXp);
    grantRewards(state, action.outputs);
    state.actionProgressMs -= action.intervalMs;
    completions += 1;
  }

  if (completions > 0) {
    const suffix = completions === 1 ? '' : ` x${completions}`;
    addLog(state, 'info', `${action.name} completed${suffix}.`);
  }
}

export function stopActiveAction(state: GameState): void {
  if (!state.activeActionId) return;
  const action = actionsById[state.activeActionId];
  state.activeActionId = null;
  state.actionProgressMs = 0;
  addLog(state, 'info', action ? `${action.name} stopped.` : 'Action stopped.');
}
