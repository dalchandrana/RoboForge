---
description: Implement a feature from the PRD
---
# /feature <FR-ID or description>
1. Locate the requirement(s) in `PRD.md`. Quote the acceptance criteria.
2. Plan (≤ 15 lines): files to touch, tests, risks, deps. If a new dependency or architecture decision is needed, run `/adr` first.
3. Create branch `feat/<FR-ID>-<slug>`.
4. Implement logic in `packages/*` first (pure + tests), then UI.
5. Add/adjust i18n keys, a11y labels, loading/empty/error states.
6. Run `pnpm lint && pnpm typecheck && pnpm test`; run E2E for affected flows; verify **offline**.
7. Verify in the running app; attach screenshot/recording.
8. Update docs and `docs/PROJECT-STATE.md`, `CHANGELOG.md`.
9. Open PR using the template. List any `needs-human-verification` items.
