# ADR-002: Monorepo Layout, Content Pipeline, and Data Bundles

## Context
RoboForge combines interactive educational content (lessons, quizzes, hardware project guides, calculators) with desktop application code and domain logic (circuit simulation, AVR emulation, grading).
We need a structure that:
1. Keeps business logic pure and testable outside DOM/browser environments.
2. Validates educational content strictly via Zod schemas and automated safety linting before merging.
3. Pre-compiles content at build time to prevent runtime MDX `eval`, maintaining a strict Content Security Policy.
4. Provides robust, exportable user data bundles (`.roboforge`).

## Options Considered
1. **pnpm Workspaces + Build-Time Static JSON Compilation (Accepted)**
   - *Pros:* Fast, deterministic dependency resolution. Packages (`config`, `content-schema`, `ui`, `storage`, `graders`, `calculators`, `i18n`) are isolated with strict boundaries. Educational MDX and YAML are pre-compiled into static JSON bundles loaded synchronously offline without runtime eval or remote network requests.
   - *Cons:* Requires a build step (`pnpm content:build`) whenever authoring new lessons.
2. **Runtime Client-Side MDX Parsing**
   - *Pros:* Direct editing without rebuild.
   - *Cons:* Requires `eval` / `Function()` execution in browser, violating strict CSP and increasing bundle size.
3. **Polyrepo (Separate content repo and app repo)**
   - *Pros:* Clear separation between writers and software engineers.
   - *Cons:* High synchronization friction for auto-graders and simulator twin files.

## Decision
- Use **pnpm workspaces** with packages under `packages/*`, apps under `apps/*`, and build tools under `tools/*`.
- Content authored in `content/` with global lesson numbering (`m01-l01-what-is-electricity`).
- Content build tool (`tools/content-build`) generates `content-bundle.json` for synchronous offline access.
- Content linter (`tools/content-lint`) enforces Zod validation, reading levels, and mandatory `<Callout type="safety">` blocks whenever hardware hazards (batteries, motors, heat) are mentioned.
- Backup format (`.roboforge`) is a versioned JSON bundle containing settings and progress records.

## Consequences
- Content authoring workflow is fully validated by CI.
- No `eval` or remote fetches are required by the application.
