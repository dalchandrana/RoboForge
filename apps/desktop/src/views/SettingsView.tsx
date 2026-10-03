import React, { useState, useRef } from 'react';
import { Card, Button, Modal } from '@roboforge/ui';
import { t } from '@roboforge/i18n';
import type { SettingsRecord, RoboforgeExportBundle } from '@roboforge/storage';

interface SettingsViewProps {
  settings: SettingsRecord;
  onUpdateSettings: (partial: Partial<SettingsRecord>) => Promise<void>;
  onExportData: () => Promise<RoboforgeExportBundle>;
  onImportData: (bundle: RoboforgeExportBundle) => Promise<void>;
  onResetData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleExport = async () => {
    try {
      const bundle = await onExportData();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roboforge-backup-${new Date().toISOString().slice(0, 10)}.roboforge`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMsg('Export downloaded successfully!');
    } catch (err: unknown) {
      setStatusMsg('Export failed: ' + (err as Error).message);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as RoboforgeExportBundle;
      await onImportData(parsed);
      setStatusMsg('Progress restored successfully!');
    } catch (err: unknown) {
      setStatusMsg('Import failed: ' + (err as Error).message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="border-b border-border-subtle pb-4">
        <h1 className="text-3xl font-extrabold">{t('settings.title')}</h1>
        <p className="text-sm text-text-muted mt-1">
          Customize your offline workspace, accessibility, and AI preferences.
        </p>
      </header>

      {statusMsg && (
        <div className="p-3 rounded-lg bg-sky-950/60 border border-sky-800 text-sky-200 text-sm">
          {statusMsg}
        </div>
      )}

      {/* Appearance & A11y */}
      <Card variant="surface" className="space-y-4">
        <h2 className="text-lg font-bold">Appearance & Accessibility</h2>

        <div className="flex items-center justify-between py-2 border-b border-border-subtle">
          <div>
            <label htmlFor="theme-select" className="font-medium text-sm block">
              {t('settings.theme')}
            </label>
            <span className="text-xs text-text-muted">High-contrast dark or light theme</span>
          </div>
          <select
            id="theme-select"
            value={settings.theme}
            onChange={e => onUpdateSettings({ theme: e.target.value as SettingsRecord['theme'] })}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-border-strong text-sm"
          >
            <option value="dark">{t('settings.themeDark')}</option>
            <option value="light">{t('settings.themeLight')}</option>
            <option value="system">{t('settings.themeSystem')}</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-border-subtle">
          <div>
            <label htmlFor="font-size-select" className="font-medium text-sm block">
              {t('settings.fontSize')}
            </label>
            <span className="text-xs text-text-muted">Scale text for comfortable reading</span>
          </div>
          <select
            id="font-size-select"
            value={settings.fontSize}
            onChange={e =>
              onUpdateSettings({ fontSize: e.target.value as SettingsRecord['fontSize'] })
            }
            className="px-3 py-2 rounded-lg bg-slate-900 border border-border-strong text-sm"
          >
            <option value="sm">Small</option>
            <option value="md">Default (16px)</option>
            <option value="lg">Large (18px)</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <label htmlFor="reduced-motion-toggle" className="font-medium text-sm block">
              {t('settings.reducedMotion')}
            </label>
            <span className="text-xs text-text-muted">Disables animations and transitions</span>
          </div>
          <input
            id="reduced-motion-toggle"
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={e => onUpdateSettings({ reducedMotion: e.target.checked })}
            className="w-5 h-5 text-sky-500 rounded cursor-pointer"
          />
        </div>
      </Card>

      {/* AI Coach Preferences */}
      <Card variant="surface" className="space-y-4">
        <h2 className="text-lg font-bold">Local AI Coach Settings</h2>

        <div className="flex items-center justify-between py-2 border-b border-border-subtle">
          <div>
            <label htmlFor="ai-off-toggle" className="font-medium text-sm block">
              {t('settings.aiOffMode')}
            </label>
            <span className="text-xs text-text-muted">
              Use static authored hints only. Zero local model RAM required.
            </span>
          </div>
          <input
            id="ai-off-toggle"
            type="checkbox"
            checked={settings.aiOffMode}
            onChange={e => onUpdateSettings({ aiOffMode: e.target.checked })}
            className="w-5 h-5 text-sky-500 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <label htmlFor="ai-tier-select" className="font-medium text-sm block">
              {t('settings.aiTier')}
            </label>
            <span className="text-xs text-text-muted">
              Scaled to laptop memory: Small (8GB), Balanced (16GB), Best (32GB+)
            </span>
          </div>
          <select
            id="ai-tier-select"
            disabled={settings.aiOffMode}
            value={settings.aiTier}
            onChange={e => onUpdateSettings({ aiTier: e.target.value as SettingsRecord['aiTier'] })}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-border-strong text-sm disabled:opacity-50"
          >
            <option value="small">Small (~1B class, 8GB RAM)</option>
            <option value="balanced">Balanced (~4B class, 16GB RAM)</option>
            <option value="best">Best (~12B class, 32GB RAM)</option>
          </select>
        </div>
      </Card>

      {/* Backup, Export & Reset */}
      <Card variant="surface" className="space-y-4">
        <h2 className="text-lg font-bold">{t('settings.backup')}</h2>
        <p className="text-xs text-text-muted">
          Your data belongs to you. Export a single portable `.roboforge` file or reset anytime.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button variant="primary" onClick={handleExport} id="export-data-btn">
            📥 {t('settings.exportData')}
          </Button>

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            id="import-data-btn"
          >
            📤 {t('settings.importData')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".roboforge,.json"
            onChange={handleImport}
            className="hidden"
          />

          <Button variant="danger" onClick={() => setShowResetModal(true)} id="reset-data-btn">
            🗑️ {t('settings.resetData')}
          </Button>
        </div>
      </Card>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Confirm Data Reset"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-main">{t('settings.resetConfirm')}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                await onResetData();
                setShowResetModal(false);
                setStatusMsg('All local progress has been reset.');
              }}
            >
              Yes, Reset Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
