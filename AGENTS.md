# AGENTS.md — Single Source of Truth for all AI agents

You are working on **RoboForge** (working name): a free, open-source, offline-first desktop app that teaches robotics (electronics → embedded → robots) with simulators and a local Socratic AI coach.

## 0. Before you do anything
1. Read `PRD.md` (what & why) and `docs/PROJECT-STATE.md` (where we are).
2. Read the doc for your task: `docs/ARCHITECTURE.md`, `docs/CONTENT-GUIDE.md`, `docs/AI-COACH-SPEC.md`, `docs/CURRICULUM.md`, `docs/ROADMAP.md`, `docs/LICENSING.md`.
3. Read `.agents/rules/*` (always-on rules). Use `.agents/workflows/*` for repeatable tasks.
4. If a request conflicts with the PRD principles, **stop and ask**; do not silently deviate.

## 1. Project in 10 lines
- Desktop app: **Tauri 2 + React + TypeScript + Vite**, monorepo with **pnpm** workspaces.
- Offline-first, no accounts, no servers, no telemetry by default.
- Local AI via **Ollama**; app must be fully usable with AI off.
- Simulators: circuit (ngspice-based), Arduino (avr8js-based), 2D robot scene.
- Content = MDX/YAML files in `content/`, validated by Zod schemas.
- Storage: local SQLite + files. Export/import as `.roboforge` bundle.
- Audience: school students first (12–18), then college.
- Code: Apache-2.0 (pending). Content: CC BY-SA 4.0.
- Team: one human maintainer + AI agents. Humans verify hardware.
- Quality bar: tests, a11y, offline, privacy, safety.

## 2. Hard rules (never break)
1. **No network calls at runtime** except: user-initiated browser links, opt-in content updates, and `localhost` Ollama. Never add analytics, crash reporters, CDNs, remote fonts or remote scripts.
2. **No accounts, payments, ads, tracking, or user data collection.**
3. **No secrets in the repo.** No API keys. Use `.env.example` for placeholders only.
4. **Never copy index-0.in (or any third-party) code, prompts, text, mascot or branding.** Original work only. Do not name the mascot "Zero" or make it a fox.
5. **Safety:** school-path content is low-voltage only (≤ 12 V DC, ≤ 2 A). No mains, no LiPo/Li-ion charging, no soldering instructions without the safety block. See `.agents/rules/safety.md`.
6. **Do not invent technical facts.** If unsure about a spec, formula, pinout or library API, say so, check docs, and mark `needs-verification`. Hardware-touching content is `needs-human-verification` until the maintainer confirms.
7. **Do not add a dependency** without: license check, size check, justification in the PR, and an entry in `docs/LICENSING.md`.
8. **Do not edit** `AGENTS.md`, `PRD.md`, or `.agents/rules/*` mid-task. Propose changes in the PR description; the maintainer approves.
9. **Do not make irreversible/destructive moves** (force-push, delete branches, rewrite history, mass-delete content) without explicit approval.
10. **Ask when blocked** instead of guessing on items listed in `PRD.md §14`.

## 3. How to work
- **Plan first** (short plan artifact), then implement in small vertical slices.
- One task = one branch = one PR. Conventional Commits, referencing FR IDs (`feat(FR-SIM-02): ...`).
- Write tests with the code. Run: `pnpm lint && pnpm typecheck && pnpm test` (and `pnpm content:check` for content). Fix before declaring done.
- For UI, verify in the running app/browser and capture a screenshot or recording as an artifact.
- Update `docs/PROJECT-STATE.md` at the end of every task (what changed, what's next, known issues).
- Keep functions small, typed, documented where non-obvious. No `any` without a comment.
- Prefer boring, well-maintained libraries. Prefer pure functions for logic (graders, calculators, solvers).

## 4. Repo map
```
apps/desktop/            Tauri app (src-tauri/ = Rust, src/ = React)
packages/
  config/                APP_NAME, constants, feature flags
  content-schema/        Zod schemas + content build/validate
  ui/                    Design system components
  sim-circuit/           netlist model, SPICE bridge, part models
  sim-avr/               avr8js wrapper, virtual peripherals
  sim-robot/             2D robot physics scene
  graders/               pure auto-graders
  calculators/           pure calculator functions
  coach/                 prompt builder, RAG, safety guard, evals
  storage/               SQLite access, migrations, export/import
  i18n/                  locale loading, helpers
content/                 paths, projects, components, glossary, i18n
docs/                    PRD companions, ADRs (docs/adr/)
tests/                   e2e/, coach-evals/
tools/                   scripts (content lint, license audit)
.agents/                 rules/, workflows/, skills/
```

## 5. Conventions (summary; details in rules)
- TypeScript strict. ESLint + Prettier. Rust: `cargo fmt` + `clippy -D warnings`.
- React: function components, hooks, Zustand for state, TanStack Query only for async local ops. Tailwind + CSS variables for theming.
- File names `kebab-case`; components `PascalCase`; constants `UPPER_SNAKE`.
- All user-facing strings go through i18n (`t('key')`). No hard-coded UI text.
- Accessibility is a feature: labels, focus order, contrast, reduced motion.
- Units: SI, shown with symbols (V, A, Ω). Resistor/capacitor values formatted with engineering notation.

## 6. Definition of Done
See `PRD.md §13`. In short: acceptance criteria + tests + offline + a11y + docs + state file + license check + safe content.

## 7. Where to ask
If anything is ambiguous, add a question to `docs/PROJECT-STATE.md → Open Questions` and ask the maintainer in chat. Do not proceed on assumptions for items in `PRD.md §14`.

## 8. Slash workflows (in `.agents/workflows/`)
`/kickoff` · `/feature` · `/new-lesson` · `/new-exercise` · `/new-project` · `/review-content` · `/adr` · `/release`
