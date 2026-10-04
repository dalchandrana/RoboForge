import type { SafetyCheckResult } from './types';

interface SafetyPattern {
  hazard: string;
  regex: RegExp;
  guidance: string;
  requiresAdult: boolean;
}

const HAZARD_PATTERNS: SafetyPattern[] = [
  {
    hazard: 'MAINS_HIGH_VOLTAGE',
    regex:
      /(mains|wall\s*socket|wall\s*outlet|120\s*v|220\s*v|230\s*v|240\s*v|ac\s*power|plug\s*into\s*the\s*wall|fuse\s*box|utility\s*power)/i,
    guidance:
      'High-Voltage Hazard: In RoboForge, all robotics and electronics lessons operate strictly on low-voltage DC batteries (≤ 12V, ≤ 2A). Household wall outlets and mains power carry lethal current that can cause severe injury or electrocution. Never attempt to connect homemade circuits or components to wall outlets. Please consult a qualified adult, science teacher, or licensed electrician.',
    requiresAdult: true,
  },
  {
    hazard: 'LIPO_CHARGING_HAZARD',
    regex:
      /(lipo|li-ion|lithium\s*polymer|charging\s*lipo|puncture\s*battery|bypass\s*bms|short\s*lipo)/i,
    guidance:
      'Battery Chemistry Hazard: Lithium Polymer (LiPo) and Li-ion cells store dense chemical energy and can rapidly vent, swell, or catch fire if punctured, shorted, or charged with an improper charger. In early modules, always use standard AA alkaline batteries or 9V transistor batteries with current limits.',
    requiresAdult: true,
  },
  {
    hazard: 'BYPASS_PROTECTION',
    regex: /(bypass.*fuse|remove.*resistor|ignore.*limit|override.*breaker|jump.*fuse)/i,
    guidance:
      'Circuit Protection Rule: Fuses, circuit breakers, and current-limiting resistors exist to prevent catastrophic overheating and fire. Never bypass or jump circuit protection components. Always calculate the proper resistance to protect components and power sources.',
    requiresAdult: false,
  },
  {
    hazard: 'DANGEROUS_MATERIALS',
    regex:
      /(explosive|gunpowder|flammable\s*gas|ignite\s*petrol|toxic\s*chemical|hydrochloric|sulfuric\s*acid)/i,
    guidance:
      'Hazardous Material Warning: RoboForge is strictly for safe educational electronics and robotics. Discussions of explosive substances, combustion accelerators, or dangerous chemicals are restricted.',
    requiresAdult: true,
  },
  {
    hazard: 'UNVENTILATED_SOLDERING',
    regex: /(soldering\s*iron|hot\s*solder|melt\s*lead|inhale\s*fumes)/i,
    guidance:
      'Soldering Safety: Soldering irons reach temperatures exceeding 350°C (660°F) and solder fumes can irritate lungs. In Modules 1 to 4, all prototyping is 100% solderless via breadboards. When soldering in advanced college modules, always wear safety goggles, use lead-free solder in a well-ventilated space, and have adult supervision.',
    requiresAdult: true,
  },
];

/**
 * Validates learner input and circuit context against hardware safety boundaries.
 */
export function checkHardwareSafety(input: string): SafetyCheckResult {
  const normalized = input.trim();

  for (const pattern of HAZARD_PATTERNS) {
    if (pattern.regex.test(normalized)) {
      return {
        isSafe: false,
        hazardDetected: pattern.hazard,
        safetyGuidance: pattern.guidance,
        requiresAdult: pattern.requiresAdult,
      };
    }
  }

  return {
    isSafe: true,
    requiresAdult: false,
  };
}
