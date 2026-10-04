# PROJECT-STATE (agents: update this at the end of every task)

**Last updated:** 2026-10-04
**Phase:** 3 — Hardening, Robot Simulation & Launch Readiness (100% Completed — v1.0.0 Ready)

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
  - 13 unit tests passing in `packages/sim-avr/src/index.test.ts`.
- **Slice 2: Embedded Arduino UI & Virtual Peripherals (`apps/desktop`)**
  - `ArduinoBoardView.tsx`: Realistic SVG Arduino Uno R3 board layout (teal PCB, DIP-28 ATmega328P IC, 16MHz crystal, header sockets with live state dots, built-in Pin 13 LED, TX/RX activity LEDs, interactive tactile button on Pin 2, interactive potentiometer on A0).
  - `SerialMonitor.tsx`: Bi-directional UART terminal console with baud selector, command prompt, autoscroll toggle, clear and copy.
  - `ArduinoCodeEditor.tsx`: Offline C++ code editor with syntax formatting, sample sketch selector, run/pause/reset controls, speed multiplier ($0.25\times, 0.5\times, 1\times, 2\times$), and clock cycle counter.
  - `ArduinoSimulator.tsx`: Master coordinator managing `AvrRunner` simulation loop (`requestAnimationFrame` 50,000 cycles/frame), pin state sync, and serial streaming.
  - `SimulatorView.tsx`: Integrated top-level tab switcher (`⚡ Circuit Simulator` vs `🤖 Arduino Simulator`).
- **Slice 3: All 12 Engineering Calculators (`packages/calculators` & `apps/desktop`)**
  - Implemented 12 pure mathematical calculator modules with step-by-step mathematical proofs, worked formulas, and explicit SI engineering units.
  - 38 unit tests in `packages/calculators/src/index.test.ts`.
  - Upgraded `apps/desktop/src/views/ToolsView.tsx` with 5 category filter tabs, quick search, interactive visual resistor, rotating servo horn, and worked derivation cards.
- **Slice 4: 20-Part Component Library & Cheat Sheets (`content/components/` & `apps/desktop`)**
  - Added comprehensive Zod validation schemas in `packages/content-schema`.
  - Authored and verified 20 standard component datasheets (`content/components/*.yaml`) across 8 categories.
  - Implemented `LibraryView.tsx` with dynamic category filters, search bar, interactive pinout visualizer, absolute maximum ratings danger callouts, common mistake callouts, and Protocol Cheat Sheets (I2C, SPI, UART, PWM).
- **Slice 5: MVP Hardware Projects P1–P5 & Starter Kit BOM (`content/projects/`, `content/kits/` & `apps/desktop`)**
  - Added comprehensive Zod validation schemas in `packages/content-schema`.
  - Authored and verified 5 complete hardware projects (`p1-led-blink-lab`, `p2-traffic-light-crossing`, `p3-autonomous-line-follower`, `p4-ultrasonic-obstacle-avoider`, `p5-servo-robotic-arm`).
  - Authored 2 reference Kit specifications (`starter-kit.yaml`, `builder-kit.yaml`).
  - Implemented `ProjectsView.tsx` with Guided Projects, Pinout & Interconnection Table, Step-by-Step Build checklist, Verified C++ syntax code, Troubleshooting Matrix, Simulate First bridge, and BOM inventory checklist with CSV/text export.
- **Slice 6: Curriculum Expansion (Lessons 11–26)**
  - Module 2 extended with L11 and L12.
  - New Module 3 `m03-arduino-and-code` (L13–L20).
  - New Module 4 `m04-motion-and-actuators` (L21–L26).
  - All lessons equipped with quizzes and `<Callout type="safety">` blocks.
- **Slice 7: Learning Motivation & Practice Engine (`packages/storage` & `apps/desktop`)**
  - Non-punitive daily streaks with weekly freeze protection.
  - Milestone badge evaluation with 5 core achievements.
  - Spaced review flashcards.
  - 3 break-time mini-games: Resistor Color Code Quizzer, Uno Pin Matcher, Logic Gate Puzzle.

### Phase 3: Hardening, Robot Simulation & Launch Readiness (Completed)
- **Slice 1: 2D Robot Simulation Engine & ADR-005 (`packages/sim-robot`)**
  - Authored and accepted `docs/adr/005-robot-simulation-engine.md` (continuous-time differential drive kinematics & geometric sensor raycasting).
  - Implemented differential-drive kinematics in `packages/sim-robot/src/kinematics.ts`: unicycle body velocities ($v, \omega$), inverse kinematics, exact arc integration (ICC), optical encoder tick accumulation.
  - Implemented sensor models in `packages/sim-robot/src/sensors.ts`:
    - HC-SR04 ultrasonic sonar raycaster: $15^\circ$ conical aperture with multi-ray testing against polygon obstacles and arena walls.
    - TCRT5000 dual/triple IR line reflectance sensors: continuous analog reflectance and digital threshold over SVG/polyline track paths.
    - Robot collision detector: SAT and point-in-box containment against obstacle blocks and arena boundaries.
  - Implemented autonomous controllers in `packages/sim-robot/src/controllers.ts`: bang-bang and proportional line follower, ultrasonic obstacle avoidance FSM (`FORWARD` -> `BACKUP` -> `TURN`), manual teleoperation.
  - Implemented standard arena presets in `packages/sim-robot/src/arena.ts` (Oval Track, Figure-8, Obstacle Course).
  - 18 unit tests in `packages/sim-robot/src/index.test.ts`.
- **Slice 2: 2D Robot Arena UI & Interactive Simulator (`apps/desktop`)**
  - `RobotArenaCanvas.tsx`: HTML5 canvas rendering 2D differential drive robot, chassis body, rotating wheels, front caster ball, HC-SR04 sonar module, conical sonar raycast beam, dual TCRT5000 IR sensor probes with live floor/line states, track lines with edge borders, and draggable obstacle boxes.
  - `RobotTelemetryHUD.tsx`: Live readouts for linear velocity, compass heading, ultrasonic range, dual IR reflectance percentages, encoder tick counts, and collision indicator.
  - `RobotControls.tsx`: Navigation mode switcher (🎮 Manual Drive, 〰️ Line Follower, 🦇 Obstacle Avoider), arena presets (Oval, Figure-8, Obstacle Maze), run/pause/reset buttons, and on-screen manual D-pad.
  - `RobotSimulator.tsx`: Master coordinator with 60 fps `requestAnimationFrame` loop, keyboard shortcuts (Space, R, WASD, Arrow keys), and milestone integration.
  - Updated `SimulatorView.tsx` with top tab switcher for `🏎️ 2D Robot Simulator`.
- **Slice 3: Curriculum Completion (Module 5: Lessons 27–30 & Capstone)**
  - Module 5 in `content/paths/electronics-embedded-foundations/m05-your-first-robot/`:
    - L27 (differential drive kinematics), L28 (line follower control), L29 (sonar navigation), L30 (capstone design).
    - 4 comprehensive quizzes with feedback explanations.
  - Static bundle compiled with all 30 lessons; `content:check` passing with 0 warnings.
- **Slice 4: Project Build Logs & Community Sharing (FR-PRJ-05, FR-PRJ-06)**
  - Extended `packages/storage` with `ProjectLog` persistence, `saveProjectLog`, `getProjectLogs`, `deleteProjectLog`, and `.roboforge` import/export support.
  - `WorkshopBuildLogs.tsx`: Local workshop log creator and history cards.
  - `CommunityShareModal.tsx`: Generates clean GitHub PR and discussion markdown templates.
  - `CompletionCertificateModal.tsx`: Generates high-resolution vector SVG printable completion certificate with gold seal and verification hash.
- **Slice 5: Accessibility, Low-Spec Mode & Performance Hardening**
  - Low-Spec Mode (FR-SET-04): Toggle in `SettingsView`, sets `[data-low-spec="true"]`, disables heavy backdrop blurs, glow shadows, skips canvas grid lines, and caps simulation loop to 30 FPS for older dual-core school laptops.
  - Reduced Motion (FR-ACC-01): Overrides transitions and animations.
  - Screen reader accessible netlist live region (`aria-live="polite"`).
  - Global keyboard shortcuts: `Ctrl/Cmd + 1..9` tab navigation, `Space` for run/pause, `R` for probe reset.
  - High-contrast `:focus-visible` styling and skip-to-content accessibility link.
- **Slice 6: Multi-Platform Desktop Packaging & Release Workflows**
  - Updated `apps/desktop/src-tauri/tauri.conf.json` and `Cargo.toml` to version `1.0.0` with full packaging metadata (macOS, Windows NSIS, Linux Deb).
  - Authored `.github/workflows/release.yml` with multi-platform matrix build (macOS arm64/x86_64, Ubuntu 22.04, Windows Latest) and automatic SHA-256 checksum generation.
  - Authored `docs/UNSIGNED-INSTALLS.md` and `docs/RELEASE-GUIDE.md`.
- **Slice 7: Docs, Templates & Final Launch Audit**
  - Authored comprehensive `CONTRIBUTING.md`, issue templates in `.github/ISSUE_TEMPLATE/` (bug report, content suggestion, hardware verification).
  - Authored `docs/EDUCATOR-PACK.md` for school computer lab deployment, COPPA/FERPA zero-PII privacy compliance, and classroom kit procurement under $300.
  - Updated `CHANGELOG.md` with complete v1.0.0 release notes.

## Test & Coverage Status
- **Unit Test Suite:** 151 tests passing across 12 test files (100% pass rate).
- **Code Coverage:** >94% statements, >97% functions across all workspace packages.
- **Lint & Types:** ESLint (0 errors, 0 warnings), TypeScript strict mode (0 errors across 15 workspace projects).
- **Content Check:** 30 lessons, 20 components, 5 projects, 2 kits (0 warnings, 0 errors).
- **License Audit:** All dependencies verified (Apache-2.0, MIT, BSD, ISC compliant).

## In progress
- None (Phase 3 100% completed; v1.0.0 release candidate ready).

## Next
1. Cut `v1.0.0` release tag.
2. Publish official desktop builds via GitHub Releases.
3. Conduct community hardware verification on physical classroom kits.

## Decisions log
| Date | Decision | Where |
|---|---|---|
| 2026-10-04 | Free-only, global, desktop + local AI, open-source, school-first | PRD §0/§2 |
| 2026-10-04 | Adopt Tauri 2 + React 19 + TypeScript + Vite + Tailwind for desktop shell | ADR-001 |
| 2026-10-04 | Adopt pnpm monorepo with build-time MDX compilation to static JSON | ADR-002 |
| 2026-10-04 | Adopt hybrid MNA Gaussian solver + SPICE netlist exporter | ADR-003 |
| 2026-10-04 | Adopt avr8js + pre-compiled Intel HEX pipeline + interactive C++ code viewer | ADR-004 |
| 2026-10-04 | Adopt continuous-time 2D differential drive kinematics + raycasting for robot simulation | ADR-005 |
| 2026-10-04 | Use Apache-2.0 code license and CC BY-SA 4.0 content license | LICENSE / CONTENT_LICENSE.md |

## Known issues / risks
- Large simulator circuits (> 50 nodes) may require sparse matrix optimization (KLU/UMFPACK) if complex ICs are added.

## Needs human verification
- Pure virtual simulation lessons use `needsHumanVerification: false`. Physical hardware kit builds use `needsHumanVerification: true` until verified by maintainer on real starter kits.
