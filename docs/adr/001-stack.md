# ADR-001: Core Technology Stack

## Context
RoboForge is an offline-first desktop application teaching electronics, embedded systems, and robotics. It requires a lightweight binary footprint (<= 250 MB installer), low idle memory usage (<= 400 MB RAM without local AI), high reliability, and strict privacy (zero telemetry, zero required external servers).

## Options Considered
1. **Tauri 2 + React + TypeScript + Vite (Accepted)**
   - *Pros:* Generates native desktop binaries using system WebViews (macOS WKWebView, Windows WebView2, Linux WebKitGTK), keeping installer sizes < 20 MB and idle RAM footprint low. Native Rust backend handles local filesystem, SQLite, and IPC sidecars securely.
   - *Cons:* Requires Rust toolchain for native compilation; slight WebView behavioral differences across platforms.
2. **Electron**
   - *Pros:* Single Chromium runtime across all OSes.
   - *Cons:* Bundled Chromium balloons installer to > 150 MB and idle RAM to 600+ MB before any simulator or AI is loaded, failing PRD §7 non-functional requirements.
3. **Flutter Desktop**
   - *Pros:* Single language (Dart) for UI and logic.
   - *Cons:* Less mature ecosystem for SPICE circuit simulators, avr8js WASM integration, and interactive browser-based editors like CodeMirror/Monaco.

## Decision
Adopt **Tauri 2 with React 19, TypeScript, Vite, and Tailwind CSS**.
- Pure logic resides in `packages/*` as framework-agnostic TypeScript functions.
- UI styling uses Tailwind with CSS custom properties from `@roboforge/ui` design tokens for instant high-contrast light/dark theming and accessibility scaling.
- Storage layer uses local SQLite in WAL mode.

## Consequences
- Developers need Rust 1.80+ and Node/pnpm installed for building desktop releases.
- Frontend development can be fully run in Vite browser mode for rapid iteration, while release packaging is validated via Tauri.
- Zero network runtime dependencies; all fonts, assets, and icons are bundled locally.
