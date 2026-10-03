---
description: Author a hardware project with kit BOM
---
# /new-project <slug>
1. Use `docs/CONTENT-GUIDE.md §Projects`. Create `content/projects/<slug>/project.mdx`, `bom.yaml`, `sim.json`.
2. Build and test the **simulated twin first**; commit `sim.json`.
3. BOM: every part has spec, quantity, approximate cost range (USD), and ≥ 2 vendor-neutral alternatives; mark any affiliate link as `affiliate: true`.
4. Include wiring diagram (SVG), power budget, safety callout, test checklist, troubleshooting tree, extension ideas.
5. Set `needsHumanVerification: true` and list exactly what the maintainer must physically verify (voltages, pin mapping, motor behaviour).
6. Run content check. PR with the verification checklist.
