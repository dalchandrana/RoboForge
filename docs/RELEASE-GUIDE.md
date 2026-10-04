# RoboForge Release Playbook

This document outlines the standard release process for maintainers cutting a new version of RoboForge.

---

## 1. Pre-Release Checklist

Before creating a release tag, verify that the local codebase satisfies all quality gates:

```bash
# 1. Full clean checks
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check

# 2. License audit check
pnpm license:check

# 3. Clean desktop frontend build
pnpm content:build
pnpm --filter @roboforge/desktop build
```

Verify that:
- [ ] `CHANGELOG.md` is up to date with new features, bugfixes, and documentation updates.
- [ ] No `needs-verification` or `needs-human-verification` hardware items are unaddressed in touched content.
- [ ] Content strictly obeys the $\le 12\,\text{V}$, $\le 2\,\text{A}$ Class III SELV safety limits.
- [ ] Version numbers in `apps/desktop/package.json`, `apps/desktop/src-tauri/Cargo.toml`, and `apps/desktop/src-tauri/tauri.conf.json` match the target release (e.g. `1.0.0`).

---

## 2. Cutting the Release

1. Ensure your working tree is clean and on `main`:
   ```bash
   git checkout main
   git pull origin main
   ```

2. Create an annotated git tag following Semantic Versioning (`vMAJOR.MINOR.PATCH`):
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0: Full curriculum, simulators, and offline coach"
   ```

3. Push the tag to trigger the release workflow:
   ```bash
   git push origin v1.0.0
   ```

---

## 3. Automated CI / Build Verification

The `.github/workflows/release.yml` workflow will automatically:
1. Matrix-compile desktop installers on:
   - macOS 14 (Apple Silicon arm64 DMG)
   - macOS 13 (Intel x86_64 DMG)
   - Ubuntu 22.04 (Linux AppImage & Deb)
   - Windows Latest (NSIS setup `.exe` & `.msi`)
2. Run full test and lint suites in CI before packaging.
3. Compute cryptographic SHA-256 hashes for all built assets into `SHA256SUMS.txt`.
4. Create a draft or published GitHub Release containing the artifacts and checksums.

---

## 4. Post-Release Verification

1. Download the release binary for your host operating system from GitHub Releases.
2. Test installation on a clean user account:
   - Verify first-run onboarding flow (`OnboardingWizard`).
   - Open a lesson, complete a quiz.
   - Run the Circuit Simulator (verify MNA solver and burnout banner).
   - Run the Arduino Simulator (verify AVR blink on pin 13).
   - Run the 2D Robot Arena (verify line follower and obstacle avoider).
   - Test progress export (`.roboforge` bundle) and verify import restores status.
   - Verify network isolation (all features work completely offline).

---

## 5. Rollback / Hotfix Procedure

If a critical flaw is discovered after release:
1. Create a hotfix branch from the tag: `git checkout -b fix/v1.0.1 v1.0.0`.
2. Apply the fix and write a regression unit test.
3. Bump the patch version in all 3 files (`package.json`, `Cargo.toml`, `tauri.conf.json`).
4. Merge back to `main`, tag `v1.0.1`, and push.
