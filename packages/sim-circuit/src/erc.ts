import type { CircuitNetlist, ERCIssue } from './types';

/**
 * Electrical Rules Check (ERC-lite) for educational circuits.
 * Inspects the circuit graph before running the mathematical solver.
 */
export function runERC(netlist: CircuitNetlist): ERCIssue[] {
  const issues: ERCIssue[] = [];

  // 1. Check for Ground Reference
  const groundParts = netlist.components.filter(c => c.type === 'ground');
  const hasGround = Boolean(netlist.groundNodeId) || groundParts.length > 0;
  if (!hasGround) {
    issues.push({
      type: 'warning',
      code: 'NO_GROUND',
      message: 'No ground reference (0V) found in the circuit.',
      learnerTip:
        'In electronics, voltage is always measured relative to a common reference point. Add a Ground symbol or connect the battery negative terminal to Ground.',
    });
  }

  // 2. Check for Shorted Voltage Sources
  const sources = netlist.components.filter(c => c.type === 'dc_source' || c.type === 'battery');
  for (const src of sources) {
    const p1 = src.pins[0]?.nodeId;
    const p2 = src.pins[1]?.nodeId;
    if (p1 && p2 && p1 === p2) {
      issues.push({
        type: 'error',
        code: 'SHORT_CIRCUIT',
        componentId: src.id,
        message: `Direct short circuit across ${src.label || src.id}!`,
        learnerTip:
          'The positive and negative terminals are connected directly with zero resistance. In real life this causes batteries to rapidly overheat, swell, or catch fire! Always include a load (like a resistor).',
      });
    }
  }

  // 3. Count Connections per Node
  const nodeCounts: Record<string, number> = {};
  for (const comp of netlist.components) {
    for (const pin of comp.pins) {
      if (pin.nodeId) {
        nodeCounts[pin.nodeId] = (nodeCounts[pin.nodeId] || 0) + 1;
      } else {
        issues.push({
          type: 'warning',
          code: 'FLOATING_PIN',
          componentId: comp.id,
          message: `Pin ${pin.name} on ${comp.label || comp.id} is not connected.`,
          learnerTip: 'Connect a wire from this pin to complete the circuit path.',
        });
      }
    }
  }

  // 4. Check for Open Circuits / Dead Ends
  for (const comp of netlist.components) {
    if (comp.type === 'ground') continue;
    const danglingPins = comp.pins.filter(p => p.nodeId && (nodeCounts[p.nodeId] || 0) < 2);
    if (danglingPins.length > 0) {
      issues.push({
        type: 'warning',
        code: 'OPEN_CIRCUIT',
        componentId: comp.id,
        message: `${comp.label || comp.id} has an open connection on net "${danglingPins[0]?.nodeId}".`,
        learnerTip:
          'Electricity only flows in a closed loop. Ensure both ends of every component connect to a complete path.',
      });
    }
  }

  return issues;
}
