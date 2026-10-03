# Setting up Antigravity IDE for this project

> Antigravity's folder conventions have shifted between versions. This repo uses `.agents/` (newer) — if your version reads `.agent/` instead, rename the folder. Open **Settings → Rules / Workflows** to confirm what your version loads.

## 1. Folder layout
```
roboforge/
├─ AGENTS.md          ← single source of truth (all rules)
├─ GEMINI.md          ← tiny pointer for Antigravity
├─ PRD.md
├─ .agents/
│  ├─ rules/          ← always-on / glob rules
│  └─ workflows/      ← slash commands (/kickoff, /feature, ...)
├─ .antigravityignore
└─ docs/
```

## 2. First run
1. Create the repo folder, copy these files in, `git init`, commit.
2. In Antigravity: **File → Open Folder** → select the repo root (not a parent).
3. Check **Rules** and **Workflows** panels list the files.
4. Start in **Manager view** or the Editor's agent chat and send:

```
Read AGENTS.md, PRD.md and docs/PROJECT-STATE.md. Then run /kickoff.
Stop and ask me about anything blocking in PRD §14 before scaffolding.
```

## 3. Daily loop
1. `/feature FR-LRN-01` (or any FR ID) → agent plans → you approve the plan.
2. Agent implements, runs tests, shows screenshots/recordings as artifacts.
3. You review, test on your machine, merge.
4. Agent updates `docs/PROJECT-STATE.md`.

## 4. Tips
- Keep tasks small (one FR or one lesson per agent). Run parallel agents only on non-overlapping packages (e.g., content vs. simulator).
- Keep `GEMINI.md` tiny; it loads on every prompt. Put detail in `AGENTS.md`/rules.
- Use the browser agent only for verifying UI in dev mode; never give it credentials.
- Review terminal commands before approving, especially installs, deletes, and `git push`.
- Rotate model choice by task: a stronger model for architecture/ADRs and simulator logic; a faster model for content scaffolding and tests.
- If an agent drifts, restate: "Re-read AGENTS.md §2 and the PRD acceptance criteria."
- Hardware claims are *yours* to verify. Mark them in `docs/PROJECT-STATE.md → Needs human verification`.

## 5. Prompt starters
- **Spike:** "Run /adr for SPICE strategy. Build a 1-day spike comparing ngspice-WASM vs a custom MNA solver on 5 fixtures. Report size, speed, accuracy."
- **Lesson:** "/new-lesson m01 'Ohm's law' using the curriculum entry. Include a circuit TryIt and 4 quiz items."
- **Review:** "/review-content content/paths/…/l03-ohms-law.mdx"
- **Release:** "/release 1.0.0-rc.1"
