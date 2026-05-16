# Architecture

Idle Hero is a single-page browser game. The app uses React for the interface, a reducer-driven game store for state changes, and Three.js for the animated activity scene.

## High-Level Flow

1. `src/main.tsx` mounts the React app.
2. `src/App.tsx` composes the game shell, canvas, navigation, active view, right panel, top bar, and offline modal.
3. `src/app/useGameStore.tsx` owns the reducer, dispatch actions, tick loop, autosave loop, and game context.
4. Every tick processes active skilling, combat, and achievement synchronization.
5. UI components render the current state and dispatch actions such as starting skills, starting combat, buying upgrades, equipping items, importing saves, or toggling settings.

## Data Layer

Most content is declarative and lives in `src/data`:

- `skills.ts` defines skill metadata, categories, colors, unlock state, and implementation status.
- `actions.ts` defines gathering, processing, crafting, and utility actions.
- `items.ts` defines resources, food, equipment, pets, relics, stack behavior, sell values, and equipment stats.
- `monsters.ts` defines monsters, dungeons, combat stats, XP, and drops.
- `shop.ts` defines purchasable upgrades.
- `achievements.ts` defines achievement conditions and rewards.

When adding content, start with the shared types in `src/types/game.ts` and prefer extending existing data shapes before adding new state fields.

## Game Systems

Game rules live in `src/systems`:

- `idleSystem.ts` processes active skill actions, inputs, outputs, XP, mastery XP, and progress timers.
- `combatSystem.ts` handles monster fights, dungeon progression, player and monster attack timers, damage rolls, auto-eating, drops, and combat XP.
- `formulas.ts` contains reusable math for levels, XP, player stats, bank slots, damage, and formatting.
- `stateUtils.ts` creates initial state and provides shared state mutations such as adding XP, granting rewards, adding items, consuming items, and activity logs.
- `saveSystem.ts` loads, hydrates, saves, exports, imports, and clears local saves.
- `offlineProgression.ts` applies capped progress after returning to the game.
- `achievementSystem.ts` synchronizes achievement state.

## State and Persistence

The game state is defined by `GameState` in `src/types/game.ts`. Saves are stored in browser `localStorage`, then hydrated against the latest initial state so new fields can receive defaults.

Offline progression currently applies to active skilling actions and is capped at 24 hours. Combat does not currently advance while offline.

## Rendering and UI

The UI is split into view components under `src/ui`. The active view is selected by `state.activeView` and rendered by `CurrentView` in `src/App.tsx`.

The canvas layer lives under `src/game`:

- `GameCanvas.tsx` bridges React state to the Three.js scene.
- `ThreeScene.ts` owns the scene objects and visual updates.

## Adding a New Skill Action

1. Add or reuse required item definitions in `src/data/items.ts`.
2. Add an `ActionDefinition` in `src/data/actions.ts` with inputs, outputs, interval, XP, mastery XP, level requirement, tags, area, and visual metadata.
3. Confirm the skill exists and is implemented in `src/data/skills.ts`.
4. Run `npm run build` to validate TypeScript.
5. Check the action in the browser and verify bank, XP, progress, and offline behavior.

## Adding a New Monster or Dungeon

1. Add drops or equipment in `src/data/items.ts` if needed.
2. Add a `MonsterDefinition` in `src/data/monsters.ts` with stats, XP, drops, color, and level.
3. Add or update a dungeon entry if the monster belongs in a dungeon chain.
4. Check combat balance manually: hit chance, max hit, food usage, XP, GP, and item rewards.
5. Run `npm run build`.