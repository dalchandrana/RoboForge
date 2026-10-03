# PROJECT-STATE (agents: update this at the end of every task)

**Last updated:** 2026-10-04
**Phase:** 0 — Foundations (Completed)

## Done
- PRD, AGENTS, rules, workflows, docs authored (v0.3).
- Resolved workspace configuration and pinned toolchains (`.nvmrc`, `rust-toolchain.toml`, `.editorconfig`, `.gitignore`, `.antigravityignore`).
- Scaffolding of pnpm monorepo with strict TypeScript, ESLint flat config, Prettier, and Vitest.
- Seven core packages created with 100% pure unit test coverage:
  - `packages/config`: Application constants, budgets, flags.
  - `packages/content-schema`: Zod validation schemas for lessons, modules, paths, quizzes, and exercises.
  - `packages/ui`: Design system, WCAG 2.2 AA accessible buttons, cards, modals, toasts, and safety callouts.
  - `packages/storage`: SQLite schema migrations (15 tables) and portable `.roboforge` backup import/export.
  - `packages/i18n`: Type-safe localization service with English translations dictionary.
  - `packages/graders`: Pure deterministic auto-graders for numeric values and quiz items.
  - `packages/calculators`: Electronics calculators showing formulas, derivations, and SI units (Ohm's Law & Power).
- Scaffolding of future package stubs: `sim-circuit`, `sim-avr`, `sim-robot`, `coach`.
- Content pipeline and automated tools:
  - `tools/content-lint`: Schema check, reading-level analysis, and automated hardware `safety-lint`.
  - `tools/content-build`: Zero-runtime-eval build compiler generating static offline bundles.
  - `tools/license-audit`: Validates repository packages against Apache-2.0 / CC-BY-SA 4.0 policy.
- Educational content authoring:
  - Path: `electronics-embedded-foundations`
  - Module 1: `m01-electricity-basics`
  - Lesson 1: `l01-what-is-electricity.mdx` (original text, safe lab practice callouts, closed circuit concepts) + 4-item quiz.
- Desktop Shell (`apps/desktop`):
  - Tauri 2 + React 19 + Vite + Tailwind shell.
  - 9-section accessible sidebar navigation (FR-APP-02).
  - Home view with quick stats and curriculum navigator.
  - Learn view rendering lesson 1 with interactive auto-graded quiz and "Mark complete" button persisting to storage.
  - Settings view with dark/light themes, text scaling, AI tier controls, and `.roboforge` export/import/reset.
  - Tools view with interactive Ohm's Law calculator.
- Governance, CI, and Architecture:
  - GitHub Actions CI (`ci.yml`) and build matrix (`build.yml`).
  - GitHub templates: Bug report, Content error, Hardware verification, and PR template.
  - Accepted ADR-001 (Core Technology Stack) and ADR-002 (Monorepo and Content Format).

## In progress
- Phase 0 complete. Awaiting maintainer review before starting Phase 1 (Circuit simulator + Coach).

## Next
1. Phase 1 Vertical slice: Circuits + Coach.
2. ADR-003: SPICE integration strategy (ngspice-WASM vs native sidecar vs custom MNA solver).
3. ADR-006: Local Ollama integration & RAM tier tags.

## Open questions (for the maintainer)
1. Product name & mascot concept? (RoboForge kept as placeholder).
2. Reference test machines (OS/RAM) available for verification?
3. Hardware: which Arduino-compatible board and parts will you buy first for verification?
4. Preferred donation methods list?
5. Domain/hosting for docs site (GitHub Pages OK)?

## Decisions log
| Date | Decision | Where |
|---|---|---|
| 2026-10-04 | Free-only, global, desktop + local AI, open-source, school-first | PRD §0/§2 |
| 2026-10-04 | Adopt Tauri 2 + React 19 + TypeScript + Vite + Tailwind for desktop shell | ADR-001 |
| 2026-10-04 | Adopt pnpm monorepo with build-time MDX compilation to static JSON | ADR-002 |
| 2026-10-04 | Use Apache-2.0 code license and CC BY-SA 4.0 content license | LICENSE / CONTENT_LICENSE.md |

## Known issues / risks
- Disk space: verify at least 15-20 GB free before compiling full release binaries in Phase 3.

## Needs human verification
- None in Phase 0 (Lesson 1 is low-voltage theoretical foundations with no physical circuit kit claims).
