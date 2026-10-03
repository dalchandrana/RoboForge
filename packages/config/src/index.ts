/**
 * Core application constants, configuration, and feature flags.
 * Never hardcode the app name in UI or docs; use APP_NAME.
 */

export const APP_NAME = 'RoboForge' as const;
export const APP_VERSION = '0.1.0' as const;
export const APP_AUTHOR = 'RoboForge Contributors' as const;
export const APP_LICENSE = 'Apache-2.0' as const;

/**
 * Local inference endpoints and constraints.
 * No external network calls are allowed; strictly localhost Ollama.
 */
export const OLLAMA_DEFAULT_HOST = 'http://127.0.0.1:11434' as const;

export const PERFORMANCE_BUDGETS = {
  maxBootMs: 3000,
  maxLessonOpenMs: 300,
  maxCircuitLatencyMs: 150,
  targetSimFps: 60,
  maxIdleRamMb: 400,
  maxInstallerSizeMb: 250,
} as const;

export const FEATURE_FLAGS = {
  enableAiCoach: true,
  enableAiOffMode: true,
  enableSpacedRepetition: true,
  enableGamification: true,
  enableLowSpecMode: true,
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
