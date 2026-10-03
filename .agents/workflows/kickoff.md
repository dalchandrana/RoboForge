---
description: Bootstrap the repo from PRD (run once)
---
# /kickoff
1. Read `AGENTS.md`, `PRD.md`, all `docs/*.md`.
2. Produce a plan artifact: summary of understanding, risks, questions. **Stop and ask** the maintainer about any items in `PRD.md §14` that block Phase 0.
3. Scaffold the pnpm monorepo per `AGENTS.md §4`: root `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, ESLint, Prettier, Vitest, Playwright config, `.editorconfig`, `.gitignore`, `.antigravityignore` (ignore `node_modules`, `target`, `dist`, models).
4. Scaffold `apps/desktop` with Tauri 2 + React + Vite + Tailwind; verify `pnpm tauri dev` starts and shows a Home screen with NO network calls.
5. Create packages as empty, typed, tested skeletons (`config`, `content-schema`, `ui`, `storage`, `i18n`, `graders`, `calculators`).
6. Add CI (GitHub Actions): lint, typecheck, unit tests, content check, license audit, build matrix (win/mac/linux).
7. Add `LICENSE` (Apache-2.0 pending), `CONTENT_LICENSE.md` (CC BY-SA 4.0), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, issue/PR templates.
8. Create ADR-001 (stack), ADR-002 (monorepo & content format).
9. Update `docs/PROJECT-STATE.md`. Open a PR summarising what was done.
