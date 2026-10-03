# Content Guide

For maintainers, educators and agents writing lessons, projects and components.

## 1. Voice & pedagogy
- Talk to one learner ("you"). Short sentences. One idea per section.
- **Intuition before formula.** Show it, then name it, then compute it.
- Define terms on first use. Link glossary entries.
- Use analogies, and say where they break.
- Always include a **worked example** with units.
- Invite prediction: "What do you think will happen?" before revealing.
- Mistakes are normal. Celebrate effort and specific progress.
- Reading level: grade 7–9 (school path). Aim for ≤ 15 words/sentence on average.

## 2. Lesson file
`content/paths/<path>/<module>/lNN-<slug>.mdx`

```mdx
---
id: m01-l03-ohms-law
title: "Ohm's law"
path: electronics-embedded-foundations
module: m01-electricity-basics
order: 3
level: beginner            # beginner | intermediate | advanced
minutes: 15
prerequisites: [m01-l02-voltage-current-resistance]
objectives:
  - Explain how voltage, current and resistance relate
  - Calculate any one of V, I, R when given the other two
keyIdeas:
  - "Voltage pushes, resistance resists, current is the result."
  - "V = I × R"
tags: [ohms-law, basics]
glossary: [voltage, current, resistance]
needsHumanVerification: false
verified: true
sources:
  - title: "…"
    url: "…"
license: CC-BY-SA-4.0
authors: ["github-handle"]
locale: en
---
```

### Body structure
1. **Hook** (≤ 3 sentences): a question or surprise.
2. **Idea:** the concept in plain words.
3. **See it:** diagram or `<Circuit src="…" readonly />`.
4. **Try it:** `<TryIt>` with an interactive circuit/sketch and a prediction prompt.
5. **Check it:** `<Quiz id="…" />` (3–5 items) and optional `<Exercise id="…" />`.
6. **Recap:** 3 bullets (mirrors `keyIdeas`).
7. **What's next:** link to the next lesson.

## 3. Components
| Component | Use |
|---|---|
| `<Callout type="info\|tip\|warning\|safety">` | Safety type is mandatory for hazards |
| `<Circuit src="id" readonly mode="breadboard\|schematic" />` | Embedded simulator |
| `<ArduinoSketch src="id" />` | Embedded editor + sim |
| `<TryIt prompt="…">…</TryIt>` | Predict → run → compare |
| `<Quiz id="…" />` | Quiz from `quizzes/<id>.yaml` |
| `<Exercise id="…" />` | Auto-graded task |
| `<Formula>` | KaTeX-rendered formula with unit legend |
| `<Reveal summary="…">` | Collapsible hint/answer |
| `<Term id="voltage">` | Glossary tooltip |

## 4. Quiz file (`quizzes/<id>.yaml`)
```yaml
id: q-m01-l03
items:
  - type: single          # single | multi | numeric | order
    prompt: "A 9 V battery drives a 3 kΩ resistor. What is the current?"
    unit: mA
    answer: 3
    tolerance: 0.01
    explanation: "I = V / R = 9 / 3000 = 0.003 A = 3 mA."
```
Rules: plausible distractors, no trick questions, explanations teach.

## 5. Exercise file (`exercises/<id>.yaml`)
```yaml
id: ex-led-resistor
type: circuit-state
prompt: "Make the LED glow safely from a 9 V battery."
start: circuits/led-start.json
assert:
  - { net: "led", current_mA: { min: 5, max: 20 } }
  - { part: "LED1", status: "ok" }
hints:
  - "What limits the current through an LED?"
  - "Which component should be in series with the LED?"
  - "Try calculating R = (Vsource − Vf) / I."
explanation: "…"
```

## 6. Projects
`content/projects/<slug>/project.mdx` front-matter:
```yaml
id: p3-line-follower
title: "Line follower"
difficulty: 2          # 1–5
minutes: 120
costUSD: { min: 25, max: 45 }
skills: [arduino, sensors, motors]
kit: starter
simulatedTwin: sim.json
needsHumanVerification: true
verifyChecklist:
  - "IR sensor output polarity on the chosen module"
  - "Motor driver pin mapping"
```
Body: Goal → What you'll learn → Parts (BOM) → Safety → Simulate first → Wiring → Build steps → Code → Test checklist → Troubleshooting tree → Extend it → Reflect.

`bom.yaml` per item: `name, qty, spec, costUSD, alternatives[], notes, affiliate(bool)`.

## 7. Components (library)
`content/components/<slug>.mdx`: What it is · Symbol · Pinout (SVG) · Key specs (with ranges) · How it works · Typical circuit · Common mistakes · Safety · Related lessons.

## 8. Images & diagrams
- SVG preferred; original or properly licensed; record license in front-matter.
- Text in diagrams must be translatable (use labelled layers or i18n keys), alt text required, no colour-only meaning.

## 9. Translations
`content/i18n/<locale>/...` mirrors structure; `sourceHash` ties translation to source version; CI reports stale translations. Keep numbers/units locale-aware.

## 10. Verification workflow
1. Author sets `verified: false` + `sources`.
2. Reviewer (human or `/review-content`) checks facts.
3. Maintainer confirms real-hardware items → sets `needsHumanVerification: false`, `verified: true`.
Unverified content may exist in dev builds but **must not ship** in a release.

## 11. Content CI checks
Schema validity · broken links/refs · missing alt text · safety lint · reading-level report · glossary coverage · stale translations · license fields · unverified-content gate on release branches.
