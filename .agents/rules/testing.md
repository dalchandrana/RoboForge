---
trigger: always_on
description: Testing and quality rules
---
# Testing rules
- Write tests with the code. Bug fix = failing test first.
- Pure packages (`graders`, `calculators`, `sim-circuit`, `storage`, `content-schema`): ≥ 80% coverage, table-driven tests, golden fixtures for SPICE results.
- UI: component tests (Vitest + Testing Library); E2E (Playwright) for: first run, open lesson, complete quiz, run a circuit, run Arduino blink, AI-off flow, export/import progress.
- Offline test: E2E suite must pass with network blocked.
- A11y: automated axe checks in E2E; manual keyboard pass before release.
- Coach: `tests/coach-evals` must pass (no-answer-leak, safety routing, staying on topic). Never weaken an eval to pass; fix the prompt/guard.
- Performance budgets in `docs/ARCHITECTURE.md §10` are enforced by a CI benchmark where feasible.
- Flaky tests are bugs; fix or quarantine with an issue within the same PR.
