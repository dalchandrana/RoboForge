# Roadmap & Task Backlog

Effort is measured in focused agent sessions, not calendar dates. Each phase ends with a demoable vertical slice the maintainer can test.

## Phase 0 — Foundations
- [ ] ADR-001/002 accepted; repo scaffolded (`/kickoff`)
- [ ] CI (lint, type, test, content, license audit, build matrix)
- [ ] Design tokens + UI kit (buttons, cards, callouts, nav, modal, toast)
- [ ] Storage package with migrations + export/import
- [ ] Content pipeline: schemas, MDX renderer, content CI, 1 sample lesson
- [ ] i18n scaffolding (en) + settings screen
**Exit:** app launches, shows sample lesson offline, saves progress.

## Phase 1 — Vertical slice: Circuits + Coach
- [ ] Spike & ADR-003 (SPICE strategy) with benchmark + fixtures
- [ ] Netlist model, ERC-lite, parts (V source, R, LED, switch, GND)
- [ ] Circuit canvas (breadboard + schematic views), multimeter
- [ ] Graders: numeric, circuit-state
- [ ] Ollama detection/install guide/model tier chooser (ADR-006)
- [ ] Coach MVP: Socratic ladder, context viewer, AI-off fallback, first evals
- [ ] Lessons 1–10 (Modules 1–2 partial)
**Exit:** learner completes lessons 1–6 with simulator + coach.

## Phase 2 — Embedded + Calculators + Projects
- [ ] ADR-004 + Arduino compile pipeline
- [ ] avr8js integration, virtual peripherals, serial monitor
- [ ] Remaining parts (capacitor, diode, transistors, pot, LDR, buzzer, motor)
- [ ] 12 calculators; 20 component pages
- [ ] Lessons 11–30; quizzes; hints
- [ ] Projects P1–P5 with BOMs + kit page (needs human verification)
- [ ] Streaks, badges, review cards
**Exit:** full MVP path playable end-to-end.

## Phase 3 — Hardening & Launch
- [ ] Robot 2D sim scene for line follower/obstacle car
- [ ] Accessibility audit & fixes; low-spec mode; perf budgets
- [ ] Installers (Win/macOS/Linux x64+ARM64), unsigned-build guide, checksums
- [ ] Docs site, contribution workflow, issue templates, Discussions
- [ ] Maintainer hardware verification of all projects
- [ ] Public v1.0

## Phase 4 — College Track
- [ ] Control lab (plant models, PID tuner, Bode)
- [ ] Kinematics lab (FK/IK)
- [ ] PCB track content + KiCad guided workflows (link/export; no GPL embedding)
- [ ] ESP32/RP2040 sim research
- [ ] Mock interview mode

## Phase 5 — Advanced & Community
- [ ] Local ROS 2 bundle (Docker/WSL guidance) + guided labs
- [ ] Perception basics (Pyodide/OpenCV.js)
- [ ] Teacher pack (printables), translations pipeline
- [ ] Code signing (if funded)

## Always-on backlog
Bug triage · content accuracy fixes · dependency updates · security audits · community PR reviews.
