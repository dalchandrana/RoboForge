# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-04

### Added

- **Full 30-Lesson Curriculum**:
  - Module 1: Electricity Basics (L1–L6) with charge, voltage, current, Ohm's law, and series/parallel circuits.
  - Module 2: Discrete Circuits (L7–L12) with capacitors, diodes, LEDs, transistors, sensors, and switches.
  - Module 3: Arduino & Code (L13–L20) with ATmega328P architecture, GPIO, ADC, PWM, serial, and state machines.
  - Module 4: Motion & Actuators (L21–L26) with DC motors, H-bridges, servos, steppers, and power budgeting.
  - Module 5: Your First Robot (L27–L30) with differential drive kinematics, IR line tracking, sonar obstacle navigation, and capstone rover design.
  - All lessons equipped with interactive quizzes and `<Callout type="safety">` blocks enforcing low-voltage Class III SELV ($\le 12\,\text{V DC}, \le 2\,\text{A}$).
- **Interactive Multi-Domain Simulation Workbench**:
  - Analog/Digital Circuit Simulator: Pure TypeScript MNA Gaussian solver, real-time node voltages and branch currents, realistic breadboard and schematic views, virtual multimeter, SPICE netlist export, and burnout diagnostics.
  - Arduino Uno AVR Simulator: Cycle-accurate ATmega328P CPU execution via `avr8js`, interactive board with built-in LEDs, tactile button, potentiometer, and bi-directional serial monitor.
  - 2D Mobile Robot Simulator: Continuous-time unicycle kinematics, instantaneous center of curvature (ICC) arc integration, HC-SR04 ultrasonic sonar raycasting, TCRT5000 dual IR line sensors, autonomous line follower, and obstacle avoidance FSM.
- **Local Socratic AI Coach**:
  - 100% offline localhost Ollama streaming client with 5-level hint ladder and inspectable RAG context drawer.
  - Rigorous safety guard intercepting mains voltage and hazardous battery charging.
  - Zero-RAM AI-Off fallback mode with authored hint progression.
- **Hardware Workshop & Guided Projects**:
  - 5 hardware projects (LED Blink, Traffic Light, Line Follower, Obstacle Avoider, 2-DOF Robotic Arm) with interactive wiring tables, verified C++ firmware, and troubleshooting matrices.
  - Official Starter and Builder kit bill of materials (BOM) with interactive inventory checklist, cost tracking, and CSV/text export.
  - Local Workshop Build Logs with Markdown PR export for community sharing.
  - Vector SVG printable Certificate of Completion.
- **Learning Practice Engine**:
  - Non-punitive daily streaks with weekly freeze protection.
  - Spaced review flashcards.
  - 3 break-time mini-games: Resistor Color Code Quizzer, Uno Pin Matcher, and Logic Gate Puzzle.
- **12 Engineering Calculators**:
  - Ohm's Law, Resistor Color Code, Series/Parallel, Voltage Divider, LED Resistor, RC Filter, Battery Runtime, PWM Waveform, Servo Pulse, Gear Ratio, Motor Power, and SI Prefix Converter.
- **20-Part Component Datasheet Library**:
  - Absolute maximum ratings, interactive pinouts, and protocol cheat sheets (I2C, SPI, UART, PWM).
- **Accessibility & Low-Spec Performance Mode**:
  - Low-Spec Mode (FR-SET-04) disabling heavy backdrop filters/glows and throttling simulation to 30 FPS.
  - Global keyboard shortcuts (`Ctrl/Cmd + 1..9`, `Space` for run/pause, `R` for reset).
  - Screen reader accessible netlist summaries (`aria-live="polite"`).
  - High-contrast `:focus-visible` rings and skip-to-content link.
- **Multi-Platform Release Packaging**:
  - Native Tauri 2 installers for macOS (Apple Silicon & Intel DMG), Linux (AppImage & Debian), and Windows (NSIS & MSI).
  - Automated release workflow with SHA-256 checksum generation.
  - Comprehensive documentation: `docs/UNSIGNED-INSTALLS.md`, `docs/RELEASE-GUIDE.md`, and `docs/EDUCATOR-PACK.md`.

### Security

- Strict Content Security Policy (CSP) blocking external runtime network traffic.
- Zero analytics, cookies, trackers, or remote telemetry.
