---
trigger: always_on
description: Core engineering rules for RoboForge
---
# Core rules
- Follow `AGENTS.md` hard rules. They override anything else.
- TypeScript `strict: true`. No implicit any. No unused exports in packages.
- Logic lives in `packages/*` as pure, tested functions; UI only wires them.
- Never call the network from app code except via the approved modules: `coach/ollama-client` (localhost only) and `updater` (opt-in).
- Errors: never swallow. Show a friendly message to the learner and log detail locally.
- Prefer small PRs (< 400 changed lines excluding generated/content).
- Every new package has: README, tests, `exports` map, and a license header policy consistent with `docs/LICENSING.md`.
- Don't reformat unrelated files. Don't rename things "while you're there".
