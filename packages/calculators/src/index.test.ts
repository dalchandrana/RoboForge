import { describe, it, expect } from 'vitest';
import { calculateOhmsLaw } from './index';

describe('packages/calculators', () => {
  it('calculates current and power given voltage and resistance', () => {
    const output = calculateOhmsLaw({ voltage: 9, resistance: 3000 });
    expect(output.result.current).toBe(0.003); // 3 mA
    expect(output.result.power).toBe(0.027); // 27 mW
    expect(output.steps).toHaveLength(2);
    expect(output.formula).toContain('I = V / R');
  });

  it('calculates voltage given current and resistance', () => {
    const output = calculateOhmsLaw({ current: 0.02, resistance: 220 });
    expect(output.result.voltage).toBe(4.4);
    expect(output.result.power).toBe(0.088);
  });

  it('calculates resistance given voltage and current', () => {
    const output = calculateOhmsLaw({ voltage: 9, current: 0.003 });
    expect(output.result.resistance).toBe(3000);
    expect(output.result.power).toBe(0.027);
  });

  it('throws on zero current when calculating resistance', () => {
    expect(() => calculateOhmsLaw({ voltage: 9, current: 0 })).toThrow(/cannot be zero/);
  });

  it('throws on insufficient parameters', () => {
    expect(() => calculateOhmsLaw({ voltage: 5 })).toThrow(/at least 2 parameters/);
  });

  it('validates physical constraints like negative resistance', () => {
    expect(() => calculateOhmsLaw({ voltage: 5, resistance: -10 })).toThrow(/strictly positive/);
  });
});
