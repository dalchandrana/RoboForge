---
description: Author a new lesson
---
# /new-lesson <module> <title>
1. Read `docs/CONTENT-GUIDE.md` and the lesson entry in `docs/CURRICULUM.md` (objectives, prerequisites).
2. Create `content/paths/<path>/<module>/lNN-<slug>.mdx` from the template with valid front-matter.
3. Write: Hook → Idea → See it → Try it → Check it → Recap → What's next. Grade 7–9 reading level; define new terms.
4. Add at least one interactive element (`<Circuit>`, `<ArduinoSketch>`, `<TryIt>`), 3–5 quiz items with explanations, `keyIdeas`, 3 staged hints for each exercise.
5. Add safety callouts if required (see `.agents/rules/safety.md`). Set `needsHumanVerification: true` for real-hardware claims.
6. Add glossary entries and component library links.
7. Run `pnpm content:check` (schema, links, safety lint, reading-level report). Fix all errors.
8. Add the lesson to `module.yaml` order. Update `docs/PROJECT-STATE.md`.
9. PR with title `content(L-XX): <title>` and a checklist of verification items for the maintainer.
