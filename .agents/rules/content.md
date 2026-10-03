---
trigger: glob
globs: ["content/**"]
description: Rules for lessons, projects and components
---
# Content rules
- Follow `docs/CONTENT-GUIDE.md` exactly (front-matter, structure, voice).
- Reading level: aim for grade 7–9 for the school path. Define every new term on first use.
- Structure each lesson: Hook → Idea → See it (diagram/sim) → Try it → Check it (quiz) → Recap → What's next.
- Every lesson has: learning objectives (≤ 4), `keyIdeas` (for review cards), at least one interactive element, a quiz (3–5 items), and estimated minutes.
- Math: show units, work through one example step by step. Prefer intuition before formula.
- Never state a spec, pinout, or value you can't verify. Add `verified: false` and a `sources` list until checked.
- Anything involving real hardware sets `needsHumanVerification: true` until the maintainer approves.
- Original wording and original diagrams only. Cite sources for facts; don't copy text. Third-party images need a compatible license recorded in front-matter.
- Inclusive examples: diverse names, no gendered assumptions about who builds robots, globally neutral currency/units.
