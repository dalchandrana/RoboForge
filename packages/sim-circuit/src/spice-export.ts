import type { CircuitNetlist } from './types';

/**
 * Exports a canonical RoboForge CircuitNetlist into standard SPICE (.cir) netlist format.
 */
export function exportToSPICE(netlist: CircuitNetlist): string {
  const lines: string[] = [];
  lines.push(`* RoboForge Export: ${netlist.title || 'Circuit'}`);
  lines.push(`* Generated for offline SPICE verification`);
  lines.push('');

  const gndNode = netlist.groundNodeId || '0';

  const formatNode = (node: string) => (node === gndNode ? '0' : node);

  for (const comp of netlist.components) {
    if (comp.type === 'ground') continue;

    const n1 = formatNode(comp.pins[0]?.nodeId || '0');
    const n2 = formatNode(comp.pins[1]?.nodeId || '0');

    switch (comp.type) {
      case 'dc_source':
      case 'battery': {
        const v = comp.properties.voltage_V ?? 9;
        lines.push(`V_${comp.id} ${n1} ${n2} DC ${v}`);
        break;
      }
      case 'resistor': {
        const r = comp.properties.resistance_Ohm ?? 1000;
        lines.push(`R_${comp.id} ${n1} ${n2} ${r}`);
        break;
      }
      case 'led': {
        lines.push(`D_${comp.id} ${n1} ${n2} D_LED_GENERIC`);
        break;
      }
      case 'switch': {
        const isClosed = Boolean(comp.properties.closed);
        const r = isClosed ? '0.001' : '1e9';
        lines.push(`R_SW_${comp.id} ${n1} ${n2} ${r}`);
        break;
      }
    }
  }

  lines.push('');
  lines.push('.model D_LED_GENERIC D (IS=1e-14 RS=15 N=1.8 BV=50)');
  lines.push('.op');
  lines.push('.end');

  return lines.join('\n');
}
