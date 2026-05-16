# Idle Hero

[![CI](https://github.com/alexis-labs/idle-hero/actions/workflows/ci.yml/badge.svg)](https://github.com/alexis-labs/idle-hero/actions/workflows/ci.yml)

Idle Hero is a browser-based idle RPG prototype built with React, TypeScript, Vite, and Three.js. The game combines long-form skill progression, a procedural adventure map, local saves, offline progress, and data-driven content that contributors can extend without touching every part of the app.

The project is intentionally small enough to understand, but structured like a real game codebase: content lives in data files, reusable rules live in systems, React renders the interface, and Three.js powers the ambient activity scene.

## Project Status

Idle Hero is an early playable prototype. The core loop works, but balance, content depth, accessibility, automated tests, and visual polish are still active areas of development.

Current focus:

- Make the first hour of progression more readable and satisfying.
- Expand fixed roguelike runs with more meaningful room events, puzzles, encounters, bosses, and rewards.
- Add focused tests around formulas, saves, offline progression, map helpers, and combat.
- Improve contributor documentation so new people can add content safely.

## What You Can Play Today

- Explore fixed roguelike map runs with fog-of-war, timed travel, secrets, puzzles, NPC events, treasure, encounters, and a run boss.
- Train idle skills through gathering, processing, crafting, and utility actions.
- Collect resources, craft equipment, cook food, manage a bank, and sell items for GP.
- Fight tick-based map encounters with equipment stats, auto-eating, drops, and combat XP.
- Unlock achievements and buy shop upgrades.
- Keep progress through browser `localStorage`, export/import saves, and capped offline progression.

## Tech Stack

- React 18 for the interface.
- TypeScript for shared game models and safer content data.
- Vite for local development and production builds.
- Three.js for the ambient activity scene.
- lucide-react for UI icons.
- Browser `localStorage` for client-side saves.

## Quick Start

Prerequisites:

- Node.js 18 or newer.
- npm.

Install dependencies and start the local development server:

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173` after Vite starts.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run typecheck` | Run TypeScript project checks. |
| `npm run build` | Type-check the project and create a production build. |
| `npm run preview` | Preview the production build locally. |

## Project Map

```text
src/
  app/       React game provider, reducer, dispatch actions, autosave, and tick loop
  data/      Declarative content: skills, items, actions, monsters, map generation, shop, achievements
  game/      Three.js scene integration for the ambient activity view
  styles/    Global application styles
  systems/   Game rules: map travel, encounters, idle actions, formulas, saves, offline progress, achievements
  types/     Shared TypeScript game model definitions
  ui/        React views and reusable UI components
```

For a deeper technical overview, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## How the Game Is Organized

Most gameplay content is declarative. If you want to add a new item, action, monster, map event, shop upgrade, or achievement, start in `src/data` and use the types from `src/types/game.ts`.

Reusable game rules belong in `src/systems`. These files process the state changes behind the UI, such as skill action completions, map travel, encounter resolution, rewards, saves, offline progression, and achievement sync.

React components in `src/ui` should mostly render the current state and dispatch actions. Canvas rendering lives in `src/game`, where React passes game state into Three.js scene classes.

## Good First Contributions

Small, focused changes are the best way to get involved:

- Add a new skill action using existing items and reward patterns.
- Add or tune item data, sell values, descriptions, icons, rarity, or equipment stats.
- Add a monster, encounter reward, run tile flavor, NPC event, puzzle, or achievement.
- Improve responsive layout, keyboard navigation, focus states, or reduced-motion behavior.
- Fix a bug with clear reproduction steps.
- Improve documentation, setup notes, code comments, or contributor examples.
- Add tests for formulas, save hydration, offline progression, or deterministic map helpers.

## Contribution Workflow

The `main` branch is protected by GitHub rulesets. Community changes should go through pull requests.

1. Fork the repository.
2. Create a focused branch from `main`.
3. Make your change and keep it small enough to review comfortably.
4. Run the build locally:

```bash
npm run build
```

5. Open a pull request and fill in the PR template.
6. Wait for the required `Build` check to pass.
7. Address review comments and resolve review threads.

Pull requests require at least one approval before merging. Force pushes and direct destructive changes to `main` are blocked.

For more detail, read [CONTRIBUTING.md](CONTRIBUTING.md).

## Development Notes

- Saves are client-side only and stored in browser `localStorage`.
- Offline progression is capped at 24 hours and currently applies to active skilling actions and pending travel inside the current run.
- There is no backend service, account system, payment system, or multiplayer layer.
- Save-related changes should be tested with a fresh save and, when possible, an imported existing save.
- Balance changes should mention their expected impact on XP, GP, drops, food usage, combat difficulty, or progression speed.

## Roadmap Ideas

- Expand implemented skills, action chains, item tiers, and crafting routes.
- Add more run biomes, NPC stories, puzzle pools, secret room events, boss routes, and rewards.
- Add tests around formulas, save hydration, offline progression, map helpers, and combat outcomes.
- Improve keyboard accessibility, semantic markup, focus handling, and reduced-motion behavior.
- Add contributor-facing balance notes for XP, intervals, rewards, combat stats, and economy tuning.
- Add screenshots or a short gameplay capture to help new visitors understand the project faster.

## Community Standards

Please keep issues, pull requests, and reviews respectful and constructive. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for the expected community behavior and [SECURITY.md](SECURITY.md) for vulnerability reporting guidance.

## License

No open-source license has been selected yet. Before accepting broad external contributions or encouraging reuse outside GitHub collaboration, add a `LICENSE` file that matches the intended project terms.
