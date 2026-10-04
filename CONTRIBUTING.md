# Contributing to RoboForge

Thank you for your interest in contributing to **RoboForge**! RoboForge is a free, open-source, offline-first desktop robotics learning application that combines circuit, microcontroller, and 2D mobile robot physics simulators with an on-device Socratic AI coach.

We welcome contributions in **curriculum lessons, translations, hardware build logs, simulator physics models, calculators, accessibility improvements, and bug fixes**.

---

## 1. Ground Rules & Principles (Must Never Break)

1. **100% Offline-First**: No external network requests at runtime. All simulation, rendering, audio, and AI must function completely offline without internet. Network calls are only permitted to `http://127.0.0.1:11434` (local Ollama instance).
2. **Zero Telemetry / Privacy First**: No analytics, trackers, user accounts, cookies, crash reporters, CDNs, or remote font/script loading.
3. **Electrical Safety**: School-path educational content is strictly low-voltage ($\le 12\,\text{V DC}, \le 2\,\text{A}$). Never provide mains voltage wiring instructions, DIY Li-ion/LiPo charging, or instruct bypassing fuses/current limiting resistors.
4. **Original Work Only**: Do not copy code, text, diagrams, or branding from proprietary learning products.
5. **No Secrets**: Never commit API keys, tokens, or credentials.

---

## 2. Development Setup

### Prerequisites

- **Node.js**: v20 or v24+
- **pnpm**: v9 or v11+
- **Rust**: Stable toolchain (`rustup default stable`)
- **OS Dependencies (Linux only)**:
  ```bash
  sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
  ```

### Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/roboforge/roboforge.git
cd roboforge

# 2. Install workspace dependencies
pnpm install

# 3. Build the offline content bundle
pnpm content:build

# 4. Launch the web dev server (fast UI iteration)
pnpm dev

# 5. Or launch the full native desktop Tauri app
pnpm --filter @roboforge/desktop tauri dev
```

---

## 3. Monorepo Architecture

```
apps/desktop/            Tauri 2 native client & React 19 frontend
packages/
  config/                Constants, feature flags, app metadata
  content-schema/        Zod schemas validating curriculum & kits
  ui/                    Accessible design system components
  sim-circuit/           MNA solver, SPICE netlist export, part models
  sim-avr/               avr8js Uno runner, virtual GPIO & peripherals
  sim-robot/             2D differential drive physics, sonar, IR sensors
  graders/               Pure deterministic quiz & code auto-graders
  calculators/           Pure engineering formulas & E-series resistor math
  coach/                 Socratic prompt builder & safety guard
  storage/               Typed local storage repository & bundle exporter
  i18n/                  Locale strings & translation helpers
content/                 Markdown/MDX lessons, projects, kits, quizzes
tools/                   Content bundler, linter, license auditor
```

---

## 4. Authoring Content

All educational modules live in `content/paths/electronics-embedded-foundations/`.

- Every lesson is an MDX file with strict frontmatter: `id`, `title`, `level`, `minutes`, `objectives`, `authors`, and `sources`.
- Every hands-on hardware project must include `<Callout type="safety">` detailing potential failure modes and precautions.
- To validate all content against the schema:
  ```bash
  pnpm content:check
  ```

---

## 5. Development Workflows & Pull Requests

1. **Branch Naming**:
   - `feat/FR-XXX-short-name`
   - `fix/issue-description`
   - `content/module-lesson-name`
   - `docs/topic-name`

2. **Conventional Commits**:
   - `feat(FR-SIM-02): add virtual oscilloscope`
   - `fix(circuit): prevent division by zero in open branch`
   - `content(m05): add ultrasonic obstacle avoidance lesson`

3. **Pre-PR Verification Checklist**:
   - [ ] `pnpm lint` passes with 0 errors.
   - [ ] `pnpm typecheck` passes cleanly across all packages.
   - [ ] `pnpm test` passes (all unit and golden fixture tests).
   - [ ] `pnpm content:check` passes with 0 warnings.
   - [ ] `pnpm license:check` passes without unauthorized dependencies.
   - [ ] High contrast focus states and keyboard navigation verified.

---

## 6. Licensing

- Code contributions are licensed under **Apache-2.0**.
- Curriculum content, diagrams, and documentation are licensed under **CC BY-SA 4.0**.
