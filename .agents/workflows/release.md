---
description: Cut a release
---
# /release <version>
1. Ensure main is green; run full E2E on all three OSes, offline + a11y checks.
2. Run license audit; update `docs/LICENSING.md` and third-party notices.
3. Bump versions, update `CHANGELOG.md`, generate release notes.
4. Build installers; produce SHA-256 checksums; test install on clean machines (maintainer).
5. Draft GitHub Release with OS-warning instructions for unsigned builds. **Maintainer publishes.**
6. Update `docs/PROJECT-STATE.md`.
