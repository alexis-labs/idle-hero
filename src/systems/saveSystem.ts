import type { GameState } from '../types/game';
import { normalizeMapState } from '../data/map';
import { applyOfflineProgression } from './offlineProgression';
import { createInitialState, SAVE_VERSION } from './stateUtils';

const STORAGE_KEY = 'idle-hero-save-v1';

function hydrateSave(candidate: Partial<GameState> | null, now = Date.now()): GameState {
  const base = createInitialState(now);
  if (!candidate) return base;

  const merged: GameState = {
    ...base,
    ...candidate,
    version: SAVE_VERSION,
    skills: { ...base.skills, ...(candidate.skills ?? {}) },
    bank: { ...base.bank, ...(candidate.bank ?? {}) },
    equipment: { ...base.equipment, ...(candidate.equipment ?? {}) },
    map: normalizeMapState(candidate.map),
    combat: { ...base.combat, ...(candidate.combat ?? {}), mapTileKey: candidate.combat?.mapTileKey ?? null },
    pets: { ...base.pets, ...(candidate.pets ?? {}) },
    achievements: { ...base.achievements, ...(candidate.achievements ?? {}) },
    shopPurchases: { ...base.shopPurchases, ...(candidate.shopPurchases ?? {}) },
    settings: { ...base.settings, ...(candidate.settings ?? {}) },
    activityLog: candidate.activityLog?.length ? candidate.activityLog : base.activityLog,
    offlineSummary: null,
    createdAt: candidate.createdAt ?? base.createdAt,
    lastSavedAt: candidate.lastSavedAt ?? base.lastSavedAt,
  };

  if ((candidate.activeView as string | undefined) === 'combat') {
    merged.activeView = 'map';
  }

  if (merged.combat.mode !== 'idle' && !merged.combat.mapTileKey) {
    merged.combat = { ...base.combat };
  }

  return merged;
}

export function loadGame(): GameState {
  if (typeof localStorage === 'undefined') return createInitialState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return applyOfflineProgression(hydrateSave(parsed));
  } catch (error) {
    console.warn('Failed to load save', error);
    return createInitialState();
  }
}

export function saveGame(state: GameState): void {
  if (typeof localStorage === 'undefined') return;

  const snapshot: GameState = {
    ...state,
    lastSavedAt: Date.now(),
    offlineSummary: null,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function exportSave(state: GameState): string {
  return JSON.stringify({ ...state, lastSavedAt: Date.now(), offlineSummary: null }, null, 2);
}

export function importSave(raw: string): GameState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return hydrateSave(parsed);
  } catch (error) {
    console.warn('Failed to import save', error);
    return null;
  }
}

export function clearSave(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
