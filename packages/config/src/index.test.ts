import { describe, it, expect } from 'vitest';
import { APP_NAME, OLLAMA_DEFAULT_HOST, PERFORMANCE_BUDGETS, FEATURE_FLAGS } from './index';

describe('packages/config', () => {
  it('defines the core application constants', () => {
    expect(APP_NAME).toBe('RoboForge');
    expect(OLLAMA_DEFAULT_HOST).toContain('127.0.0.1');
  });

  it('declares valid performance budgets', () => {
    expect(PERFORMANCE_BUDGETS.maxBootMs).toBeLessThanOrEqual(3000);
    expect(PERFORMANCE_BUDGETS.maxIdleRamMb).toBeLessThanOrEqual(400);
  });

  it('exposes feature flags including AI off mode', () => {
    expect(FEATURE_FLAGS.enableAiOffMode).toBe(true);
  });
});
