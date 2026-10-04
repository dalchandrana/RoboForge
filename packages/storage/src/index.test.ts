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

  it('saves, retrieves, and deletes workshop project build logs (FR-PRJ-05)', async () => {
    await storage.saveProjectLog({
      id: 'log-1',
      projectId: 'p3-autonomous-line-follower',
      title: 'First successful 2WD chassis assembly',
      notes: 'Mounted L298N driver and TCRT5000 dual sensors. Calibrated ground clearance to 5mm.',
      observations: 'Robot tracked straight loop at 140 PWM with bang-bang controller.',
      createdAt: '2026-10-04T12:00:00.000Z',
      completed: true,
    });

    const allLogs = await storage.getProjectLogs();
    expect(allLogs).toHaveLength(1);
    expect(allLogs[0]?.title).toBe('First successful 2WD chassis assembly');

    const p3Logs = await storage.getProjectLogs('p3-autonomous-line-follower');
    expect(p3Logs).toHaveLength(1);

    const p4Logs = await storage.getProjectLogs('p4-ultrasonic-obstacle-avoider');
    expect(p4Logs).toHaveLength(0);

    const deleted = await storage.deleteProjectLog('log-1');
    expect(deleted).toBe(true);

    const remaining = await storage.getProjectLogs();
    expect(remaining).toHaveLength(0);
  });

  it('exports and imports project build logs in .roboforge bundles', async () => {
    await storage.saveProjectLog({
      id: 'log-persist-1',
      projectId: 'p4-ultrasonic-obstacle-avoider',
      title: 'Sonar radar test',
      notes: 'Tested pan servo angle sweep.',
      observations: 'Detected doorway at 140cm.',
      createdAt: '2026-10-04T14:00:00.000Z',
      completed: true,
    });

    const bundle = await storage.exportBundle();
    expect(bundle.data.projectLogs).toHaveLength(1);

    const fresh = new StorageService();
    await fresh.importBundle(bundle);

    const importedLogs = await fresh.getProjectLogs('p4-ultrasonic-obstacle-avoider');
    expect(importedLogs).toHaveLength(1);
    expect(importedLogs[0]?.title).toBe('Sonar radar test');
  });

  it('resets all data cleanly upon user request', async () => {
    await storage.setProgress('m01-l01', 'completed');
    await storage.saveProjectLog({
      id: 'log-reset',
      projectId: 'p1',
      title: 'Test',
      notes: 'N',
      observations: 'O',
      createdAt: '2026-10-04',
      completed: false,
    });
    await storage.resetAll();
    const all = await storage.getAllProgress();
    expect(all).toHaveLength(0);
    const logs = await storage.getProjectLogs();
    expect(logs).toHaveLength(0);
  });
});
