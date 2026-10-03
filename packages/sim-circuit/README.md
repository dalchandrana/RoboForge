# @roboforge/sim-circuit

Circuit simulator package for RoboForge: Canonical netlist AST, Modified Nodal Analysis (MNA) solver, Electrical Rules Check (ERC-lite), and SPICE export.

## Features

- Pure mathematical DC solver running synchronously or in a Web Worker (< 5ms solve time).
- Piecewise non-linear model for LEDs/diodes with forward voltage drop and overcurrent burnout diagnostics.
- Friendly diagnostic translations for floating nets, missing ground, and short circuits.
- Zero external native binary dependencies.

## Usage

```ts
import { solveCircuit, runERC, type CircuitNetlist } from '@roboforge/sim-circuit';

const result = solveCircuit(netlist);
console.log(result.nodeVoltages);
```
