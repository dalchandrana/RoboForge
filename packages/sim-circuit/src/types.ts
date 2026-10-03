import { z } from 'zod';

export type ComponentType = 'dc_source' | 'battery' | 'resistor' | 'led' | 'switch' | 'ground';

export interface Pin {
  id: string;
  name: string;
  nodeId: string;
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  label?: string;
  pins: Pin[];
  properties: {
    voltage_V?: number;
    resistance_Ohm?: number;
    forwardVoltage_V?: number;
    maxCurrent_mA?: number;
    closed?: boolean;
    color?: 'red' | 'green' | 'yellow' | 'blue';
  };
  position: { x: number; y: number };
  rotation: number;
}

export interface CircuitNetlist {
  id: string;
  title?: string;
  version: 1;
  components: CircuitComponent[];
  groundNodeId?: string;
}

export interface ERCIssue {
  type: 'error' | 'warning';
  code: 'NO_GROUND' | 'SHORT_CIRCUIT' | 'FLOATING_PIN' | 'BURNOUT_RISK' | 'OPEN_CIRCUIT';
  componentId?: string;
  message: string;
  learnerTip: string;
}

export interface ComponentSimulationState {
  status: 'ok' | 'burned_out' | 'unpowered';
  voltage_V: number;
  current_mA: number;
  power_mW: number;
  brightness?: number; // 0.0 to 1.0 for LEDs
  message?: string;
}

export interface SimulationResult {
  success: boolean;
  nodeVoltages: Record<string, number>;
  componentStates: Record<string, ComponentSimulationState>;
  ercIssues: ERCIssue[];
}

export const CircuitNetlistSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  version: z.literal(1),
  components: z.array(
    z.object({
      id: z.string().min(1),
      type: z.enum(['dc_source', 'battery', 'resistor', 'led', 'switch', 'ground']),
      label: z.string().optional(),
      pins: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          nodeId: z.string(),
        }),
      ),
      properties: z.record(z.unknown()),
      position: z.object({ x: z.number(), y: z.number() }),
      rotation: z.number().default(0),
    }),
  ),
  groundNodeId: z.string().optional(),
});
