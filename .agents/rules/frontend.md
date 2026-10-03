---
trigger: glob
globs: ["apps/desktop/src/**", "packages/ui/**"]
description: UI and UX rules
---
# Frontend rules
- Audience includes 12-year-olds: plain language, short sentences, friendly tone, large click targets (≥ 40px), clear icons with labels.
- Design: calm, high-contrast, playful but not childish. Support light/dark and font-size scaling. Respect `prefers-reduced-motion`.
- Every interactive element: keyboard reachable, visible focus, accessible name. Canvas-based simulators expose a text alternative (netlist / description panel).
- No hard-coded strings: use `t()`. No concatenated sentences.
- Layout must work from 1024×600 up. Test at 125% and 150% OS scaling.
- Use design tokens from `packages/ui`. No inline magic colours.
- Loading and empty states for every async view. No layout shift.
- No external fonts or CDN assets; bundle them (check font license).
- Animations optional and cheap; never required to understand content.
