# Contributing

Thank you! You can help with **lessons, translations, bug reports, code, diagrams, project builds, and testing on real hardware**.

## Ways to contribute

- **Content:** follow `docs/CONTENT-GUIDE.md`; use the lesson template; run `pnpm content:check`.
- **Translations:** copy a lesson to `content/i18n/<locale>/` and translate; keep numbers/units correct.
- **Hardware testers:** build a project, report what worked in an issue using the "Hardware verification" template.
- **Code:** pick an issue labelled `good first issue`; reference the FR ID.

## Ground rules

1. Be kind (see `CODE_OF_CONDUCT.md`).
2. Original work only; no copying from other courses or products.
3. Safety first: school content is low-voltage only.
4. No telemetry, accounts or network calls added to the app.
5. Add tests and docs with your change.

## PR checklist

- [ ] Linked FR ID / issue
- [ ] `pnpm lint && pnpm typecheck && pnpm test` pass
- [ ] `pnpm content:check` passes (if content)
- [ ] Works offline
- [ ] Accessibility considered (keyboard, labels, contrast)
- [ ] Licenses of new deps/assets recorded
- [ ] Hardware claims marked `needsHumanVerification`

By contributing you agree your code is licensed under the project's code license and your content under CC BY-SA 4.0.
