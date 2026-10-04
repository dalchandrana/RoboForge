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

### Phase 2: Arduino Emulation + Microcontroller Projects + Tools (Completed)
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

- **Slice 4: 20-Part Component Library & Cheat Sheets (`content/components/` & `apps/desktop`)**
  - Added comprehensive Zod validation schemas in `packages/content-schema`: `ComponentSchema`, `PinFunctionSchema`, `ComponentPinSchema`, `AbsoluteMaxRatingsSchema`.
  - Authored and verified 20 standard component datasheets (`content/components/*.yaml`) across 8 categories (passives, semiconductors, power, ICs, inputs, actuators, sensors, modules):
    - `resistor-axial`, `capacitor-ceramic`, `capacitor-electrolytic`, `diode-1n4148`, `diode-1n4007`, `led-5mm`, `transistor-2n2222`, `transistor-2n3906`, `mosfet-irfz44n`, `ic-ne555`, `ic-lm358`, `regulator-7805`, `switch-tactile-6mm`, `potentiometer-10k`, `servo-sg90`, `sensor-hc-sr04`, `sensor-dht11`, `driver-l298n`, `motor-tt-gearmotor`, `mcu-atmega328p`.
    - Every component includes: category, package, description, operating/absolute maximum ratings, full pinout table with functions, common learner mistakes, and practical application notes.
  - Implemented `LibraryView.tsx` with dynamic category filters, search bar, interactive pinout visualizer with hover function details, absolute maximum ratings danger callouts, common mistake callouts, and comprehensive Protocol Cheat Sheets (I2C, SPI, UART, PWM).
  - Bundled into offline static payload via `tools/content-build` and validated with `tools/content-lint`.
  - Browser verification recording: `component_library_demo`.

- **Slice 5: MVP Hardware Projects P1–P5 & Starter Kit BOM (`content/projects/`, `content/kits/` & `apps/desktop`)**
  - Added comprehensive Zod validation schemas in `packages/content-schema`: `ProjectSchema`, `KitSchema`, `ProjectWiringItemSchema`, `ProjectStepSchema`, `ProjectTroubleshootingItemSchema`, `ProjectCodeSchema`.
  - Authored and verified 5 complete hardware projects (`content/projects/*.yaml`):
    - `p1-led-blink-lab`: Starter Kit, beginner, 5V DC low-voltage, resistor current-limiting, verified Arduino C++ firmware.
    - `p2-traffic-light-crossing`: Starter Kit, beginner/intermediate, 3-light sequence with pedestrian button, non-blocking finite state machine (FSM).
    - `p3-autonomous-line-follower`: Starter Kit, intermediate, 2WD TT chassis, L298N dual H-bridge motor driver, dual TCRT5000 IR sensors, common ground isolation.
    - `p4-ultrasonic-obstacle-avoider`: Builder Kit, intermediate, active SG90 servo pan radar with HC-SR04 sonar module, reactive navigation algorithm.
    - `p5-servo-robotic-arm`: Builder Kit, advanced, 2-DOF articulated arm (azimuth & elevation), dual potentiometer teleoperation with exponential moving average (EMA) jitter filter.
  - Authored 2 reference Kit specifications (`content/kits/*.yaml`):
    - `starter-kit.yaml`: $32–$42 USD estimated cost, covers P1, P2, P3, and Modules 1–3, vendor-neutral alternatives, Class III SELV ≤ 9V/2A.
    - `builder-kit.yaml`: $58–$75 USD estimated cost, covers ultrasonic sonar, 3x SG90 servos, 2-DOF arm linkage, Class III SELV ≤ 9V/2A.
  - Implemented `ProjectsView.tsx`:
    - Guided Projects tab with kit tier filters (All, Starter, Builder), quick search, difficulty stars, and time/cost badges.
    - Interactive Project Guide: Overview & Safety (≤ 12V / 2A directives), Pinout & Interconnection Table with color badges, Step-by-Step Build checklist, Verified C++ syntax code with 1-click clipboard copy, and Symptom-Cause-Remedy Troubleshooting Matrix.
    - "Simulate First" (FR-PRJ-02) action button bridging directly to virtual simulated twin.
    - "Needs Human Hardware Verification" banner (PRD §14 compliance) with specific verification checklists.
    - Official Kits & BOM tab (FR-PRJ-03): Interactive workshop inventory checklist with progress gauge and live remaining cost recalculation.
    - Offline BOM Export (FR-PRJ-04): 1-click CSV download and 1-click printable workshop text checklist.
  - Browser verification recording: `hardware_projects_demo`.

- **Slice 6: Curriculum Expansion (Lessons 11–26)**
  - Module 2 extended with L11 (sensors & voltage dividers) and L12 (switches & breadboarding).
  - New Module 3 `m03-arduino-and-code` (L13–L20): microcontrollers, blink, digital I/O & pull-ups, ADC, PWM, serial debugging, state machines, hysteresis.
  - New Module 4 `m04-motion-and-actuators` (L21–L26): DC motors & flyback, H-bridge, servos, steppers, power budgets, encoders.
  - Each lesson has a quiz and a `<Callout type="safety">` block; `path.yaml` now lists 4 modules; bundle contains 26 lessons.
  - `content:check` passes with 0 warnings.

- **Slice 7: Learning Motivation & Practice Engine (`packages/storage` & `apps/desktop`)**
  - Implemented pure motivation engine in `packages/storage/src/motivation.ts`:
    - Non-punitive daily streaks calculation (`computeStreak`) with automatic weekly freeze days (up to 2 freezes preserved per week).
    - Milestone badge evaluation (`evaluateBadges`) awarding 5 core achievements:
      1. *Circuit Starter*: Complete any lesson in Module 1.
      2. *Component Master*: Explore components in the library.
      3. *Code Blinker*: Run the Arduino Uno simulator.
      4. *Motion Maker*: Complete any lesson in Module 4.
      5. *First Robot*: Build and complete any hardware project.
    - Spaced review flashcards generator (`buildFlashcards`) harvesting `keyIdeas` from completed lessons.
  - Authored 15 unit tests in `packages/storage/src/motivation.test.ts`.
  - Extended `StorageService` to persist active days, badges, and milestones with seamless export/import support in `.roboforge` JSON bundles.
  - Implemented `PracticeView.tsx` in `apps/desktop`:
    - Interactive Streak & Freeze Shelf displaying current streak, record streak, and active freeze shield.
    - Milestone Badge Shelf showing unlocked achievements with timestamps and remaining goals.
    - Spaced Review Flashcard Carousel with question reveal/hide mechanics.
    - 3 Break-time Practice Mini-Games:
      1. *Resistor Colour Code Quizzer*: 4-band resistor canvas, 60-second non-punitive timer, E12 resistor values, score counter.
      2. *Uno Pin Matcher*: Interactive matching of peripherals (PWM, ADC, I2C, UART) to Uno physical pins.
      3. *Logic Gate Puzzle*: Interactive truth tables (AND, OR, NOT, XOR) with toggle switches and live output lamp.
  - Browser verification recording: `practice_engine_demo`.

### Phase 3: Hardening, Robot Simulation & Launch Readiness (In Progress)
- **Slice 1: 2D Robot Simulation Engine & ADR-005 (`packages/sim-robot`)**
  - Authored and accepted `docs/adr/005-robot-simulation-engine.md` (pure TypeScript continuous-time differential drive kinematics & geometric sensor raycasting).
  - Implemented exact differential-drive kinematics in `packages/sim-robot/src/kinematics.ts`: unicycle body velocities ($v, \omega$), inverse kinematics, exact arc integration (Instantaneous Center of Curvature ICC), optical encoder tick accumulation, and global polygon vertex transformations.
  - Implemented sensor models in `packages/sim-robot/src/sensors.ts`:
    - HC-SR04 ultrasonic sonar raycaster: $15^\circ$ conical aperture with multi-ray testing against polygon obstacles and arena walls, returning distance in cm.
    - TCRT5000 dual/triple IR line reflectance sensors: continuous analog reflectance and digital threshold over SVG/polyline track paths.
    - Robot collision detector: Separating Axis Theorem (SAT) and point-in-box containment against obstacle blocks and arena boundaries.
  - Implemented autonomous controllers in `packages/sim-robot/src/controllers.ts`:
    - 2-sensor discrete bang-bang line follower and continuous proportional (P) line follower.
    - Reactive ultrasonic obstacle avoidance finite state machine (`FORWARD` -> `BACKUP` -> `TURN`).
    - Manual keyboard/joystick teleoperation controller.
  - Implemented standard educational track and arena presets in `packages/sim-robot/src/arena.ts` (Oval Track, Figure-8 Lemniscate, Obstacle Course).
- **Slice 2: 2D Robot Arena UI & Interactive Simulator (`apps/desktop`)**
  - Implemented interactive 2D simulation workbench components in `apps/desktop/src/components/robot/`:
    - `RobotArenaCanvas.tsx`: HTML5 canvas rendering 2D differential drive robot, chassis body, rotating wheels, front caster ball, HC-SR04 sonar module, conical sonar raycast beam with distance contact point, dual TCRT5000 IR sensor probes with live floor/line states, track lines with edge borders, and draggable/interactive obstacle boxes.
    - `RobotTelemetryHUD.tsx`: Digital readouts for linear velocity, heading angle with compass directions, ultrasonic range with danger alerts, dual IR reflectance percentages, encoder tick counts, and collision indicator.
    - `RobotControls.tsx`: Navigation mode switcher (🎮 Manual Drive, 〰️ Line Follower, 🦇 Obstacle Avoider), arena presets (Oval, Figure-8, Obstacle Maze), run/pause/reset buttons, and on-screen manual D-pad.
    - `RobotSimulator.tsx`: Master coordinator with 60 fps `requestAnimationFrame` loop, keyboard shortcuts (Space, R, WASD, Arrow keys), and milestone integration.
  - Updated `SimulatorView.tsx` with top tab switcher for `🏎️ 2D Robot Simulator`.
  - Wired `onRobotRan` milestone in `App.tsx` marking `'ran-robot-sim'`.
  - Browser verification recording: `robot_simulator_demo`.

- **Slice 3: Curriculum Completion (Module 5: Lessons 27–30 & Capstone)**
  - Created Module 5 in `content/paths/electronics-embedded-foundations/m05-your-first-robot/`:
    - `module.yaml`: Module 5 metadata and lesson sequence.
    - `l27-differential-drive-kinematics.mdx`: Unicycle kinematics, wheel radius $R$, wheelbase $L$, body velocities ($v, \omega$), straight/pivot/zero-radius spin maneuvers, and `<Callout type="safety">` block.
    - `l28-line-following-robot.mdx`: TCRT5000 optical reflectance sensors, track straddle mounting, discrete bang-bang vs smooth proportional steering, and `<Callout type="safety">` block.
    - `l29-obstacle-avoiding-robot.mdx`: HC-SR04 ultrasonic echo time-of-flight, microsecond pulse decoding ($d = t / 58.2$), non-blocking reactive finite state machine (`FORWARD` -> `BACKUP` -> `TURN`), and `<Callout type="safety">` block.
    - `l30-capstone-robot-design.mdx`: 4-stage engineering lifecycle (Plan, Simulate, Build, Reflect), total stall power budget, evaluation rubric, multimeter continuity verification, and `<Callout type="safety">` block.
    - 4 comprehensive quizzes (`quizzes/q-m05-l27...` to `q-m05-l30...`) with multi-choice questions and explanatory feedback.
  - Updated `path.yaml` linking all 5 curriculum modules.
  - Bundled static payload into `apps/desktop/src/content-bundle.json` with 30 lessons.
  - Validated with `tools/content-lint`: 30 lessons, 20 components, 5 projects, 2 kits (0 warnings, 0 errors).

## Test & Coverage Status
- **Unit Test Suite:** 147 tests passing across 12 test files (100% pass rate).
- **Code Coverage:** >94% statements, >97% functions across all workspace packages.
- **Lint & Types:** ESLint (0 errors, 0 warnings), TypeScript strict mode (0 errors across 15 workspace projects).
- **Content Check:** 30 lessons, 20 components, 5 projects, 2 kits (0 warnings, 0 errors).
- **Browser Verifications:**
  - `circuit_sim_demo`
  - `mdx_challenge_demo`
  - `coach_ui_demo`
  - `onboarding_wizard_demo`
  - `curriculum_nav_demo`
  - `arduino_sim_demo`
  - `calculators_demo`
  - `component_library_demo`
  - `hardware_projects_demo`
  - `practice_engine_demo`
  - `robot_simulator_demo`

## In progress
- Phase 3, Slice 4: Project Build Logs & Community Sharing (FR-PRJ-05, FR-PRJ-06).

## Next (Phase 3 Milestones)
1. **Slice 4: Project Build Logs & Community Sharing (FR-PRJ-05, FR-PRJ-06):**
   - SQLite `project_logs`, export PR template, completion certificate.
2. **Slice 5: Accessibility, Low-Spec Mode & Performance Hardening:**
   - Low-spec toggle, full keyboard navigation, WCAG 2.2 AA.
3. **Slice 6: Multi-Platform Desktop Packaging & Release Workflows:**
   - Tauri bundle config, GitHub Actions matrix build.
4. **Slice 7: Docs, Templates & Final Launch Audit:**
   - `CONTRIBUTING.md`, issue templates, educator pack.

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
