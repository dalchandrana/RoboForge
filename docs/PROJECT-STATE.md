# PROJECT-STATE (agents: update this at the end of every task)

**Last updated:** 2026-10-04
**Phase:** 1 — Circuits + Coach (Completed)

## Done

### Phase 0: Foundations
- PRD, AGENTS, rules, workflows, docs authored (v0.3).
- Workspace configuration and pinned toolchains (`.nvmrc`, `rust-toolchain.toml`, `.editorconfig`, `.gitignore`, `.antigravityignore`).
- Scaffolding of pnpm monorepo with strict TypeScript, ESLint flat config, Prettier, and Vitest.
- Seven core packages created with pure unit test coverage:
  - `packages/config`, `packages/content-schema`, `packages/ui`, `packages/storage`, `packages/i18n`, `packages/graders`, `packages/calculators`.
- Scaffolding of packages: `sim-circuit`, `sim-avr`, `sim-robot`, `coach`.
- Content pipeline and automated tools: `tools/content-lint`, `tools/content-build`, `tools/license-audit`.
- Desktop Shell (`apps/desktop`): Tauri 2 + React 19 + Vite + Tailwind shell, 9-section sidebar, theme support, SQLite storage.
- Accepted ADR-001 (Core Technology Stack) and ADR-002 (Monorepo and Content Format).

### Phase 1: Circuits + Coach (All 6 Vertical Slices Verified)
- **Slice 1: MNA Circuit Solver (`packages/sim-circuit`)**
  - Canonical netlist representation (`CircuitNetlist`, `CircuitComponent`, `CircuitNode`).
  - Modified Nodal Analysis (MNA) dense Gaussian solver supporting DC voltage/current sources, resistors, switches, grounds, and iterative diode companion models.
  - ERC-lite rules: floating node detection, ground presence, direct short-circuit loops.
  - Standard SPICE exporter (`exportToSPICE`) producing valid `.cir` netlists.
  - 15 golden unit tests with >99% coverage.
  - Accepted ADR-003: SPICE integration strategy (hybrid pure TypeScript MNA solver + standard SPICE export).
- **Slice 2: Breadboard & Schematic UI + Multimeter (`apps/desktop`)**
  - `BreadboardView.tsx`: Realistic prototyping canvas with standard tie-point rails, 4-band dynamic resistor color codes, LED radial glow and charred burnout smoke animations, clickable toggle switches.
  - `SchematicView.tsx`: IEEE standard electronic symbols with live voltage badges and current direction vectors.
  - `VirtualMultimeter.tsx`: Rotary dial ($V_{\text{DC}}$, $\text{mA}$, $\Omega$, OFF), LCD display, red/black probe node clipping.
  - Burnout educational modal (`BurnoutModal.tsx`) explaining physical root causes (excess heat/current) and prevention habits.
  - SPICE netlist export modal (`SpiceExportModal.tsx`).
- **Slice 3: Interactive MDX Challenge Integration (`packages/graders` & `apps/desktop`)**
  - Circuit auto-grader `gradeCircuitState` with deterministic assertions (`node_voltage`, `component_current`, `component_status`, `switch_state`).
  - `InteractiveCircuitChallenge.tsx`: Embedded simulator into lesson markdown with live state feedback and auto-grader validation.
- **Slice 4: Local Socratic AI Coach (`packages/coach` & `apps/desktop`)**
  - Strictly offline localhost Ollama client (`ollama-client.ts`) streaming NDJSON from `http://127.0.0.1:11434`.
  - Transparent Socratic prompt builder with 5-level hint ladder and learner inspectable "What I Can See" RAG context drawer.
  - Safety guard (`safety-guard.ts`): Intercepts mains voltage, LiPo charging, protection bypasses, and toxic chemicals, redirecting to safety documentation and adult supervision.
  - AI-Off fallback mode: Fully functional manual hint ladder without any LLM dependency.
  - 10 unit and eval tests in `packages/coach/src/index.test.ts`.
- **Slice 5: First-Run Onboarding Wizard (`apps/desktop`)**
  - 4-step wizard modal (`OnboardingWizard.tsx`): Welcome, Learner Nickname & Experience Level, Appearance / Theme, and AI Coach Mode.
  - Integrated with SQLite settings persistence in `@roboforge/storage`.
- **Slice 6: Complete Module 1 & Module 2 Curriculum Authoring**
  - Path: `electronics-embedded-foundations`
  - Module 1 (`m01-electricity-basics`): 6 authored lessons & quizzes:
    - L1: What is Electricity? Charges in Motion
    - L2: Voltage and Current: Push and Flow
    - L3: Resistance and Ohm's Law: The Grand Equation
    - L4: Series Circuits: One Path for Current
    - L5: Parallel Circuits: Multiple Branches
    - L6: Switches and Buttons: Controlling Current
  - Module 2 (`m02-discrete-circuits`): 4 authored lessons & quizzes:
    - L7: Diodes and Light-Emitting Diodes (LEDs): One-Way Valves
    - L8: Capacitors: Storing Charge and Timing
    - L9: Transistors as Electronic Switches: Amplifying Control
    - L10: Integrated Circuits: The 555 Timer in Astable Mode
  - Dynamic `LearnView` curriculum navigation dropdown, next/previous lesson controls, and dynamic quiz submission.
  - Automated `content:check` passing with 0 warnings, 0 errors.

## Test & Coverage Status
- **Unit Test Suite:** 67 tests passing (100% pass rate).
- **Code Coverage:** 96.34% statements, 100% functions across all workspace packages.
- **Lint & Types:** ESLint (0 errors, 0 warnings), TypeScript strict mode (0 errors).
- **Browser Verifications:** Verified in browser with WebP recording and PNG screenshot artifacts:
  - `circuit_sim_demo`
  - `mdx_challenge_demo`
  - `coach_ui_demo`
  - `onboarding_wizard_demo`
  - `curriculum_nav_demo`

## In progress
- Phase 1 complete. Ready for Phase 2 (Arduino Emulation + Microcontroller Projects).

## Next (Phase 2 Milestones)
1. **FR-SIM-07-10 (Arduino AVR Simulation):**
   - Package `packages/sim-avr` wrapping `avr8js`.
   - Virtual peripherals: ATmega328P GPIO, Timer0, ADC, UART console.
   - Monaco/CodeMirror C++ code editor with pre-compiled standard sketches (Blink, Button Read, Analog Read).
2. **FR-PRJ-01-05 (Guided Hardware Projects & Starter BOM):**
   - Author 5 guided projects with kit Bill of Materials and interactive breadboard twins.
3. **FR-LIB-01-04 (Component Library & Cheat Sheets):**
   - Visual component pinout diagrams, absolute maximum ratings, and protocol cheat sheets.

## Open questions (for the maintainer)
1. Preferred in-app code editor for Phase 2: Monaco Editor (rich features, larger bundle) vs. CodeMirror 6 (lightweight, highly extensible)?
2. Arduino compilation pipeline: Pre-compile sketch binaries at content build time vs. bundling a WebAssembly AVR-GCC compiler?
3. Recommended reference hardware kit supplier for Phase 2 starter kit verification.

## Decisions log
| Date | Decision | Where |
|---|---|---|
| 2026-10-04 | Free-only, global, desktop + local AI, open-source, school-first | PRD §0/§2 |
| 2026-10-04 | Adopt Tauri 2 + React 19 + TypeScript + Vite + Tailwind for desktop shell | ADR-001 |
| 2026-10-04 | Adopt pnpm monorepo with build-time MDX compilation to static JSON | ADR-002 |
| 2026-10-04 | Adopt hybrid MNA Gaussian solver + SPICE netlist exporter | ADR-003 |
| 2026-10-04 | Use Apache-2.0 code license and CC BY-SA 4.0 content license | LICENSE / CONTENT_LICENSE.md |

## Known issues / risks
- Large simulator circuits (> 50 nodes) may require sparse matrix optimization (KLU/UMFPACK) in Phase 3 if complex ICs are added.

## Needs human verification
- Pure virtual simulation lessons use `needsHumanVerification: false`. Physical hardware kit builds in Phase 2 will be marked `needsHumanVerification: true` until verified by maintainer on real starter kits.
