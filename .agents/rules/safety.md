---
trigger: always_on
description: Hardware and learner-safety rules
---
# Safety rules
- School path: **≤ 12 V DC, ≤ 2 A**, battery packs of AA/9V only. No mains, no LiPo/Li-ion/charging, no capacitors storing dangerous energy, no soldering in modules 1–4.
- Any lesson/project mentioning batteries, motors, heat, tools, or soldering MUST include a `<Callout type="safety">` block: what can go wrong, how to avoid it, when to ask an adult.
- Never instruct bypassing protections (fuses, resistors, current limits).
- The AI coach must route risky topics (mains, LiPo, high voltage, fire, chemicals) to authored safety text and advise asking a trusted adult/teacher; it must not give step-by-step instructions for them.
- Content CI runs `safety-lint` (keyword + front-matter checks). Do not disable it to make CI pass; fix the content.
- Sim "burn-out" feedback must explain why it happened and how to prevent it in real life.
