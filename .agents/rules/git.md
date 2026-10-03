---
trigger: always_on
description: Git and PR rules
---
# Git rules
- Branch: `feat/FR-XXX-short-name`, `fix/...`, `content/...`, `docs/...`.
- Conventional Commits: `feat|fix|docs|content|test|chore|refactor(scope): message` and reference FR IDs.
- PR description: What / Why / How tested / Screenshots / FR IDs / Licenses touched / Needs-human-verification items.
- Never commit: secrets, model weights, large binaries (> 2 MB), generated bundles, personal data.
- Never force-push shared branches. Never rewrite history without approval.
- Squash-merge. Keep `CHANGELOG.md` updated (Keep a Changelog format).
