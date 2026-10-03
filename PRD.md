# PRD: RoboForge (working name)

> **Status:** v0.3 — build-ready for Antigravity IDE
> **Read order for agents:** `AGENTS.md` → this `PRD.md` → `docs/PROJECT-STATE.md` → the doc relevant to your task.
> **Name note:** "RoboForge" is a placeholder. Do not hardcode it; use `APP_NAME` from `packages/config`.

---

## 1. Overview

RoboForge is a **free, open-source, offline-first desktop learning platform** that takes a learner from "what is electricity?" to building and programming real robots. It combines structured text lessons, in-app simulators (circuits, Arduino, robots), auto-graded exercises, guided projects with hardware-kit recommendations, and a **local AI coach** that teaches Socratically (hints, not answers).

It is inspired by the *philosophy* of index-0.in (local-first, free forever, coach-don't-tell, text-first learning, no competition) but is an **original product** for robotics. We must not copy its name, mascot, branding, prompts or content (its license forbids it).

### One-line pitch
"A free, private, offline robotics school on your laptop."

### Problem
- Robotics learning is scattered across hundreds of tabs, videos and kits with no path.
- Hardware is expensive and intimidating; many students can't start without it.
- Existing tools are either simulators with no teaching, or courses with no practice.
- AI tools hand over answers, which blocks real learning.
- Many learners have poor internet and cannot rely on cloud services.

### Solution
One installable app: **Learn → Simulate → Build → Reflect**, all on-device, coached by a local AI that refuses to just give the answer.

---

## 2. Principles (non-negotiable)

1. **Free forever, no paywall, no accounts.**
2. **Local-first and private.** No telemetry by default. No user data leaves the machine. Zero required servers.
3. **Understand, don't copy.** The coach guides; it does not dump solutions.
4. **Simulate first, then build.** Every hardware project has a simulated twin.
5. **Safety first.** Low-voltage only for the school path. Safety notes are mandatory in relevant lessons.
6. **Text-first, interactive-second.** Reading and doing beat passive video.
7. **No competition.** No public leaderboards. Progress is personal.
8. **Open by default.** Open-source code, open content, public roadmap.
9. **Runs on modest laptops.** Must work (AI off) on 4 GB RAM; AI mode scales by tier.
10. **Global.** i18n from day one; SI units; vendor-neutral kit advice.

---

## 3. Users

| Persona | Age | Needs | Notes |
|---|---|---|---|
| **P1 School beginner** (primary) | 12–18 | Gentle on-ramp, visuals, small wins, safe | May share a family laptop; may have no hardware |
| **P2 College student** (secondary) | 18–24 | Syllabus depth: controls, PCB, kinematics, ROS | Phase 4+ |
| **P3 Educator / club lead** (contributor) | any | Lesson plans, printable pack, contribute content | Contributes via GitHub PRs |
| **P4 Maker** (incidental) | any | Project guides, BOMs | Served by the Projects hub |

**Minors:** The app collects no personal data and requires no account, which keeps it simple and safe for under-18 users. Any future online feature must be opt-in and reviewed against child-privacy rules (COPPA/GDPR-K/DPDP).

---

## 4. Scope

### 4.1 MVP (v1.0) — IN
- Desktop app (Windows, macOS, Linux) with offline operation.
- Learning path **"Electronics & Embedded Foundations"** — 30 lessons (see `docs/CURRICULUM.md`).
- Local AI coach with Socratic staged hints (see `docs/AI-COACH-SPEC.md`), and an **AI-off mode**.
- **Circuit simulator** (breadboard + schematic view, DC/transient, virtual multimeter, basic scope).
- **Arduino simulator** (AVR-based Uno/Nano class; LEDs, buttons, servo, ultrasonic, serial monitor).
- Auto-graded **exercises** (numeric, circuit-state assertions, code tests).
- Quizzes, streaks, "tiny wins", badges (no leaderboard).
- **12 calculators** + **20-part component library**.
- **5 projects** with Starter-kit BOM and build guide.
- Settings: theme, language, text size, AI model tier, low-spec mode.
- Local progress storage + export/import file.
- Contribution workflow, licenses, donation/sponsor page, feedback via GitHub.

### 4.2 Post-MVP (in order)
1. Phase 4: College tracks — control systems lab, kinematics lab, PCB design (KiCad-guided), ESP32/RP2040 sim.
2. Phase 5: Local ROS 2 bundle, perception basics, teacher pack, first community translations.
3. Later: drone sim, advanced PCB tools, mobile reader.

### 4.3 OUT (do not build)
- Accounts, login, cloud sync, payments, Pro tiers, ads.
- Cloud-hosted simulators or cloud AI as a *requirement* (an opt-in "bring your own API key" may be considered later, off by default).
- Public leaderboards, social feeds, DMs.
- Video hosting.
- Selling hardware (we only recommend, with disclosed links).
- Mains-voltage or LiPo projects in the school path.

---

## 5. Success metrics (measured locally / self-reported, never covertly)

- A new user finishes install → first lesson → first simulation in **under 10 minutes**.
- ≥60% of installers complete lesson 1; ≥30% reach lesson 10 (self-reported via optional feedback).
- Simulator runs ≥30 fps on a 2018-class laptop for the standard circuits.
- App installer ≤ 250 MB (excluding optional AI models).
- ≥10 community-contributed lessons/translations within 6 months of launch.
- GitHub: issue first-response under 72 h.

---

## 6. Functional requirements

Priority: **P0** MVP-blocking · **P1** MVP-desirable · **P2** post-MVP.
Each requirement has an ID. Agents must reference IDs in commits and PRs (e.g., `feat(FR-SIM-02): add voltage probe`).

### 6.1 App shell & navigation (FR-APP)
| ID | Pri | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-APP-01 | P0 | Tauri desktop app boots to Home on Win/macOS/Linux | Cold start < 3 s on reference laptop; no network calls on boot |
| FR-APP-02 | P0 | Sidebar nav: Home, Learn, Practice, Simulate, Projects, Tools, Library, Coach, Settings | Keyboard-navigable; active state; collapses on narrow windows |
| FR-APP-03 | P0 | First-run wizard: language, name (local nickname, optional), goal, hardware owned, AI setup | Can be skipped entirely; AI step explains tiers and RAM |
| FR-APP-04 | P0 | Settings: theme (light/dark/system), font size, language, reduced motion, AI tier, low-spec mode, data export/import/reset | Changes persist; reset requires confirmation |
| FR-APP-05 | P1 | Global search (lessons, components, tools, glossary) | Fuzzy match, results < 100 ms on full content set |
| FR-APP-06 | P1 | Content pack updater (download newer lesson packs) | Opt-in; checksum-verified; works offline otherwise |
| FR-APP-07 | P1 | In-app "Report an issue / Suggest a fix" that opens a prefilled GitHub issue in the browser | Never auto-sends; shows what will be included |

### 6.2 Learning engine (FR-LRN)
| ID | Pri | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-LRN-01 | P0 | Render lessons from MDX with front-matter (see `docs/CONTENT-GUIDE.md`) | Invalid front-matter fails the content build with a clear error |
| FR-LRN-02 | P0 | Custom MDX components: `<Callout>` (info/tip/warning/safety), `<Circuit>`, `<ArduinoSketch>`, `<Quiz>`, `<Exercise>`, `<TryIt>`, `<Formula>`, `<Reveal>`, `<Term>` | Each documented with an example and unit-tested |
| FR-LRN-03 | P0 | Path → Module → Lesson hierarchy with prerequisites and estimated time | Locked/unlocked state is advisory (user may skip) |
| FR-LRN-04 | P0 | Progress tracking: viewed, completed, exercise status, last position | Persists locally; survives app update |
| FR-LRN-05 | P0 | Lesson footer: "Mark complete", "I'm confused" (opens coach with lesson context), "Report error" | Works offline except report |
| FR-LRN-06 | P1 | Notes and bookmarks per lesson | Stored locally; exportable |
| FR-LRN-07 | P1 | Spaced-repetition review cards generated from lesson `keyIdeas` | Daily review queue; user can disable |
| FR-LRN-08 | P1 | Offline-complete: all content bundled; no external fonts/CDNs | Verified by network-blocked test |
| FR-LRN-09 | P1 | Local completion certificate PDF (no online verification) | Generated on path completion; includes name entered locally |

### 6.3 Practice & assessment (FR-PRC)
| ID | Pri | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-PRC-01 | P0 | Quiz engine: single/multi choice, numeric with tolerance, ordering | Explanations shown after answer; attempts logged locally |
| FR-PRC-02 | P0 | Exercise engine with auto-graders: `numeric`, `circuit-state`, `arduino-output`, `code-tests` | Grader is a pure function with fixtures; deterministic |
| FR-PRC-03 | P0 | Staged hints per exercise (3 levels, authored) before AI hints | Using a hint is recorded but never penalised |
| FR-PRC-04 | P1 | Daily challenge (picked locally from completed topics) | No network |
| FR-PRC-05 | P1 | Break-time mini-games (resistor color code, pin matching, logic gates) | ≤ 3 min each; no scores shared |
| FR-PRC-06 | P1 | Skill radar per track and weak-topic suggestions | Computed from local attempts |
| FR-PRC-07 | P2 | Mock interview mode for hardware roles | Phase 4+ |

### 6.4 Circuit simulator (FR-SIM) — see `docs/ARCHITECTURE.md §6`
| ID | Pri | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-SIM-01 | P0 | Canvas with grid, pan/zoom, drag-drop parts, wiring, rotate, delete, undo/redo | 60 fps with ≤ 100 parts |
| FR-SIM-02 | P0 | Parts: battery/DC source, resistor, LED, switch/button, capacitor, diode, NPN/PNP/MOSFET, potentiometer, LDR, thermistor, buzzer, DC motor (simplified model), ground | Each part has symbol, footprint on breadboard, parameters, and a documented model |
| FR-SIM-03 | P0 | Two views: breadboard and schematic, kept in sync from one netlist | Edits in either view reflect in the other |
| FR-SIM-04 | P0 | DC operating point and transient analysis via ngspice (WASM or native) | Results match reference SPICE fixtures within 1% |
| FR-SIM-05 | P0 | Virtual multimeter (V, I, R) and simple oscilloscope | Probes attach to nets; values update live |
| FR-SIM-06 | P0 | Visual feedback: LED brightness, burn-out on overcurrent (with explanation), wire current animation (toggle) | Burn-out shows a teaching message, never just fails silently |
| FR-SIM-07 | P0 | Save/load circuits as JSON (versioned schema), embed read-only in lessons | Schema migration tested |
| FR-SIM-08 | P1 | Netlist export (SPICE) and "explain this circuit" (coach reads netlist) | Export validated by ngspice |
| FR-SIM-09 | P1 | Component value presets (E12 resistors) and color-band display | |
| FR-SIM-10 | P2 | Logic-gate and 555 timer models | |

### 6.5 Arduino simulator (FR-ARD)
| ID | Pri | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-ARD-01 | P0 | Code editor (Monaco or CodeMirror) with C++/Arduino syntax, errors inline | Works offline |
| FR-ARD-02 | P0 | Compile Arduino sketches to AVR hex **locally** | Compiler strategy decided in ADR-004 (arduino-cli bundled vs WASM); compile < 10 s for blink |
| FR-ARD-03 | P0 | Execute with an AVR emulator (avr8js) with virtual LEDs, buttons, pots, servo, HC-SR04, 16x2 LCD, buzzer, serial monitor | Timing within documented tolerance |
| FR-ARD-04 | P0 | Pin wiring on a board canvas shared with the circuit view | Wiring errors produce friendly diagnostics ("pin 13 is not connected to anything") |
| FR-ARD-05 | P1 | Starter sketches, library of snippets, "explain this line" via coach | |
| FR-ARD-06 | P1 | Robot sim scene (2D): differential-drive car, line track, obstacle arena, driven by the Arduino sim | Phase 2–3 |
| FR-ARD-07 | P2 | ESP32 / RP2040 (MicroPython) support | Phase 4+ |

### 6.6 AI coach (FR-AI) — full spec in `docs/AI-COACH-SPEC.md`
| ID | Pri | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-AI-01 | P0 | Local inference via Ollama (detect, guide install, pull model) | No data leaves device; works fully offline after model is pulled |
| FR-AI-02 | P0 | Model tiers by RAM: Small / Balanced / Best; shown before download | Recommended tier auto-selected |
| FR-AI-03 | P0 | Socratic behaviour: staged hints, never final answer before attempts (see spec) | Passes the coach eval suite (`tests/coach-evals`) |
| FR-AI-04 | P0 | Context awareness: current lesson, circuit netlist, code, error output | Context is explicit and viewable by the user ("what the coach sees") |
| FR-AI-05 | P0 | AI-off mode with authored hints only | Entire app usable without AI |
| FR-AI-06 | P1 | RAG over local lesson/library index | Answers cite lesson IDs |
| FR-AI-07 | P1 | Modes: Explain, Debug my circuit, Review my code, Quiz me | |
| FR-AI-08 | P1 | Safety guardrail: hardware-risk topics trigger authored safety text, not free generation | |
| FR-AI-09 | P1 | Positive reinforcement: remembers tiny wins locally and celebrates them | No manipulation or guilt-tripping |

### 6.7 Projects & kits (FR-PRJ)
| ID | Pri | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-PRJ-01 | P0 | Project page: goal, difficulty, time, cost, skills, BOM, wiring, steps, test checklist, troubleshooting | Schema-validated |
| FR-PRJ-02 | P0 | "Simulate first" tab loads the project's simulated twin | |
| FR-PRJ-03 | P0 | Kit page: Starter / Builder / Advanced kits with full BOM and **vendor-neutral alternatives** per part | Affiliate links, if any, are labelled and optional |
| FR-PRJ-04 | P0 | Offline BOM export (CSV/PDF) and printable build checklist | |
| FR-PRJ-05 | P1 | "I built it" log: local photos, notes, date | Stored locally |
| FR-PRJ-06 | P1 | Submit project to community gallery by generating a PR template (opens browser) | No server |

MVP projects: (1) LED blink, (2) traffic light, (3) line follower, (4) obstacle-avoiding car, (5) servo arm.

### 6.8 Tools & library (FR-TLS)
| ID | Pri | Requirement |
|---|---|---|
| FR-TLS-01 | P0 | 12 calculators: Ohm's law/power, resistor color code, series/parallel, voltage divider, LED resistor, RC time constant, battery runtime, PWM duty/frequency, servo pulse width, gear ratio, motor torque/speed basics, unit converter |
| FR-TLS-02 | P0 | Every calculator shows the formula, worked steps and units; pure functions with tests |
| FR-TLS-03 | P0 | Component library, 20 parts: pinout, symbol, key specs, typical circuit, common mistakes, safety notes |
| FR-TLS-04 | P1 | Glossary and formula sheet; protocol cheat sheets (UART, I2C, SPI) |
| FR-TLS-05 | P2 | Datasheet explainer (user supplies PDF; coach highlights key parameters) |

### 6.9 Gamification (FR-GAM)
| ID | Pri | Requirement |
|---|---|---|
| FR-GAM-01 | P0 | Streaks (with freeze days; never punitive), XP for learning actions (not speed), badges for skills |
| FR-GAM-02 | P0 | "Tiny wins" toasts, mascot reactions; can be fully disabled |
| FR-GAM-03 | P0 | No leaderboards, no public comparison |

### 6.10 Community & contribution (FR-COM)
| ID | Pri | Requirement |
|---|---|---|
| FR-COM-01 | P0 | `CONTRIBUTING.md`, lesson template, PR checklist, content CI (lint, schema, link check, safety lint) |
| FR-COM-02 | P0 | GitHub Discussions as the forum; links from the app |
| FR-COM-03 | P1 | Translation packs as separate repos/folders with a coverage report |
| FR-COM-04 | P1 | Educator pack: printable lesson plans, worksheets, answer keys |
| FR-COM-05 | P1 | Donation page (GitHub Sponsors, plus a region-neutral option) with transparent costs |

---

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Boot < 3 s; lesson open < 300 ms; sim 60 fps typical; AI first token < 5 s on Balanced tier with 16 GB RAM |
| Footprint | Installer ≤ 250 MB; idle RAM (AI off) ≤ 400 MB |
| Offline | 100% of core features work with no network after install/model pull |
| Privacy | No telemetry by default. If ever added: opt-in, aggregate, documented, with a visible "what is sent" view |
| Accessibility | WCAG 2.2 AA; full keyboard use; screen-reader labels (circuits provide a text description / netlist view); colour-blind-safe palette; reduced motion |
| i18n | All UI strings in locale files; ICU message format; RTL-ready; no concatenated sentences |
| Security | Tauri allowlist minimal; CSP strict; no remote code; sandboxed compile steps; signed content packs; dependency audit in CI |
| Reliability | Autosave every 10 s in editors; crash-safe SQLite (WAL); schema migrations tested |
| Compatibility | Win 10+, macOS 12+ (Ollama may need 14+; surface this clearly), Ubuntu 22.04+ equivalents; x64 and ARM64 |
| Quality | ≥ 80% unit coverage on `packages/*` logic; E2E smoke test for each release |
| Licensing | Every dependency license recorded in `docs/LICENSING.md`; no GPL code linked into Apache-2.0 binaries without review |

---

## 8. Data model (local SQLite)

```
profile(id, nickname, locale, goal, hardware_owned_json, created_at)
settings(key, value_json)
lesson_progress(lesson_id, status[none|viewed|completed], last_position, updated_at)
exercise_attempts(id, exercise_id, answer_json, passed, hints_used, created_at)
quiz_attempts(id, quiz_id, score, answers_json, created_at)
review_cards(card_id, lesson_id, ease, due_at, reps)
notes(id, lesson_id, body_md, created_at)
bookmarks(id, lesson_id, anchor, created_at)
circuits(id, title, schema_version, json, updated_at)
sketches(id, title, code, board, updated_at)
project_logs(id, project_id, note, photo_path, created_at)
streaks(date, activity_count)
badges(badge_id, earned_at)
coach_sessions(id, context_ref, started_at)          -- optional, user-clearable
coach_messages(id, session_id, role, content, created_at)
```
Rules: all tables are exportable to a single `.roboforge` JSON bundle; migrations are forward-only and tested; coach history can be disabled and wiped in one click.

---

## 9. Content model

Content is **files in the repo** (see `docs/CONTENT-GUIDE.md`):

```
content/
  paths/electronics-embedded-foundations/
    path.yaml
    m01-electricity-basics/
      module.yaml
      l01-what-is-electricity.mdx
      ...
  projects/<slug>/project.mdx + bom.yaml + sim.json
  components/<slug>.mdx
  glossary.yaml
  i18n/<locale>/...
```
Front-matter is validated by Zod schemas in `packages/content-schema`. Content CI must pass before merge.

---

## 10. Distribution & operations
- GitHub Releases is the single official distribution channel (plus project site).
- Unsigned builds at first; documented OS warnings (as index-0.in does); code signing is a funded goal.
- Auto-update is **opt-in** and checksum-verified.
- Versioning: SemVer for app; separate CalVer for content packs.
- Docs site: static (Astro/Docusaurus) built from `docs/` + content, hosted free (GitHub Pages).

---

## 11. Licensing & funding
- Code: **Apache-2.0** (decision pending final sign-off; MIT acceptable).
- Content: **CC BY-SA 4.0**.
- Mascot/brand assets: separate trademark-style policy in `docs/LICENSING.md`.
- Model weights: used under their own licenses (e.g., Gemma terms); never redistributed in the installer.
- Funding: GitHub Sponsors, donations, disclosed kit affiliate links, grants. Costs are published.

---

## 12. Risks (top)
| Risk | Mitigation |
|---|---|
| Two-person team, huge scope | Narrow MVP; vertical slices; community content via PRs |
| Local LLM too heavy for school laptops | AI-off mode; small tier; authored hints carry the pedagogy |
| SPICE-in-browser/WASM integration complexity | ADR + spike in Phase 1 before building UI on top; fallback to a custom MNA solver for simple DC/transient |
| Arduino compile toolchain size | Evaluate bundled `arduino-cli`/avr-gcc vs WASM; ADR-004 |
| Hardware safety for minors | Low-voltage only; safety lint in CI; human verification of every project |
| Hallucinated technical facts from the model | RAG, authored hints first, eval suite, "verify" badge on AI answers |
| Library licenses (GPL/model terms) | License audit in CI; `docs/LICENSING.md` |
| Unsigned installer fear | Clear docs, hashes published, funded signing later |

---

## 13. Definition of Done (feature)
1. Acceptance criteria met and linked to FR IDs.
2. Unit tests; E2E for user-visible flows; no new a11y violations.
3. Works with network disabled.
4. Docs updated (`docs/`, in-app help if user-facing); `docs/PROJECT-STATE.md` updated.
5. No new dependency without license check + entry in `docs/LICENSING.md`.
6. Reviewed per `.agents/workflows/feature.md`; conventional commit; changelog entry.
7. **Hardware-touching content:** marked `needs-human-verification` until the maintainer confirms on real hardware.

---

## 14. Open decisions (agents must not decide these silently — open an ADR and ask the maintainer)
1. Final product name and mascot.
2. Apache-2.0 vs MIT.
3. Tauri vs Electron if Ollama/ngspice integration hits blockers (default: Tauri).
4. SPICE: ngspice WASM vs native sidecar vs custom solver (ADR-003).
5. Arduino compile path (ADR-004).
6. Exact Ollama model tags per tier (verify current availability at build time).
7. Donation methods list.

## 15. Glossary
**Path** — ordered set of modules. **Module** — group of lessons. **Lesson** — one MDX page. **Exercise** — auto-graded task. **Netlist** — list of components and nets describing a circuit. **ADR** — Architecture Decision Record. **Tier** — AI model size class. **Tiny win** — small positive feedback on progress.
