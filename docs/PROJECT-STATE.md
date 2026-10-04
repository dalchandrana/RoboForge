# PROJECT-STATE (agents: update this at the end of every task)

**Last updated:** 2026-10-04
**Phase:** 2 — Arduino Emulation + Microcontroller Projects + Tools (In Progress)

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
  - Module 1 (`m01-electricity-basics`): 6 authored lessons & quizzes (L1–L6).
  - Module 2 (`m02-discrete-circuits`): 4 authored lessons & quizzes (L7–L10).
  - Dynamic `LearnView` curriculum navigation dropdown, next/previous lesson controls, and dynamic quiz submission.
  - Automated `content:check` passing with 0 warnings, 0 errors.

### Phase 2: Arduino Emulation + Microcontroller Projects + Tools (In Progress)
- **Slice 1: AVR Simulator Engine & ADR-004 (`packages/sim-avr`)**
  - Authored and accepted `docs/adr/004-arduino-simulation-compilation.md` (avr8js CPU core + pre-compiled Intel HEX pipeline + interactive C++ code viewer).
  - Integrated `avr8js` (v0.21.1, MIT license audited).
  - Implemented Intel HEX parser (`hex-loader.ts`) for record types 00, 01, 02, 04 with checksum verification.
  - Implemented `AvrRunner` (`runner.ts`): CPU lifecycle, Port B/C/D I/O registers, Timer0/1/2 overflow/PWM, 10-bit ADC channel reading, USART serial Tx/Rx byte streaming.
  - Authored 5 standard verified sample sketches (`sample-sketches.ts`): Blink, Serial Echo/Hello, Button Interrupt, Analog Read / PWM, Traffic Light Controller.
  - 13 unit tests passing in `packages/sim-avr/src/index.test.ts` (87.37% statements, 100% functions).
- **Slice 2: Embedded Arduino UI & Virtual Peripherals (`apps/desktop`)**
  - `ArduinoBoardView.tsx`: Realistic SVG Arduino Uno R3 board layout (teal PCB, DIP-28 ATmega328P IC, 16MHz crystal, header sockets with live state dots, built-in Pin 13 LED, TX/RX activity LEDs, interactive tactile button on Pin 2, interactive potentiometer on A0).
  - `SerialMonitor.tsx`: Bi-directional UART terminal console with baud selector, command prompt, autoscroll toggle, clear and copy.
  - `ArduinoCodeEditor.tsx`: Offline C++ code editor with syntax formatting, sample sketch selector, run/pause/reset controls, speed multiplier ($0.25\times, 0.5\times, 1\times, 2\times$), and clock cycle counter.
  - `ArduinoSimulator.tsx`: Master coordinator managing `AvrRunner` simulation loop (`requestAnimationFrame` 50,000 cycles/frame), pin state sync, and serial streaming.
  - `SimulatorView.tsx`: Integrated top-level tab switcher (`⚡ Circuit Simulator` vs `🤖 Arduino Simulator`).
  - Browser verification recording: `arduino_sim_demo`.
- **Slice 3: All 12 Engineering Calculators (`packages/calculators` & `apps/desktop`)**
  - Implemented 12 pure mathematical calculator modules with step-by-step mathematical proofs, worked formulas, and explicit SI engineering units:
    1. Ohm's Law & Power Dissipation ($V = I \times R$, $P = V \times I = I^2 R = V^2 / R$).
    2. Resistor Color Code (4-band and 5-band decoding/encoding, E12/E24 nearest lookup, tolerance window).
    3. Series & Parallel Resistors (equivalent resistance, branch currents, individual voltages, power dissipation).
    4. Voltage Divider ($V_{\text{out}}$ unloaded and loaded with $R_L$, branch quiescent current, attenuation ratio).
    5. LED Current-Limiting Resistor (standard E12/E24 resistor selection, $2\times$ safety factor wattage recommendation).
    6. RC Time Constant & Filter ($\tau = R \times C$, $f_c = \frac{1}{2\pi R C}$, $1\tau, 3\tau, 5\tau$ charging curve).
    7. Battery Operating Life (usable capacity with Peukert derating factor, weighted active/sleep duty cycle, hours/days).
    8. PWM Duty Cycle & Waveform ($T_{\text{on}}$, $T_{\text{off}}$, average voltage, 8-bit Arduino `analogWrite` register).
    9. RC Servo Pulse Width ($544\text{--}2400\,\mu\text{s} \leftrightarrow 0^\circ\text{--}180^\circ$, 50 Hz frame duty cycle).
    10. Gear Ratio & Transmission ($GR = N_{\text{driven}} / N_{\text{driver}}$, output RPM, torque in $\text{N}\cdot\text{m}$ and $\text{kg}\cdot\text{cm}$, efficiency).
    11. DC Motor Speed, Torque & Efficiency (electrical input power, angular velocity $\omega$, mechanical power, efficiency gauge, heat loss).
    12. SI Engineering Prefix Converter (pico, nano, micro, milli, base, kilo, mega, giga with exponential scientific notation).
  - 38 unit tests in `packages/calculators/src/index.test.ts` (94.57% statements, 100% functions).
  - Upgraded `apps/desktop/src/views/ToolsView.tsx` with 5 category filter tabs, quick search, interactive visual resistor, rotating servo horn, and worked derivation cards.
  - Browser verification recording: `calculators_demo`.

## Test & Coverage Status
- **Unit Test Suite:** 112 tests passing (100% pass rate).
- **Code Coverage:** 94.5% statements, 97.36% functions across all workspace packages.
- **Lint & Types:** ESLint (0 errors, 0 warnings), TypeScript strict mode (0 errors).
- **Browser Verifications:**
  - `circuit_sim_demo`
  - `mdx_challenge_demo`
  - `coach_ui_demo`
  - `onboarding_wizard_demo`
  - `curriculum_nav_demo`
  - `arduino_sim_demo`
  - `calculators_demo`

## In progress
- Phase 2, Slice 4: 20-Part Component Library & Cheat Sheets (`content/components/` & `LibraryView.tsx`).

## Next (Phase 2 Milestones)
1. **Slice 4: 20-Part Component Library & Cheat Sheets (`content/components/` & `LibraryView.tsx`):**
   - Absolute maximum ratings, pinouts, and communication protocols (I2C, SPI, UART, PWM).
2. **Slice 5: MVP Hardware Projects P1–P5 & Starter Kit BOM (`content/projects/` & `ProjectsView.tsx`):**
   - 5 guided projects with starter kit BOM and offline guides.
3. **Slice 6: Curriculum Expansion (Modules 2, 3, 4: Lessons 11–26):**
   - Microcontrollers, digital logic, actuators, and sensors.
4. **Slice 7: Learning Motivation & Practice Engine (`PracticeView.tsx`):**
   - Daily challenges, streak tracking, formula flashcards, and achievement badges.

## Open questions (for the maintainer)
1. Recommended reference hardware kit supplier for Phase 2 starter kit verification.

## Decisions log
| Date | Decision | Where |
|---|---|---|
| 2026-10-04 | Free-only, global, desktop + local AI, open-source, school-first | PRD §0/§2 |
| 2026-10-04 | Adopt Tauri 2 + React 19 + TypeScript + Vite + Tailwind for desktop shell | ADR-001 |
| 2026-10-04 | Adopt pnpm monorepo with build-time MDX compilation to static JSON | ADR-002 |
| 2026-10-04 | Adopt hybrid MNA Gaussian solver + SPICE netlist exporter | ADR-003 |
| 2026-10-04 | Adopt avr8js + pre-compiled Intel HEX pipeline + interactive C++ code viewer | ADR-004 |
| 2026-10-04 | Use Apache-2.0 code license and CC BY-SA 4.0 content license | LICENSE / CONTENT_LICENSE.md |

## Known issues / risks
- Large simulator circuits (> 50 nodes) may require sparse matrix optimization (KLU/UMFPACK) in Phase 3 if complex ICs are added.

## Needs human verification
- Pure virtual simulation lessons use `needsHumanVerification: false`. Physical hardware kit builds in Phase 2 will be marked `needsHumanVerification: true` until verified by maintainer on real starter kits.
