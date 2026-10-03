# ADR-003: Circuit Simulation Strategy (MNA Engine & SPICE Interoperability)

## Context
RoboForge requires an offline circuit simulation engine for its desktop learning environment (PRD FR-SIM-01..07).
Key requirements:
1. Low latency: Interactive circuit edits must solve in < 50ms to sustain 60 fps rendering.
2. Low-memory footprint: Works reliably on 4 GB RAM laptops without crashing or freezing.
3. Learner-friendly diagnostics: Convert complex matrix singularities into actionable pedagogical feedback (e.g. "Missing ground path" or "Shorted power supply") instead of raw mathematical errors.
4. Support for educational DC and transient components: DC voltage sources, batteries, resistors, LEDs (Shockley diode model with forward voltage drop and burnout limits), switches, buttons, and ground references.
5. Deterministic, testable in pure Node.js environments without DOM or platform-specific native binaries.

## Options Considered

### Option 1: Embedded Pure TypeScript Modified Nodal Analysis (MNA) Engine (Accepted for Core)
- **Architecture**: A pure TypeScript mathematical solver implementing Modified Nodal Analysis with Newton-Raphson iteration for non-linear components (diodes/LEDs), running in a Web Worker.
- **Pros**:
  - Zero external dependencies and zero native binary sidecars.
  - Extremely lightweight (< 30 kB compressed bundle).
  - Instant startup (< 5ms solve time for circuits up to 50 nodes).
  - Custom Electrical Rule Check (ERC-lite) intercepts short circuits, floating nodes, and missing ground references *before* solving, producing friendly learner diagnostics.
  - Fully deterministic across Windows, macOS, Linux, and headless test runners (Node/Vitest).
- **Cons**:
  - Does not support advanced RF or complex semiconductor SPICE sub-circuits out of the box (unnecessary for Phase 1-3 school robotics curriculum).

### Option 2: `ngspice` compiled to WebAssembly (WASM)
- **Architecture**: Emscripten-compiled ngspice C binary executing within a WebAssembly worker.
- **Pros**: Full SPICE3f5 / XSPICE compatibility for advanced modeling.
- **Cons**:
  - Substantial bundle size increase (~2 to 5 MB WASM binary).
  - Higher initialization latency (> 200ms cold start).
  - Generic solver error strings ("matrix singular", "timestep too small") require complex regex post-processing to explain to a 12-year-old beginner.
  - Potential memory leaks in long-running WASM instances without aggressive lifecycle management.

### Option 3: Native `ngspice` Sidecar Process via Tauri IPC
- **Architecture**: Bundling native OS-specific `ngspice` executables for x64 and ARM64.
- **Pros**: Native C execution speed.
- **Cons**:
  - Triples cross-platform packaging complexity and introduces OS-level sidecar process permission overhead.
  - IPC serialization latency across the Tauri bridge for rapid interactive slider dragging.
  - GPL licensing considerations for bundled binaries.

## Decision
Adopt **Option 1 (Pure TypeScript MNA Solver with ERC-lite)** as the primary built-in simulation engine for RoboForge.
- Provide a clean export bridge to standard SPICE netlists (`.cir` / `.net`) so learners can export their designs to external SPICE tools (ngspice, KiCad) at any time.
- If future college-level courses (Phase 4) require advanced AC analysis or specialized op-amp macro-models, a pluggable WASM backend can be introduced without breaking the canonical Netlist AST.

## Consequences
- 100% offline, cross-platform deterministic simulation with zero build toolchain headaches.
- Tests can run seamlessly in Vitest with golden mathematical fixtures.
- Netlist model and solver remain pure functions in `packages/sim-circuit`.
