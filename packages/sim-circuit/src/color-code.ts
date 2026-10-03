export interface ResistorColorBands {
  digit1: { value: number; name: string; hex: string };
  digit2: { value: number; name: string; hex: string };
  multiplier: { exponent: number; name: string; hex: string };
  tolerance: { percent: number; name: string; hex: string };
  hexColors: [string, string, string, string];
}

const DIGIT_COLORS: Record<number, { name: string; hex: string }> = {
  0: { name: 'Black', hex: '#1C1917' },
  1: { name: 'Brown', hex: '#854D0E' },
  2: { name: 'Red', hex: '#DC2626' },
  3: { name: 'Orange', hex: '#EA580C' },
  4: { name: 'Yellow', hex: '#EAB308' },
  5: { name: 'Green', hex: '#16A34A' },
  6: { name: 'Blue', hex: '#2563EB' },
  7: { name: 'Violet', hex: '#7C3AED' },
  8: { name: 'Gray', hex: '#64748B' },
  9: { name: 'White', hex: '#F8FAFC' },
};

/**
 * Calculates 4-band EIA color code for a given resistor value in Ohms.
 */
export function getResistorColorBands(resistance_Ohm: number): ResistorColorBands {
  const r = Math.max(1, Math.round(resistance_Ohm));

  // Determine standard 2 significant digits and decade multiplier
  const exp = Math.floor(Math.log10(r));
  const normalized = r / Math.pow(10, exp);
  const sigTwoDigits = Math.round(normalized * 10);

  const d1 = Math.floor(sigTwoDigits / 10);
  const d2 = sigTwoDigits % 10;
  const multiplierExp = exp - 1;

  const color1 = DIGIT_COLORS[d1] ?? DIGIT_COLORS[1]!;
  const color2 = DIGIT_COLORS[d2] ?? DIGIT_COLORS[0]!;
  const multColor = DIGIT_COLORS[Math.max(0, Math.min(9, multiplierExp))] ?? DIGIT_COLORS[2]!;
  const tolColor = { name: 'Gold', hex: '#D97706' }; // 5% default

  return {
    digit1: { value: d1, name: color1.name, hex: color1.hex },
    digit2: { value: d2, name: color2.name, hex: color2.hex },
    multiplier: { exponent: multiplierExp, name: multColor.name, hex: multColor.hex },
    tolerance: { percent: 5, name: tolColor.name, hex: tolColor.hex },
    hexColors: [color1.hex, color2.hex, multColor.hex, tolColor.hex],
  };
}
