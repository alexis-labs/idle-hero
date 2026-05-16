# Idle Hero

Idle Hero is a browser-based idle RPG prototype built with React, TypeScript, Vite, and Three.js. The project focuses on long-form skill progression, data-driven content, local saves, offline progress, and a compact game UI that can grow over time.

> Project status: early prototype. The core loop is playable, but balance, content depth, accessibility, tests, and polish are still evolving.

## Features

- Data-driven skills, items, actions, monsters, drops, equipment, shop upgrades, and achievements.
- Idle skilling loop with XP, mastery XP, resource gathering, processing, crafting, and bank storage.
- Tick-based combat with equipment requirements, auto-eating food, monster drops, and dungeon progression.
- Local save system with export/import support and capped offline progression.
- Three.js 2D orthographic scene synchronized with the current activity.
- React UI split into focused views for skills, combat, bank, shop, achievements, settings, and activity logs.

## Tech Stack

- React 18
- TypeScript
- Vite
- Three.js
- lucide-react icons
- Browser `localStorage` for saves

## Quick Start

Prerequisites:

- Node.js 18 or newer
- npm

Install dependencies and start the local development server:

```bash
npm install
npm run dev
```

The Vite server runs on `http://127.0.0.1:5173` by default.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check the project and create a production build. |
| `npm run preview` | Preview the production build locally. |

## Project Structure

```text
src/
	app/       React game provider, reducer, and dispatch actions
	data/      Declarative game content such as skills, items, actions, monsters, shop entries, and achievements
	game/      Three.js canvas integration and scene rendering
	styles/    Global application styles
	systems/   Game logic for combat, idle actions, formulas, saves, offline progress, achievements, and state utilities
	types/     Shared TypeScript game model definitions
	ui/        React views and reusable UI components
```

For a deeper technical overview, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Development Notes

- Most new gameplay content should start in `src/data` and reuse the existing types in `src/types/game.ts`.
- Core gameplay behavior belongs in `src/systems`; UI components should mostly dispatch actions and render state.
- Saves are client-side only and stored in browser `localStorage` under the current save key.
- Offline progression is capped at 24 hours and currently applies to active skilling actions.
- There is no backend service, account system, or multiplayer layer.

## Contributing

Contributions are welcome. Good first issues include small data additions, balance tweaks, UI polish, accessibility improvements, documentation updates, and bug fixes with clear reproduction steps.

Before opening a pull request, please read [CONTRIBUTING.md](CONTRIBUTING.md) and run:

```bash
npm run build
```

## Roadmap Ideas

- Expand implemented skills and action chains.
- Add tests around formulas, save hydration, offline progression, and combat outcomes.
- Improve keyboard accessibility and reduced-motion behavior.
- Add more monsters, dungeons, achievements, pets, and item tiers.
- Add contributor-facing balance notes for XP, rewards, and combat tuning.

## License

No open-source license has been selected yet. Before publishing a public release or accepting broad external contributions, add a `LICENSE` file that matches the intended reuse terms.
