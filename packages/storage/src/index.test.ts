import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService, DEFAULT_SETTINGS } from './index';

describe('packages/storage', () => {
  let storage: StorageService;

  beforeEach(() => {
    storage = new StorageService();
  });

  it('initializes with default settings', async () => {
    const settings = await storage.getSettings();
    expect(settings.theme).toBe(DEFAULT_SETTINGS.theme);
    expect(settings.language).toBe('en');
  });

  it('updates settings and persists changes', async () => {
    await storage.updateSettings({ theme: 'light', reducedMotion: true });
    const settings = await storage.getSettings();
    expect(settings.theme).toBe('light');
    expect(settings.reducedMotion).toBe(true);
  });

  it('records lesson progress and retrieves it', async () => {
    const progress = await storage.setProgress('m01-l01-what-is-electricity', 'completed', 1.0);
    expect(progress.status).toBe('completed');

    const retrieved = await storage.getProgress('m01-l01-what-is-electricity');
    expect(retrieved?.status).toBe('completed');
  });

  it('exports and imports .roboforge bundles', async () => {
    await storage.setProgress('m01-l01', 'completed');
    await storage.updateSettings({ theme: 'light' });

    const bundle = await storage.exportBundle();
    expect(bundle.version).toBe(1);
    expect(bundle.data.lessonProgress).toHaveLength(1);

    const freshStorage = new StorageService();
    await freshStorage.importBundle(bundle);

    const importedProgress = await freshStorage.getProgress('m01-l01');
    const importedSettings = await freshStorage.getSettings();
    expect(importedProgress?.status).toBe('completed');
    expect(importedSettings.theme).toBe('light');
  });

  it('resets all data cleanly upon user request', async () => {
    await storage.setProgress('m01-l01', 'completed');
    await storage.resetAll();
    const all = await storage.getAllProgress();
    expect(all).toHaveLength(0);
  });
});
