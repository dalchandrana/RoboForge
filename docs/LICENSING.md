# Licensing

## Project
| Asset | License | Notes |
|---|---|---|
| Code | Apache-2.0 (pending final; MIT acceptable) | Patent grant is a plus |
| Content (lessons, quizzes, projects, diagrams we author) | CC BY-SA 4.0 | Attribution + share-alike |
| Brand (name, logo, mascot) | Reserved; usage policy TBD | Forks must rebrand |
| Translations | CC BY-SA 4.0 | Contributors keep attribution |

## Third-party (verify each at integration time; update this table)
| Component | Expected license | Concern |
|---|---|---|
| Tauri | MIT/Apache-2.0 | OK |
| React, Vite, Zustand | MIT | OK |
| avr8js | MIT | Verify peripheral coverage |
| ngspice | BSD-style (verify) | If bundled natively/WASM, include notices |
| arduino-cli / avr-gcc | GPL-family | Ship as **separate sidecar binary**, not linked; provide source offer/notice |
| KiCad | GPL | Link/export only; don't embed |
| Ollama | MIT | User-installed; we call its HTTP API |
| Model weights (e.g., Gemma) | Model-specific terms | Never bundle; show terms at download |
| Fonts | Check each (prefer OFL) | Bundle locally |
| Icons | Check each (prefer MIT/ISC/Apache) | |

## Rules
- No dependency without recording license, version, and purpose here.
- No GPL code statically linked into the app binary without maintainer approval.
- CI runs a license audit and fails on unknown/disallowed licenses.
- Third-party content (images, text) needs a compatible license recorded in front-matter.

## Respecting index-0.in
We took *inspiration from its published philosophy only*. Its license forbids reuse of its code, content, prompts, name, logo, and branding; we use none of them.

## Kit links & funding disclosure
Affiliate links (if any) are labelled, optional, never required, and never influence rankings. Costs and donations are published.
