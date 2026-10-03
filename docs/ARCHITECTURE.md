# Architecture

> Status: proposed. Changes go through `/adr`. Items marked **[ADR]** are undecided and must not be implemented before approval.

## 1. Principles
Offline-first · privacy by design · pure logic in packages · small surface area for the OS · deterministic simulation · content as data.

## 2. High-level diagram
```
┌──────────────────────────── Tauri app ─────────────────────────────┐
│ React UI (apps/desktop/src)                                        │
│  ├─ Learn (MDX renderer)   ├─ Simulate (Circuit / Arduino / Robot) │
│  ├─ Practice (graders)     ├─ Coach UI    ├─ Tools / Library       │
│  └─ State (Zustand) ── storage pkg ── SQLite (Rust plugin)         │
│                                                                    │
│ Rust core (src-tauri): FS, SQLite, process mgmt (sidecars), update │
│  ├─ sidecar: ngspice (if native)         [ADR-003]                 │
│  ├─ sidecar: arduino-cli / avr-gcc       [ADR-004]                 │
│  └─ HTTP client → localhost:11434 (Ollama) ONLY                    │
└────────────────────────────────────────────────────────────────────┘
        ▲                         ▲
   content/ (bundled packs)   Ollama (user-installed, local models)
```

## 3. Tech stack (defaults)
| Layer | Choice | Notes |
|---|---|---|
| Shell | Tauri 2 (Rust) | Small installers. Fallback: Electron (ADR) |
| UI | React 18 + TypeScript + Vite | |
| Styling | Tailwind + CSS variables (design tokens) | |
| State | Zustand | Async local ops via TanStack Query optional |
| Content | MDX (unified/remark/rehype) + YAML + Zod | Compile at build time |
| Storage | SQLite (tauri-plugin-sql or rusqlite) | WAL mode, migrations |
| Editor | CodeMirror 6 (lighter) or Monaco | Decide in spike; lazy-load |
| Circuit solve | ngspice [ADR-003] | WASM build (evaluate existing npm packages) vs native sidecar vs custom MNA solver for simple DC/transient |
| AVR emulation | avr8js (MIT) | Verify peripheral coverage (Timers, UART, GPIO, ADC) |
| Arduino compile | arduino-cli + avr-gcc bundled, or WASM toolchain [ADR-004] | Measure size/time; sandbox |
| Robot sim | Rapier (WASM) or Matter.js | 2D first |
| Charts | uPlot or lightweight canvas | scope & control plots |
| AI | Ollama HTTP API (localhost) | Streaming responses |
| RAG | SQLite FTS5 + small local embeddings (optional) | Start with FTS5 keyword + lesson metadata |
| i18n | ICU MessageFormat (e.g. i18next + ICU plugin) | |
| Tests | Vitest, Testing Library, Playwright, cargo test | |
| CI | GitHub Actions | win/mac/linux matrix |
| Docs site | Astro Starlight or Docusaurus | optional |

**Verify** library versions, APIs and licenses at implementation time; do not trust this table blindly.

## 4. Monorepo layout
See `AGENTS.md §4`. Package boundaries: UI imports packages; packages never import UI; `sim-*` have no DOM dependencies in core logic (so they're testable in Node).

## 5. Data & storage
See `PRD.md §8`. `packages/storage` owns schema, migrations (`migrations/NNN_name.sql`), typed queries, export/import (`.roboforge` = zipped JSON + media). Never write to SQLite from UI components directly.

## 6. Circuit simulator
**Model:** a single canonical **netlist** (components, pins, nets, parameters). Views (breadboard/schematic) are projections.
**Pipeline:** edit → validate (ERC-lite: floating nets, shorted sources, no ground) → generate SPICE → solve → map results to UI (probe values, LED brightness, motor speed, burn-out checks).
**Part models:** documented in `packages/sim-circuit/models/*.md` with parameters, limits, and teaching notes. Simplified motor/servo models are labelled "educational approximation".
**Friendly diagnostics:** convert solver errors ("singular matrix") into learner language ("no path to ground").
**Determinism:** fixed seeds/time steps; golden fixtures for lessons' circuits.
**Fallback [ADR-003]:** custom modified nodal analysis (MNA) for linear + simple nonlinear (diode) if ngspice integration is too heavy.

## 7. Arduino simulator
Sketch → compile → hex → avr8js CPU → virtual peripherals (GPIO, timers/PWM, ADC, UART, I2C optional later) → board canvas. Virtual parts (LED, button, pot, servo, HC-SR04, LCD) implement a small `Peripheral` interface. Scheduling: run in a Web Worker; target real-time ± drift tolerance with a visible "sim speed" control. Circuit view and Arduino view share pin/net definitions.

## 8. Coach (AI)
`packages/coach`: prompt builder (system + lesson context + user state), safety guard (pre/post filters), stage manager (hint ladder), RAG retriever, Ollama client (streaming, abortable), eval harness. See `docs/AI-COACH-SPEC.md`.

## 9. Security & privacy
- Tauri: minimal capability allowlist; no shell execution except named sidecars with fixed args; strict CSP; no `eval`.
- Sidecar compile runs in a temp dir with timeouts and size limits.
- Content packs: signed/checksummed; MDX compiled at build time (no runtime MDX eval of untrusted content).
- No telemetry. Crash logs stay local; user may choose to copy them into a GitHub issue.

## 10. Performance budgets
Boot < 3 s · lesson open < 300 ms · circuit edit-to-result < 150 ms (small circuits) · sim canvas 60 fps ≤ 100 parts · idle RAM ≤ 400 MB (AI off) · installer ≤ 250 MB. Lazy-load simulators and editors. Web Workers for solvers/emulators.

## 11. Observability (local only)
Structured logs to a rolling local file; "Export diagnostics" button creates a text bundle the user can review and share manually.

## 12. Build & release
`pnpm tauri build` per OS in CI; artifacts → GitHub Releases with checksums. Content packs built by `pnpm content:build` → versioned archives.

## 13. ADR index
- [ADR-001 Stack](adr/001-stack.md) (Accepted) · [ADR-002 Monorepo/content format](adr/002-monorepo-content-format.md) (Accepted) · [ADR-003 SPICE strategy](adr/003-spice-strategy.md) (Accepted) · ADR-004 Arduino compile · ADR-005 Editor choice · ADR-006 Ollama integration & model tags · ADR-007 i18n library
