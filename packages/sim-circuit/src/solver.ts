import type { CircuitNetlist, SimulationResult, ComponentSimulationState } from './types';
import { runERC } from './erc';

interface NodeMap {
  nodeToIndex: Map<string, number>;
  indexToNode: string[];
  groundNode: string;
}

/**
 * Solves dense linear system A * x = b via Gaussian Elimination with partial pivoting.
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  // Clone to avoid mutating inputs
  const M = A.map(row => [...row]);
  const x = [...b];

  for (let i = 0; i < n; i++) {
    // Pivot selection
    let maxRow = i;
    let maxVal = Math.abs(M[i]?.[i] ?? 0);
    for (let k = i + 1; k < n; k++) {
      const val = Math.abs(M[k]?.[i] ?? 0);
      if (val > maxVal) {
        maxVal = val;
        maxRow = k;
      }
    }

    if (maxVal < 1e-12) {
      // Singular matrix -> floating or disconnected net
      continue;
    }

    // Swap rows
    if (maxRow !== i) {
      const tempRow = M[i];
      M[i] = M[maxRow]!;
      M[maxRow] = tempRow!;

      const tempB = x[i]!;
      x[i] = x[maxRow]!;
      x[maxRow] = tempB;
    }

    // Eliminate below
    const pivot = M[i]![i]!;
    for (let k = i + 1; k < n; k++) {
      const factor = M[k]![i]! / pivot;
      x[k]! -= factor * x[i]!;
      for (let j = i; j < n; j++) {
        M[k]![j]! -= factor * M[i]![j]!;
      }
    }
  }

  // Back substitution
  const result = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = x[i]!;
    for (let j = i + 1; j < n; j++) {
      sum -= M[i]![j]! * result[j]!;
    }
    const pivot = M[i]![i]!;
    result[i] = Math.abs(pivot) > 1e-12 ? sum / pivot : 0;
  }

  return result;
}

/**
 * Maps circuit nets to zero-indexed node variables, establishing ground reference.
 */
function mapNodes(netlist: CircuitNetlist): NodeMap {
  const allNodes = new Set<string>();

  for (const comp of netlist.components) {
    for (const pin of comp.pins) {
      if (pin.nodeId) allNodes.add(pin.nodeId);
    }
  }

  // Determine ground node
  let groundNode = netlist.groundNodeId;
  if (!groundNode) {
    const gndComp = netlist.components.find(c => c.type === 'ground');
    if (gndComp && gndComp.pins[0]?.nodeId) {
      groundNode = gndComp.pins[0].nodeId;
    }
  }
  if (!groundNode) {
    // Default to the negative terminal of the first voltage source if available
    const src = netlist.components.find(c => c.type === 'dc_source' || c.type === 'battery');
    if (src && src.pins[1]?.nodeId) {
      groundNode = src.pins[1].nodeId;
    } else {
      groundNode = allNodes.values().next().value || 'GND';
    }
  }

  const nodeToIndex = new Map<string, number>();
  const indexToNode: string[] = [];

  let idx = 0;
  for (const node of allNodes) {
    if (node !== groundNode) {
      nodeToIndex.set(node, idx++);
      indexToNode.push(node);
    }
  }

  return { nodeToIndex, indexToNode, groundNode };
}

/**
 * Modified Nodal Analysis (MNA) solver for DC circuits.
 */
export function solveCircuit(netlist: CircuitNetlist): SimulationResult {
  const ercIssues = runERC(netlist);

  // If severe short circuit detected, prevent solver blowup and report failure
  if (ercIssues.some(i => i.code === 'SHORT_CIRCUIT')) {
    return {
      success: false,
      nodeVoltages: {},
      componentStates: {},
      ercIssues,
    };
  }

  const { nodeToIndex, indexToNode, groundNode } = mapNodes(netlist);
  const numNodes = indexToNode.length;

  // Identify voltage sources and closed switches (which act as 0V voltage sources)
  interface VSourceEntry {
    comp: (typeof netlist.components)[0];
    posNode: string;
    negNode: string;
    voltage: number;
  }
  const vSources: VSourceEntry[] = [];

  for (const comp of netlist.components) {
    if (comp.type === 'dc_source' || comp.type === 'battery') {
      const v = Number(comp.properties.voltage_V ?? 9);
      vSources.push({
        comp,
        posNode: comp.pins[0]?.nodeId || '',
        negNode: comp.pins[1]?.nodeId || '',
        voltage: v,
      });
    } else if (comp.type === 'switch') {
      const isClosed = Boolean(comp.properties.closed);
      if (isClosed) {
        // Closed switch behaves as 0V ideal branch
        vSources.push({
          comp,
          posNode: comp.pins[0]?.nodeId || '',
          negNode: comp.pins[1]?.nodeId || '',
          voltage: 0,
        });
      }
    }
  }

  const numVSources = vSources.length;
  const matrixSize = numNodes + numVSources;

  if (matrixSize === 0) {
    return {
      success: true,
      nodeVoltages: { [groundNode]: 0 },
      componentStates: {},
      ercIssues,
    };
  }

  // Non-linear diode/LED iteration loop (Newton-Raphson companion model)
  const maxIterations = 20;
  let iteration = 0;
  let converged = false;

  // Internal diode state estimates: forward drop Vf
  const diodeStates = new Map<string, { conducting: boolean; vf: number }>();
  for (const comp of netlist.components) {
    if (comp.type === 'led') {
      diodeStates.set(comp.id, {
        conducting: true,
        vf: Number(comp.properties.forwardVoltage_V ?? 2.0),
      });
    }
  }

  let finalSolution = new Array<number>(matrixSize).fill(0);

  while (iteration < maxIterations && !converged) {
    iteration++;

    // Build MNA system: G matrix and Z vector
    const A = Array.from({ length: matrixSize }, () => new Array<number>(matrixSize).fill(0));
    const Z = new Array<number>(matrixSize).fill(0);

    const addConductance = (node1: string, node2: string, g: number) => {
      const i1 = node1 === groundNode ? -1 : (nodeToIndex.get(node1) ?? -1);
      const i2 = node2 === groundNode ? -1 : (nodeToIndex.get(node2) ?? -1);

      if (i1 >= 0) A[i1]![i1]! += g;
      if (i2 >= 0) A[i2]![i2]! += g;
      if (i1 >= 0 && i2 >= 0) {
        A[i1]![i2]! -= g;
        A[i2]![i1]! -= g;
      }
    };

    // 1. Stamp Resistors
    for (const comp of netlist.components) {
      if (comp.type === 'resistor') {
        const r = Math.max(1e-4, Number(comp.properties.resistance_Ohm ?? 1000));
        addConductance(comp.pins[0]?.nodeId || '', comp.pins[1]?.nodeId || '', 1 / r);
      } else if (comp.type === 'switch' && !comp.properties.closed) {
        // Open switch has tiny leakage conductance (10^-9 S)
        addConductance(comp.pins[0]?.nodeId || '', comp.pins[1]?.nodeId || '', 1e-9);
      } else if (comp.type === 'led') {
        // Companion model for LED: Anode (pin 0) -> Cathode (pin 1)
        const dState = diodeStates.get(comp.id)!;
        const anode = comp.pins[0]?.nodeId || '';
        const cathode = comp.pins[1]?.nodeId || '';
        const forwardV = Number(comp.properties.forwardVoltage_V ?? 2.0);

        if (dState.conducting) {
          // Forward piecewise linear model: small internal resistance Rd + Norton source
          const rd = 15; // 15 Ohms dynamic forward resistance
          const gd = 1 / rd;
          addConductance(anode, cathode, gd);

          // Norton current injection: I_eq = gd * Vf
          const ieq = gd * forwardV;
          const iAnode = anode === groundNode ? -1 : (nodeToIndex.get(anode) ?? -1);
          const iCathode = cathode === groundNode ? -1 : (nodeToIndex.get(cathode) ?? -1);

          if (iAnode >= 0) Z[iAnode]! += ieq;
          if (iCathode >= 0) Z[iCathode]! -= ieq;
        } else {
          // Reverse biased: high resistance
          addConductance(anode, cathode, 1e-7);
        }
      }
    }

    // 2. Stamp Voltage Sources
    for (let k = 0; k < numVSources; k++) {
      const src = vSources[k]!;
      const vIdx = numNodes + k;

      const iPos = src.posNode === groundNode ? -1 : (nodeToIndex.get(src.posNode) ?? -1);
      const iNeg = src.negNode === groundNode ? -1 : (nodeToIndex.get(src.negNode) ?? -1);

      if (iPos >= 0) {
        A[iPos]![vIdx]! += 1;
        A[vIdx]![iPos]! += 1;
      }
      if (iNeg >= 0) {
        A[iNeg]![vIdx]! -= 1;
        A[vIdx]![iNeg]! -= 1;
      }

      Z[vIdx] = src.voltage;
    }

    // Solve linear system
    finalSolution = solveLinearSystem(A, Z);

    // Check diode state transitions for convergence
    let stateChanged = false;
    for (const comp of netlist.components) {
      if (comp.type === 'led') {
        const anode = comp.pins[0]?.nodeId || '';
        const cathode = comp.pins[1]?.nodeId || '';
        const va = anode === groundNode ? 0 : (finalSolution[nodeToIndex.get(anode) ?? -1] ?? 0);
        const vk =
          cathode === groundNode ? 0 : (finalSolution[nodeToIndex.get(cathode) ?? -1] ?? 0);
        const vDrop = va - vk;

        const forwardV = Number(comp.properties.forwardVoltage_V ?? 2.0);
        const shouldConduct = vDrop >= forwardV * 0.85;

        const currentState = diodeStates.get(comp.id)!;
        if (currentState.conducting !== shouldConduct) {
          currentState.conducting = shouldConduct;
          stateChanged = true;
        }
      }
    }

    if (!stateChanged) {
      converged = true;
    }
  }

  // Extract node voltages
  const nodeVoltages: Record<string, number> = { [groundNode]: 0 };
  for (let i = 0; i < numNodes; i++) {
    const nodeName = indexToNode[i]!;
    nodeVoltages[nodeName] = Number((finalSolution[i] ?? 0).toFixed(4));
  }

  // Calculate component states, branch currents, and powers
  const componentStates: Record<string, ComponentSimulationState> = {};

  for (const comp of netlist.components) {
    if (comp.type === 'ground') continue;

    const n1 = comp.pins[0]?.nodeId || '';
    const n2 = comp.pins[1]?.nodeId || '';
    const v1 = nodeVoltages[n1] ?? 0;
    const v2 = nodeVoltages[n2] ?? 0;
    const vDrop = v1 - v2;

    if (comp.type === 'resistor') {
      const r = Math.max(1e-4, Number(comp.properties.resistance_Ohm ?? 1000));
      const iA = vDrop / r;
      const current_mA = Number((iA * 1000).toFixed(3));
      const power_mW = Number((Math.abs(vDrop) * Math.abs(iA) * 1000).toFixed(3));

      componentStates[comp.id] = {
        status: 'ok',
        voltage_V: Number(Math.abs(vDrop).toFixed(4)),
        current_mA: Math.abs(current_mA),
        power_mW,
      };
    } else if (comp.type === 'led') {
      const forwardV = Number(comp.properties.forwardVoltage_V ?? 2.0);
      const maxCurrent_mA = Number(comp.properties.maxCurrent_mA ?? 25);
      const dState = diodeStates.get(comp.id);

      let current_mA = 0;
      if (dState?.conducting && vDrop > 0) {
        current_mA = Math.max(0, ((vDrop - forwardV) / 15) * 1000);
      }

      const isBurnedOut = current_mA > maxCurrent_mA;
      const isLit = current_mA >= 1.0 && !isBurnedOut;
      const brightness = isBurnedOut ? 0 : Math.min(1.0, current_mA / 20.0);

      componentStates[comp.id] = {
        status: isBurnedOut ? 'burned_out' : isLit ? 'ok' : 'unpowered',
        voltage_V: Number(Math.max(0, vDrop).toFixed(4)),
        current_mA: Number(current_mA.toFixed(2)),
        power_mW: Number(((current_mA / 1000) * vDrop * 1000).toFixed(2)),
        brightness: Number(brightness.toFixed(2)),
        message: isBurnedOut
          ? `Burnout! ${current_mA.toFixed(1)} mA exceeded the safe limit of ${maxCurrent_mA} mA. Add a current-limiting resistor!`
          : undefined,
      };
    } else if (comp.type === 'switch') {
      const isClosed = Boolean(comp.properties.closed);
      componentStates[comp.id] = {
        status: 'ok',
        voltage_V: Number(Math.abs(vDrop).toFixed(4)),
        current_mA: isClosed ? 0 : 0, // Branch current resolved via loop
        power_mW: 0,
      };
    } else if (comp.type === 'dc_source' || comp.type === 'battery') {
      const v = Number(comp.properties.voltage_V ?? 9);
      componentStates[comp.id] = {
        status: 'ok',
        voltage_V: v,
        current_mA: 0,
        power_mW: 0,
      };
    }
  }

  return {
    success: true,
    nodeVoltages,
    componentStates,
    ercIssues,
  };
}
