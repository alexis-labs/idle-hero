# Contributing to Idle Hero

Thanks for helping improve Idle Hero. This project is still an early prototype, so clear small changes are especially valuable.

## Ways to Contribute

- Fix bugs with clear reproduction steps.
- Improve game data in `src/data`, such as actions, items, monsters, achievements, or shop upgrades.
- Tune balance for XP, intervals, drops, combat stats, rewards, and costs.
- Improve UI clarity, responsiveness, accessibility, and reduced-motion behavior.
- Add tests for formulas, save hydration, offline progression, and combat logic.
- Improve documentation for setup, architecture, and contribution workflows.

## Local Setup

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173` after the dev server starts.

## Before Opening a Pull Request

Run the production build locally:

```bash
npm run build
```

Also check the feature manually in the browser when the change affects UI, saves, combat, offline progress, or game balance.

## Project Conventions

- Keep gameplay data declarative where possible. New content usually belongs in `src/data`.
- Keep shared game models in `src/types/game.ts` up to date when adding new fields or concepts.
- Put reusable gameplay rules in `src/systems` instead of embedding them in React components.
- Keep React components focused on rendering state and dispatching actions.
- Avoid committing generated output such as `dist`, `node_modules`, coverage reports, or local environment files.
- Prefer small pull requests with one clear goal.
- Update documentation when a change affects setup, architecture, contributor workflows, or player-facing behavior.

## Pull Request Checklist

- [ ] The change has a focused scope.
- [ ] `npm run build` passes locally.
- [ ] UI changes were checked in the browser.
- [ ] Save/offline changes were tested with an existing save when relevant.
- [ ] New or changed data uses the existing TypeScript types.
- [ ] Documentation was updated when needed.

## Reporting Bugs

Use the bug report template and include:

- What happened.
- What you expected to happen.
- Steps to reproduce the problem.
- Browser and OS if the bug appears environment-specific.
- Whether the issue happens with a fresh save or only an existing save.

## Suggesting Features or Balance Changes

Use the feature or content template and describe:

- The player problem or design goal.
- The proposed behavior or data change.
- Any balance impact on XP, GP, drops, combat difficulty, or progression speed.