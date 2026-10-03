---
description: Add an auto-graded exercise
---
# /new-exercise <lesson> <type>
1. Pick grader type: `numeric | circuit-state | arduino-output | code-tests`.
2. Define the exercise YAML: prompt, constraints, initial state, expected assertions, 3 staged hints, explanation.
3. Implement or reuse the grader in `packages/graders` as a pure function. Add fixtures: passing, failing, near-miss, malformed.
4. Ensure feedback is specific and kind (what's right, what's off, what to check next) — never just "wrong".
5. Test determinism (same input → same result) and performance (< 200 ms).
6. Run tests and content check. Update state file.
