import { describe, it, expect } from 'vitest';
import {
  solveCircuit,
  runERC,
  exportToSPICE,
  getResistorColorBands,
  type CircuitNetlist,
} from './index';

describe('packages/sim-circuit', () => {
  describe('Fixture 1: Voltage Divider', () => {
    it('accurately computes midpoint voltage and branch currents', () => {
      // 9V Battery -> R1 (1k) -> R2 (1k) -> GND
      const netlist: CircuitNetlist = {
        id: 'c-vdivider',
        title: 'Voltage Divider',
        version: 1,
        groundNodeId: '0',
        components: [
          {
            id: 'V1',
            type: 'battery',
            label: '9V Battery',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: { voltage_V: 9 },
            pins: [
              { id: 'p1', name: '+', nodeId: 'VCC' },
              { id: 'p2', name: '-', nodeId: '0' },
            ],
          },
          {
            id: 'R1',
            type: 'resistor',
            label: '1k Resistor',
            position: { x: 50, y: 0 },
            rotation: 0,
            properties: { resistance_Ohm: 1000 },
            pins: [
              { id: 'p1', name: '1', nodeId: 'VCC' },
              { id: 'p2', name: '2', nodeId: 'MID' },
            ],
          },
          {
            id: 'R2',
            type: 'resistor',
            label: '1k Resistor',
            position: { x: 100, y: 0 },
            rotation: 0,
            properties: { resistance_Ohm: 1000 },
            pins: [
              { id: 'p1', name: '1', nodeId: 'MID' },
              { id: 'p2', name: '2', nodeId: '0' },
            ],
          },
        ],
      };

      const result = solveCircuit(netlist);
      expect(result.success).toBe(true);
      expect(result.nodeVoltages['VCC']).toBeCloseTo(9.0, 2);
      expect(result.nodeVoltages['MID']).toBeCloseTo(4.5, 2);
      expect(result.nodeVoltages['0']).toBe(0);

      // Current through each resistor: I = V / R = 4.5 / 1000 = 4.5 mA
      expect(result.componentStates['R1']?.current_mA).toBeCloseTo(4.5, 1);
      expect(result.componentStates['R2']?.current_mA).toBeCloseTo(4.5, 1);
    });
  });

  describe('Fixture 2: Series LED Circuit (Safe Operation)', () => {
    it('solves LED operating point with forward drop and current limit', () => {
      // 9V Battery -> R1 (350 Ohm) -> LED1 (Vf=2.0V) -> GND
      // Expected current: (9 - 2.0) / (350 + 15) ~= 7 / 365 ~= 19.1 mA
      const netlist: CircuitNetlist = {
        id: 'c-led-safe',
        title: 'Safe LED Circuit',
        version: 1,
        groundNodeId: '0',
        components: [
          {
            id: 'V1',
            type: 'battery',
            label: '9V Battery',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: { voltage_V: 9 },
            pins: [
              { id: 'p1', name: '+', nodeId: 'VCC' },
              { id: 'p2', name: '-', nodeId: '0' },
            ],
          },
          {
            id: 'R1',
            type: 'resistor',
            label: '350Ω Resistor',
            position: { x: 50, y: 0 },
            rotation: 0,
            properties: { resistance_Ohm: 350 },
            pins: [
              { id: 'p1', name: '1', nodeId: 'VCC' },
              { id: 'p2', name: '2', nodeId: 'N_LED' },
            ],
          },
          {
            id: 'LED1',
            type: 'led',
            label: 'Red LED',
            position: { x: 100, y: 0 },
            rotation: 0,
            properties: { forwardVoltage_V: 2.0, maxCurrent_mA: 25 },
            pins: [
              { id: 'p1', name: 'Anode', nodeId: 'N_LED' },
              { id: 'p2', name: 'Cathode', nodeId: '0' },
            ],
          },
        ],
      };

      const result = solveCircuit(netlist);
      expect(result.success).toBe(true);

      const ledState = result.componentStates['LED1'];
      expect(ledState?.status).toBe('ok');
      expect(ledState?.current_mA).toBeGreaterThan(15);
      expect(ledState?.current_mA).toBeLessThan(25);
      expect(ledState?.brightness).toBeGreaterThan(0.7);
    });
  });

  describe('Fixture 3: Overcurrent Burnout Condition', () => {
    it('detects overcurrent and flags burnout with an educational message', () => {
      // 5V Battery directly across LED (no resistor)
      const netlist: CircuitNetlist = {
        id: 'c-led-burnout',
        title: 'Burnout Test',
        version: 1,
        groundNodeId: '0',
        components: [
          {
            id: 'V1',
            type: 'battery',
            label: '5V Battery',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: { voltage_V: 5 },
            pins: [
              { id: 'p1', name: '+', nodeId: '5V' },
              { id: 'p2', name: '-', nodeId: '0' },
            ],
          },
          {
            id: 'LED1',
            type: 'led',
            label: 'Red LED',
            position: { x: 50, y: 0 },
            rotation: 0,
            properties: { forwardVoltage_V: 2.0, maxCurrent_mA: 25 },
            pins: [
              { id: 'p1', name: 'Anode', nodeId: '5V' },
              { id: 'p2', name: 'Cathode', nodeId: '0' },
            ],
          },
        ],
      };

      const result = solveCircuit(netlist);
      expect(result.success).toBe(true);

      const ledState = result.componentStates['LED1'];
      expect(ledState?.status).toBe('burned_out');
      expect(ledState?.brightness).toBe(0);
      expect(ledState?.message).toContain('Burnout!');
      expect(ledState?.message).toContain('resistor');
    });
  });

  describe('Fixture 4: Switch Interaction', () => {
    it('stops current flow when switch is open and allows it when closed', () => {
      const openCircuit: CircuitNetlist = {
        id: 'c-switch',
        title: 'Switch Test',
        version: 1,
        groundNodeId: '0',
        components: [
          {
            id: 'V1',
            type: 'battery',
            label: '9V Battery',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: { voltage_V: 9 },
            pins: [
              { id: 'p1', name: '+', nodeId: 'VCC' },
              { id: 'p2', name: '-', nodeId: '0' },
            ],
          },
          {
            id: 'SW1',
            type: 'switch',
            label: 'Push Switch',
            position: { x: 50, y: 0 },
            rotation: 0,
            properties: { closed: false },
            pins: [
              { id: 'p1', name: '1', nodeId: 'VCC' },
              { id: 'p2', name: '2', nodeId: 'OUT' },
            ],
          },
          {
            id: 'R1',
            type: 'resistor',
            label: '1k Resistor',
            position: { x: 100, y: 0 },
            rotation: 0,
            properties: { resistance_Ohm: 1000 },
            pins: [
              { id: 'p1', name: '1', nodeId: 'OUT' },
              { id: 'p2', name: '2', nodeId: '0' },
            ],
          },
        ],
      };

      const openResult = solveCircuit(openCircuit);
      expect(openResult.nodeVoltages['OUT']).toBeCloseTo(0, 2);

      // Now close switch
      openCircuit.components[1]!.properties.closed = true;
      const closedResult = solveCircuit(openCircuit);
      expect(closedResult.nodeVoltages['OUT']).toBeCloseTo(9.0, 2);
      expect(closedResult.componentStates['R1']?.current_mA).toBeCloseTo(9.0, 1);
    });
  });

  describe('Fixture 5: ERC Rules Check', () => {
    it('detects shorted voltage source', () => {
      const shortedNetlist: CircuitNetlist = {
        id: 'c-short',
        title: 'Short Circuit',
        version: 1,
        components: [
          {
            id: 'V1',
            type: 'battery',
            label: '9V Battery',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: { voltage_V: 9 },
            pins: [
              { id: 'p1', name: '+', nodeId: 'VCC' },
              { id: 'p2', name: '-', nodeId: 'VCC' }, // Short!
            ],
          },
        ],
      };

      const issues = runERC(shortedNetlist);
      expect(issues.some(i => i.code === 'SHORT_CIRCUIT')).toBe(true);

      const simResult = solveCircuit(shortedNetlist);
      expect(simResult.success).toBe(false);
    });

    it('warns about missing ground reference', () => {
      const noGndNetlist: CircuitNetlist = {
        id: 'c-nognd',
        title: 'No Ground',
        version: 1,
        components: [
          {
            id: 'V1',
            type: 'battery',
            label: '9V Battery',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: { voltage_V: 9 },
            pins: [
              { id: 'p1', name: '+', nodeId: 'A' },
              { id: 'p2', name: '-', nodeId: 'B' },
            ],
          },
        ],
      };

      const issues = runERC(noGndNetlist);
      expect(issues.some(i => i.code === 'NO_GROUND')).toBe(true);
    });
  });

  describe('SPICE Export', () => {
    it('generates standard SPICE netlist text', () => {
      const netlist: CircuitNetlist = {
        id: 'c-spice',
        title: 'SPICE Export Demo',
        version: 1,
        groundNodeId: '0',
        components: [
          {
            id: '1',
            type: 'dc_source',
            label: 'V1',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: { voltage_V: 12 },
            pins: [
              { id: 'p1', name: '+', nodeId: 'NET1' },
              { id: 'p2', name: '-', nodeId: '0' },
            ],
          },
          {
            id: '2',
            type: 'resistor',
            label: 'R1',
            position: { x: 50, y: 0 },
            rotation: 0,
            properties: { resistance_Ohm: 470 },
            pins: [
              { id: 'p1', name: '1', nodeId: 'NET1' },
              { id: 'p2', name: '2', nodeId: '0' },
            ],
          },
        ],
      };

      const spice = exportToSPICE(netlist);
      expect(spice).toContain('V_1 NET1 0 DC 12');
      expect(spice).toContain('R_2 NET1 0 470');
      expect(spice).toContain('.op');
    });

    it('exports switches and LEDs to SPICE', () => {
      const netlist: CircuitNetlist = {
        id: 'c-all-parts',
        title: 'All Parts',
        version: 1,
        groundNodeId: '0',
        components: [
          {
            id: 'SW1',
            type: 'switch',
            label: 'Switch',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: { closed: true },
            pins: [
              { id: 'p1', name: '1', nodeId: '1' },
              { id: 'p2', name: '2', nodeId: '2' },
            ],
          },
          {
            id: 'LED1',
            type: 'led',
            label: 'LED',
            position: { x: 50, y: 0 },
            rotation: 0,
            properties: {},
            pins: [
              { id: 'p1', name: 'A', nodeId: '2' },
              { id: 'p2', name: 'K', nodeId: '0' },
            ],
          },
        ],
      };
      const spice = exportToSPICE(netlist);
      expect(spice).toContain('R_SW_SW1 1 2 0.001');
      expect(spice).toContain('D_LED1 2 0 D_LED_GENERIC');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty circuits gracefully', () => {
      const emptyNetlist: CircuitNetlist = {
        id: 'c-empty',
        title: 'Empty',
        version: 1,
        components: [],
      };
      const result = solveCircuit(emptyNetlist);
      expect(result.success).toBe(true);
    });

    it('handles reverse-biased LEDs', () => {
      // 9V connected in reverse: Anode to 0, Cathode to 9V
      const netlist: CircuitNetlist = {
        id: 'c-led-rev',
        title: 'Reverse LED',
        version: 1,
        groundNodeId: '0',
        components: [
          {
            id: 'V1',
            type: 'battery',
            label: '9V',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: { voltage_V: 9 },
            pins: [
              { id: 'p1', name: '+', nodeId: 'VCC' },
              { id: 'p2', name: '-', nodeId: '0' },
            ],
          },
          {
            id: 'LED1',
            type: 'led',
            label: 'Reverse LED',
            position: { x: 50, y: 0 },
            rotation: 0,
            properties: { forwardVoltage_V: 2.0 },
            pins: [
              { id: 'p1', name: 'Anode', nodeId: '0' },
              { id: 'p2', name: 'Cathode', nodeId: 'VCC' },
            ],
          },
        ],
      };
      const result = solveCircuit(netlist);
      expect(result.success).toBe(true);
      expect(result.componentStates['LED1']?.status).toBe('unpowered');
      expect(result.componentStates['LED1']?.current_mA).toBeCloseTo(0, 1);
    });

    it('detects floating unconnected pins in ERC', () => {
      const floatingNetlist: CircuitNetlist = {
        id: 'c-float',
        title: 'Floating Pin',
        version: 1,
        components: [
          {
            id: 'R1',
            type: 'resistor',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: {},
            pins: [
              { id: 'p1', name: '1', nodeId: 'A' },
              { id: 'p2', name: '2', nodeId: '' }, // Empty pin!
            ],
          },
        ],
      };
      const issues = runERC(floatingNetlist);
      expect(issues.some(i => i.code === 'FLOATING_PIN')).toBe(true);
      expect(issues.some(i => i.code === 'OPEN_CIRCUIT')).toBe(true);
    });

    it('infers ground from explicit ground component', () => {
      const netlistWithGndComp: CircuitNetlist = {
        id: 'c-gnd-comp',
        version: 1,
        components: [
          {
            id: 'G1',
            type: 'ground',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: {},
            pins: [{ id: 'p1', name: 'GND', nodeId: 'NET_GND' }],
          },
          {
            id: 'V1',
            type: 'battery',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: { voltage_V: 5 },
            pins: [
              { id: 'p1', name: '+', nodeId: 'VCC' },
              { id: 'p2', name: '-', nodeId: 'NET_GND' },
            ],
          },
        ],
      };
      const res = solveCircuit(netlistWithGndComp);
      expect(res.success).toBe(true);
      expect(res.nodeVoltages['NET_GND']).toBe(0);
      expect(res.nodeVoltages['VCC']).toBe(5);
    });

    it('infers ground from negative terminal of source if no ground component or groundNodeId', () => {
      const netlistNoGnd: CircuitNetlist = {
        id: 'c-auto-gnd',
        version: 1,
        components: [
          {
            id: 'V1',
            type: 'dc_source',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: { voltage_V: 3.3 },
            pins: [
              { id: 'p1', name: '+', nodeId: 'HIGH' },
              { id: 'p2', name: '-', nodeId: 'LOW' },
            ],
          },
        ],
      };
      const res = solveCircuit(netlistNoGnd);
      expect(res.success).toBe(true);
      expect(res.nodeVoltages['LOW']).toBe(0);
      expect(res.nodeVoltages['HIGH']).toBe(3.3);
    });

    it('handles SPICE export with default title and open switches', () => {
      const netlist: CircuitNetlist = {
        id: 'c-spice-open',
        version: 1,
        components: [
          {
            id: 'SW1',
            type: 'switch',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: { closed: false },
            pins: [
              { id: 'p1', name: '1', nodeId: 'N1' },
              { id: 'p2', name: '2', nodeId: 'N2' },
            ],
          },
          {
            id: 'G1',
            type: 'ground',
            position: { x: 0, y: 0 },
            rotation: 0,
            properties: {},
            pins: [{ id: 'p1', name: 'GND', nodeId: '0' }],
          },
        ],
      };
      const spice = exportToSPICE(netlist);
      expect(spice).toContain('R_SW_SW1 N1 N2 1e9');
      expect(spice).not.toContain('G1');
    });
  });

  describe('Resistor Color Code Helper', () => {
    it('computes 4-band EIA color codes for standard resistors', () => {
      const bands1k = getResistorColorBands(1000);
      expect(bands1k.digit1.name).toBe('Brown'); // 1
      expect(bands1k.digit2.name).toBe('Black'); // 0
      expect(bands1k.multiplier.name).toBe('Red'); // 10^2
      expect(bands1k.tolerance.name).toBe('Gold'); // 5%

      const bands330 = getResistorColorBands(330);
      expect(bands330.digit1.name).toBe('Orange'); // 3
      expect(bands330.digit2.name).toBe('Orange'); // 3
      expect(bands330.multiplier.name).toBe('Brown'); // 10^1

      const bands10k = getResistorColorBands(10000);
      expect(bands10k.digit1.name).toBe('Brown'); // 1
      expect(bands10k.digit2.name).toBe('Black'); // 0
      expect(bands10k.multiplier.name).toBe('Orange'); // 10^3
    });
  });
});
