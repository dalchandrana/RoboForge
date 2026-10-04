/**
 * Core types for @roboforge/calculators.
 */

export interface CalculationStep {
  label: string;
  math: string;
  explanation: string;
}

export interface CalculationOutput<T> {
  result: T;
  formula: string;
  steps: CalculationStep[];
  unit: string;
}

// 1. Ohm's Law
export interface OhmsLawParams {
  voltage?: number; // Volts (V)
  current?: number; // Amperes (A)
  resistance?: number; // Ohms (Ω)
}

export interface OhmsLawResult {
  voltage: number;
  current: number;
  resistance: number;
  power: number; // Watts (W)
}

// 2. Resistor Color Code
export type ResistorColorBand =
  | 'black'
  | 'brown'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'violet'
  | 'gray'
  | 'white'
  | 'gold'
  | 'silver';

export interface ResistorColorCodeParams {
  bands: ResistorColorBand[]; // 4 or 5 bands
}

export interface ResistorColorCodeResult {
  resistance: number; // Ohms (Ω)
  tolerancePercent: number; // e.g. 5 for ±5%
  formattedResistance: string; // e.g. "4.7 kΩ ±5%"
  minResistance: number;
  maxResistance: number;
}

export interface ResistanceToBandsResult {
  bands4: ResistorColorBand[];
  bands5: ResistorColorBand[];
  standardE12Value: number;
  standardE24Value: number;
}

// 3. Series and Parallel Resistors
export interface SeriesParallelParams {
  resistors: number[]; // Array of resistance values in Ohms
  mode: 'series' | 'parallel';
  sourceVoltage?: number; // Optional V to calculate power distribution
}

export interface SeriesParallelResult {
  equivalentResistance: number; // Ohms (Ω)
  mode: 'series' | 'parallel';
  count: number;
  currents?: number[]; // Current through each resistor if V provided
  voltages?: number[]; // Voltage across each resistor if V provided
  powers?: number[]; // Power dissipated by each resistor if V provided
  totalPower?: number; // Total power dissipated
}

// 4. Voltage Divider
export interface VoltageDividerParams {
  inputVoltage: number; // Vin (V)
  r1: number; // Top resistor (Ω)
  r2: number; // Bottom resistor (Ω)
  loadResistance?: number; // Optional load resistance R_L across R2 (Ω)
}

export interface VoltageDividerResult {
  unloadedVoltage: number; // Vout without load
  loadedVoltage: number; // Vout with load
  dividerCurrent: number; // Current through divider branch (A)
  r1Power: number; // Power in R1 (W)
  r2Power: number; // Power in R2 (W)
  attenuationRatio: number; // Vout / Vin
}

// 5. LED Current-Limiting Resistor
export interface LedResistorParams {
  supplyVoltage: number; // Vs (V)
  forwardVoltage: number; // Vf (V)
  forwardCurrentMa: number; // If (mA)
}

export interface LedResistorResult {
  calculatedResistance: number; // Exact calculated R (Ω)
  standardE12Resistance: number; // Nearest E12 value (Ω)
  standardE24Resistance: number; // Nearest E24 value (Ω)
  actualCurrentMa: number; // Current with nearest standard resistor (mA)
  resistorPowerWatts: number; // Power dissipated in resistor (W)
  recommendedRatingWatts: string; // e.g. "1/4 W (0.25 W)" or "1/2 W (0.50 W)"
  ledPowerWatts: number;
}

// 6. RC Time Constant & Filter
export interface RcTimeConstantParams {
  resistance: number; // R (Ω)
  capacitanceUf: number; // C in microfarads (µF)
  supplyVoltage?: number; // Optional supply voltage (V)
}

export interface RcTimeConstantResult {
  timeConstantSeconds: number; // Tau τ = R * C (s)
  timeConstantMs: number; // τ (ms)
  cutoffFrequencyHz: number; // fc = 1 / (2 * π * R * C) (Hz)
  timeTo63PercentMs: number; // 1τ
  timeTo95PercentMs: number; // 3τ
  timeTo99PercentMs: number; // 5τ (fully charged)
  voltageCurve?: {
    t1Tau: number;
    t2Tau: number;
    t3Tau: number;
    t5Tau: number;
  };
}

// 7. Battery Runtime Estimator
export interface BatteryRuntimeParams {
  batteryCapacityMah: number; // Battery capacity in mAh
  averageCurrentMa: number; // Average current draw in mA
  deratingFactor?: number; // Default 0.85 (85% usable capacity due to efficiency/Peukert)
  sleepCurrentMa?: number; // Optional sleep current for duty cycled devices
  dutyCyclePercent?: number; // % of time active (0 - 100)
}

export interface BatteryRuntimeResult {
  estimatedHours: number;
  estimatedDays: number;
  formattedRuntime: string;
  effectiveAverageMa: number;
  usableCapacityMah: number;
}

// 8. PWM Duty Cycle & Voltage
export interface PwmParams {
  frequencyHz: number; // Frequency (Hz), e.g. 490 Hz for Arduino Uno Pins 3, 9, 10, 11
  dutyCyclePercent?: number; // 0 to 100%
  arduinoValue8Bit?: number; // 0 to 255
  peakVoltage?: number; // Default 5.0 V
}

export interface PwmResult {
  dutyCyclePercent: number; // %
  arduinoValue8Bit: number; // 0..255
  periodMs: number; // Total period T = 1/f (ms)
  onTimeMs: number; // Ton (ms)
  offTimeMs: number; // Toff (ms)
  averageVoltage: number; // Vavg = Vpeak * (Duty / 100) (V)
  peakVoltage: number;
}

// 9. Servo Motor Pulse Width
export interface ServoPulseParams {
  pulseWidthUs?: number; // Pulse width in microseconds (usually 544 to 2400 µs, center 1500 µs)
  angleDegrees?: number; // Target angle 0 to 180 degrees
  minPulseUs?: number; // Min pulse default 544 µs (or 1000 µs)
  maxPulseUs?: number; // Max pulse default 2400 µs (or 2000 µs)
  frameRateHz?: number; // Standard 50 Hz frame rate (20 ms period)
}

export interface ServoPulseResult {
  angleDegrees: number; // 0 to 180°
  pulseWidthUs: number; // µs
  pulseWidthMs: number; // ms
  framePeriodMs: number; // 20 ms
  dutyCyclePercent: number; // %
}

// 10. Gear Ratio & Mechanical Advantage
export interface GearRatioParams {
  driverTeeth: number; // N_driver (motor gear)
  drivenTeeth: number; // N_driven (output gear)
  inputRpm: number; // Motor speed (RPM)
  inputTorqueNm: number; // Motor torque (N·m)
  efficiencyPercent?: number; // Mechanical gearbox efficiency (default 90%)
}

export interface GearRatioResult {
  gearRatio: number; // GR = driven / driver
  outputRpm: number; // RPM_out = RPM_in / GR
  outputTorqueNm: number; // Torque_out = Torque_in * GR * efficiency
  outputTorqueKgCm: number; // In kg·cm (common hobby robotics unit)
  mechanicalAdvantage: number;
  speedReductionFactor: number;
}

// 11. DC Motor Speed, Torque & Mechanical Power
export interface MotorPowerParams {
  voltage: number; // V
  current: number; // A
  speedRpm: number; // Shaft speed in RPM
  torqueNm: number; // Shaft torque in N·m
}

export interface MotorPowerResult {
  electricalPowerWatts: number; // Pin = V * I
  mechanicalPowerWatts: number; // Pout = Torque * ω = Torque * (2 * π * RPM / 60)
  angularVelocityRadS: number; // ω in rad/s
  efficiencyPercent: number; // (Pout / Pin) * 100%
  powerLossWatts: number; // Pin - Pout (dissipated as heat)
}

// 12. SI Engineering Unit Converter
export type MetricPrefix = 'pico' | 'nano' | 'micro' | 'milli' | 'base' | 'kilo' | 'mega' | 'giga';
export type UnitCategory =
  'resistance' | 'capacitance' | 'current' | 'voltage' | 'frequency' | 'power';

export interface UnitConverterParams {
  value: number;
  category: UnitCategory;
  fromPrefix: MetricPrefix;
  toPrefix: MetricPrefix;
}

export interface UnitConverterResult {
  originalValue: number;
  convertedValue: number;
  baseValue: number; // Value in SI base unit (Ω, F, A, V, Hz, W)
  fromLabel: string;
  toLabel: string;
  engineeringNotation: string;
}
