import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/*.test.ts', 'packages/**/*.test.tsx', 'tools/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
      include: [
        'packages/config/src/**',
        'packages/content-schema/src/**',
        'packages/graders/src/**',
        'packages/calculators/src/**',
        'packages/i18n/src/**',
        'packages/storage/src/**',
        'packages/sim-circuit/src/**',
        'packages/sim-avr/src/**',
        'packages/coach/src/**',
      ],
    },
  },
});
