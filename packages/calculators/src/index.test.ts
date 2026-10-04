import { describe, it, expect } from 'vitest';
import {
  calculateBatteryRuntime,
  calculateGearRatio,
  calculateLedResistor,
  calculateMotorPower,
  calculateOhmsLaw,
  calculatePwm,
  calculateRcTimeConstant,
  calculateResistorColorCode,
  calculateSeriesParallel,
  calculateServoPulse,
  calculateUnitConversion,
  calculateVoltageDivider,
  findNearestE12,
  findNearestE24,
  formatResistance,
  resistanceToColorBands,
} from './index';

describe('@roboforge/calculators - All 12 Engineering Calculators', () => {
  // 1. Ohm's Law
  describe("1. Ohm's Law & Power Dissipation", () => {
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

  // 2. Resistor Color Code
  describe('2. Resistor Color Code', () => {
    it('decodes standard 4-band resistor (1 kΩ ±5%)', () => {
      const res = calculateResistorColorCode({
        bands: ['brown', 'black', 'red', 'gold'],
      });
      expect(res.result.resistance).toBe(1000);
      expect(res.result.tolerancePercent).toBe(5);
      expect(res.result.minResistance).toBe(950);
      expect(res.result.maxResistance).toBe(1050);
      expect(res.result.formattedResistance).toBe('1 kΩ ±5%');
    });

    it('decodes precision 5-band resistor (47.0 kΩ ±1%)', () => {
      const res = calculateResistorColorCode({
        bands: ['yellow', 'violet', 'black', 'red', 'brown'],
      });
      expect(res.result.resistance).toBe(47000);
      expect(res.result.tolerancePercent).toBe(1);
      expect(res.result.formattedResistance).toBe('47 kΩ ±1%');
    });

    it('encodes resistance value to 4-band and 5-band color arrays', () => {
      const encoded = resistanceToColorBands(4700);
      expect(encoded.bands4).toEqual(['yellow', 'violet', 'red', 'gold']);
      expect(encoded.standardE12Value).toBe(4700);
      expect(encoded.standardE24Value).toBe(4700);
    });

    it('throws on invalid band counts or negative values', () => {
      expect(() => calculateResistorColorCode({ bands: ['red', 'red'] })).toThrow(/exactly 4 or 5/);
      expect(() => resistanceToColorBands(-100)).toThrow(/strictly positive/);
    });
  });

  // 3. Series and Parallel Resistors
  describe('3. Series & Parallel Resistors', () => {
    it('calculates equivalent series resistance and power distribution', () => {
      const res = calculateSeriesParallel({
        resistors: [100, 200, 300],
        mode: 'series',
        sourceVoltage: 12,
      });
      expect(res.result.equivalentResistance).toBe(600);
      expect(res.result.currents?.[0]).toBe(0.02); // 20 mA
      expect(res.result.voltages).toEqual([2, 4, 6]);
      expect(res.result.totalPower).toBe(0.24); // 240 mW
    });

    it('calculates equivalent parallel resistance and branch currents', () => {
      const res = calculateSeriesParallel({
        resistors: [100, 100],
        mode: 'parallel',
        sourceVoltage: 5,
      });
      expect(res.result.equivalentResistance).toBe(50);
      expect(res.result.voltages).toEqual([5, 5]);
      expect(res.result.currents).toEqual([0.05, 0.05]);
      expect(res.result.totalPower).toBe(0.5);
    });

    it('throws on fewer than 2 resistors or non-positive values', () => {
      expect(() => calculateSeriesParallel({ resistors: [100], mode: 'series' })).toThrow(
        /at least 2/,
      );
      expect(() => calculateSeriesParallel({ resistors: [100, -50], mode: 'parallel' })).toThrow(
        /greater than zero/,
      );
    });
  });

  // 4. Voltage Divider
  describe('4. Voltage Divider', () => {
    it('calculates unloaded voltage divider output and branch current', () => {
      const res = calculateVoltageDivider({
        inputVoltage: 10,
        r1: 1000,
        r2: 1000,
      });
      expect(res.result.unloadedVoltage).toBe(5);
      expect(res.result.loadedVoltage).toBe(5);
      expect(res.result.attenuationRatio).toBe(0.5);
      expect(res.result.dividerCurrent).toBe(0.005);
    });

    it('calculates loaded voltage divider with load resistance RL', () => {
      const res = calculateVoltageDivider({
        inputVoltage: 10,
        r1: 1000,
        r2: 1000,
        loadResistance: 1000, // RL = 1k in parallel with R2 1k gives 500Ω
      });
      expect(res.result.unloadedVoltage).toBe(5);
      expect(Number(res.result.loadedVoltage.toFixed(2))).toBe(3.33); // 10 * 500 / 1500 = 3.33 V
    });

    it('throws on non-positive resistor values', () => {
      expect(() => calculateVoltageDivider({ inputVoltage: 5, r1: 0, r2: 100 })).toThrow(
        /strictly greater than zero/,
      );
    });
  });

  // 5. LED Current-Limiting Resistor
  describe('5. LED Current-Limiting Resistor', () => {
    it('calculates required resistance, E12 standard value, and power rating', () => {
      const res = calculateLedResistor({
        supplyVoltage: 5,
        forwardVoltage: 2.0, // Red LED
        forwardCurrentMa: 20,
      });
      expect(res.result.calculatedResistance).toBe(150);
      expect(res.result.standardE12Resistance).toBe(150);
      expect(res.result.recommendedRatingWatts).toBe('1/8 W (0.125 W)');
      expect(res.result.resistorPowerWatts).toBe(0.06);
    });

    it('throws when supply voltage is less than forward voltage', () => {
      expect(() =>
        calculateLedResistor({ supplyVoltage: 1.5, forwardVoltage: 2.0, forwardCurrentMa: 20 }),
      ).toThrow(/must be greater than LED forward voltage/);
    });
  });

  // 6. RC Time Constant & Filter
  describe('6. RC Time Constant & Filter', () => {
    it('calculates time constant tau, cutoff frequency, and charging curve', () => {
      const res = calculateRcTimeConstant({
        resistance: 10000, // 10 kΩ
        capacitanceUf: 100, // 100 µF
        supplyVoltage: 5,
      });
      expect(res.result.timeConstantSeconds).toBe(1); // 10,000 * 100e-6 = 1.0 s
      expect(res.result.timeConstantMs).toBe(1000);
      expect(Number(res.result.cutoffFrequencyHz.toFixed(3))).toBe(0.159);
      expect(res.result.timeTo99PercentMs).toBe(5000);
      expect(res.result.voltageCurve?.t1Tau).toBe(3.161); // 5 * (1 - e^-1)
    });

    it('throws on non-positive values', () => {
      expect(() => calculateRcTimeConstant({ resistance: -10, capacitanceUf: 10 })).toThrow(
        /strictly greater/,
      );
    });
  });

  // 7. Battery Runtime Estimator
  describe('7. Battery Runtime Estimator', () => {
    it('estimates battery endurance for constant load', () => {
      const res = calculateBatteryRuntime({
        batteryCapacityMah: 2000,
        averageCurrentMa: 100,
        deratingFactor: 0.85,
      });
      expect(res.result.usableCapacityMah).toBe(1700);
      expect(res.result.estimatedHours).toBe(17);
      expect(res.result.formattedRuntime).toBe('17h 0m');
    });

    it('calculates duty-cycled device runtime (active + sleep)', () => {
      const res = calculateBatteryRuntime({
        batteryCapacityMah: 2500,
        averageCurrentMa: 100, // 100 mA active
        sleepCurrentMa: 0.5, // 0.5 mA sleep
        dutyCyclePercent: 10, // 10% active
        deratingFactor: 0.9,
      });
      // effective = 100 * 0.1 + 0.5 * 0.9 = 10 + 0.45 = 10.45 mA
      expect(res.result.effectiveAverageMa).toBe(10.45);
      // usable = 2500 * 0.9 = 2250 mAh
      // runtime = 2250 / 10.45 = 215.31 hours (~8.97 days)
      expect(res.result.estimatedDays).toBeGreaterThan(8);
      expect(res.result.formattedRuntime).toContain('days');
    });

    it('validates bounds on derating and duty cycle', () => {
      expect(() =>
        calculateBatteryRuntime({
          batteryCapacityMah: 1000,
          averageCurrentMa: 10,
          deratingFactor: 1.5,
        }),
      ).toThrow(/between 0.01 and 1.0/);
    });
  });

  // 8. PWM Duty Cycle & Voltage
  describe('8. PWM Duty Cycle & Voltage', () => {
    it('calculates timing and voltage given duty percentage', () => {
      const res = calculatePwm({
        frequencyHz: 490,
        dutyCyclePercent: 50,
        peakVoltage: 5.0,
      });
      expect(res.result.arduinoValue8Bit).toBe(128);
      expect(res.result.averageVoltage).toBe(2.5);
      expect(res.result.periodMs).toBeCloseTo(2.041, 2);
      expect(res.result.onTimeMs).toBeCloseTo(1.02, 2);
    });

    it('calculates timing and duty cycle given 8-bit Arduino register value', () => {
      const res = calculatePwm({
        frequencyHz: 980,
        arduinoValue8Bit: 255,
      });
      expect(res.result.dutyCyclePercent).toBe(100);
      expect(res.result.averageVoltage).toBe(5.0);
    });

    it('throws when neither duty nor 8-bit value is given', () => {
      expect(() => calculatePwm({ frequencyHz: 490 })).toThrow(/Provide either duty cycle/);
    });
  });

  // 9. Servo Motor Pulse Width
  describe('9. Servo Motor Pulse Width', () => {
    it('calculates pulse width from angle (0° to 180°)', () => {
      const res = calculateServoPulse({
        angleDegrees: 90,
        minPulseUs: 1000,
        maxPulseUs: 2000,
      });
      expect(res.result.pulseWidthUs).toBe(1500);
      expect(res.result.pulseWidthMs).toBe(1.5);
      expect(res.result.dutyCyclePercent).toBe(7.5); // 1.5ms / 20ms = 7.5%
    });

    it('calculates angle from pulse width duration', () => {
      const res = calculateServoPulse({
        pulseWidthUs: 1500,
        minPulseUs: 1000,
        maxPulseUs: 2000,
      });
      expect(res.result.angleDegrees).toBe(90);
    });

    it('throws on out-of-range angle or pulse width', () => {
      expect(() => calculateServoPulse({ angleDegrees: 200 })).toThrow(/between 0° and 180°/);
      expect(() =>
        calculateServoPulse({ pulseWidthUs: 3000, minPulseUs: 1000, maxPulseUs: 2000 }),
      ).toThrow(/must be between/);
    });
  });

  // 10. Gear Ratio & Mechanical Advantage
  describe('10. Gear Ratio & Mechanical Advantage', () => {
    it('calculates speed reduction and torque multiplication', () => {
      const res = calculateGearRatio({
        driverTeeth: 10,
        drivenTeeth: 50,
        inputRpm: 1000,
        inputTorqueNm: 0.1,
        efficiencyPercent: 90,
      });
      expect(res.result.gearRatio).toBe(5);
      expect(res.result.outputRpm).toBe(200);
      expect(res.result.outputTorqueNm).toBe(0.45); // 0.1 * 5 * 0.9 = 0.45 N·m
      expect(res.result.outputTorqueKgCm).toBeCloseTo(4.588, 2);
    });

    it('throws on non-positive teeth or invalid efficiency', () => {
      expect(() =>
        calculateGearRatio({ driverTeeth: 0, drivenTeeth: 20, inputRpm: 100, inputTorqueNm: 1 }),
      ).toThrow(/strictly positive/);
    });
  });

  // 11. DC Motor Speed, Torque & Mechanical Power
  describe('11. DC Motor Speed, Torque & Power', () => {
    it('calculates electrical input, mechanical shaft power, and efficiency', () => {
      const res = calculateMotorPower({
        voltage: 12,
        current: 2, // 24 W input
        speedRpm: 3000,
        torqueNm: 0.05,
      });
      expect(res.result.electricalPowerWatts).toBe(24);
      expect(res.result.angularVelocityRadS).toBeCloseTo(314.159, 1);
      expect(res.result.mechanicalPowerWatts).toBeCloseTo(15.708, 2);
      expect(res.result.efficiencyPercent).toBeCloseTo(65.5, 0);
      expect(res.result.powerLossWatts).toBeCloseTo(8.292, 1);
    });

    it('throws when mechanical power exceeds electrical power', () => {
      expect(() =>
        calculateMotorPower({
          voltage: 5,
          current: 0.1, // 0.5 W input
          speedRpm: 5000,
          torqueNm: 1.0, // 500+ W output!
        }),
      ).toThrow(/cannot exceed electrical input power/);
    });
  });

  // 12. SI Engineering Unit Converter
  describe('12. SI Engineering Unit Converter', () => {
    it('converts kilo-ohms to standard ohms and engineering notation', () => {
      const res = calculateUnitConversion({
        value: 4.7,
        category: 'resistance',
        fromPrefix: 'kilo',
        toPrefix: 'base',
      });
      expect(res.result.convertedValue).toBe(4700);
      expect(res.result.fromLabel).toBe('kΩ');
      expect(res.result.toLabel).toBe('Ω');
      expect(res.result.engineeringNotation).toContain('4.700 × 10^3 Ω');
    });

    it('converts microfarads to picofarads', () => {
      const res = calculateUnitConversion({
        value: 10,
        category: 'capacitance',
        fromPrefix: 'micro',
        toPrefix: 'pico',
      });
      expect(res.result.convertedValue).toBe(10000000); // 10 µF = 10,000,000 pF
      expect(res.result.fromLabel).toBe('µF');
      expect(res.result.toLabel).toBe('pF');
    });

    it('converts milliamperes to amperes', () => {
      const res = calculateUnitConversion({
        value: 25,
        category: 'current',
        fromPrefix: 'milli',
        toPrefix: 'base',
      });
      expect(res.result.convertedValue).toBe(0.025);
    });
  });

  // Helpers
  describe('E-series Helpers', () => {
    it('finds nearest E12 and E24 values accurately', () => {
      expect(findNearestE12(215)).toBe(220);
      expect(findNearestE24(500)).toBe(510);
      expect(findNearestE12(980)).toBe(1000);
    });

    it('formats resistance with engineering units', () => {
      expect(formatResistance(220)).toBe('220 Ω');
      expect(formatResistance(4700)).toBe('4.7 kΩ');
      expect(formatResistance(1000000)).toBe('1 MΩ');
    });
  });
});
