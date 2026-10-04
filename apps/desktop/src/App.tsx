import React, { useState, useEffect, useCallback } from 'react';
import {
  StorageService,
  type SettingsRecord,
  DEFAULT_SETTINGS,
  toDayString,
} from '@roboforge/storage';
import { t } from '@roboforge/i18n';
import { Toast } from '@roboforge/ui';
import { HomeView } from './views/HomeView';
import { LearnView } from './views/LearnView';
import { SettingsView } from './views/SettingsView';
import { ToolsView } from './views/ToolsView';
import { SimulatorView } from './views/SimulatorView';
import { CoachView } from './views/CoachView';
import { LibraryView } from './views/LibraryView';
import { PracticeView } from './views/PracticeView';
import { ProjectsView } from './views/ProjectsView';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';

const storage = new StorageService();

interface NavItem {
  id: string;
  labelKey: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', labelKey: 'nav.home', icon: '🏠' },
  { id: 'learn', labelKey: 'nav.learn', icon: '📖' },
  { id: 'practice', labelKey: 'nav.practice', icon: '🎯' },
  { id: 'simulate', labelKey: 'nav.simulate', icon: '⚡' },
  { id: 'projects', labelKey: 'nav.projects', icon: '🤖' },
  { id: 'tools', labelKey: 'nav.tools', icon: '🛠️' },
  { id: 'library', labelKey: 'nav.library', icon: '📚' },
  { id: 'coach', labelKey: 'nav.coach', icon: '💬' },
  { id: 'settings', labelKey: 'nav.settings', icon: '⚙️' },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [settings, setSettings] = useState<SettingsRecord>(DEFAULT_SETTINGS);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [motivationKey, setMotivationKey] = useState(0);

  const markMilestone = useCallback(async (name: string) => {
    await storage.setMilestone(name);
    await storage.recordActivity(toDayString(new Date()));
    setMotivationKey(k => k + 1);
  }, []);

  const handleArduinoRan = useCallback(() => {
    void markMilestone('ran-arduino-sim');
  }, [markMilestone]);

  const handleRobotRan = useCallback(() => {
    void markMilestone('ran-robot-sim');
  }, [markMilestone]);

  const handleProjectComplete = useCallback(
    (projectId: string) => {
      void markMilestone(`project:${projectId}`);
    },
    [markMilestone],
  );

  const applyTheme = (theme: 'dark' | 'light' | 'system') => {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  };

  const applyAccessibilitySettings = useCallback((s: SettingsRecord) => {
    const root = document.documentElement;

    // Low-Spec Performance Mode (FR-SET-04, ARCHITECTURE.md §10)
    if (s.lowSpecMode) {
      root.setAttribute('data-low-spec', 'true');
      root.classList.add('low-spec');
    } else {
      root.removeAttribute('data-low-spec');
      root.classList.remove('low-spec');
    }

    // Reduced Motion (FR-ACC-01)
    if (s.reducedMotion) {
      root.setAttribute('data-reduced-motion', 'true');
      root.classList.add('reduced-motion');
    } else {
      root.removeAttribute('data-reduced-motion');
      root.classList.remove('reduced-motion');
    }

    // Font size scaling
    if (s.fontSize === 'sm') {
      root.style.fontSize = '14px';
    } else if (s.fontSize === 'lg') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  }, []);

  // Load storage state on mount
  useEffect(() => {
    async function loadData() {
      const s = await storage.getSettings();
      setSettings(s);
      applyTheme(s.theme);
      applyAccessibilitySettings(s);

      const allProgress = await storage.getAllProgress();
      const completed = new Set(
        allProgress.filter(p => p.status === 'completed').map(p => p.lessonId),
      );
      setCompletedLessons(completed);
    }
    loadData();
  }, [applyAccessibilitySettings]);

  // Global Keyboard Shortcuts (Ctrl/Cmd + 1..9 for tabs)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key, 10) - 1;
        if (NAV_ITEMS[index]) {
          e.preventDefault();
          setActiveTab(NAV_ITEMS[index].id);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleUpdateSettings = async (partial: Partial<SettingsRecord>) => {
    const next = await storage.updateSettings(partial);
    setSettings(next);
    if (partial.theme) {
      applyTheme(next.theme);
    }
    applyAccessibilitySettings(next);
    setToastMessage('Settings updated.');
  };

  const handleToggleComplete = async (lessonId: string, completed: boolean) => {
    await storage.setProgress(lessonId, completed ? 'completed' : 'viewed');
    await storage.recordActivity(toDayString(new Date()));
    setCompletedLessons(prev => {
      const next = new Set(prev);
      if (completed) next.add(lessonId);
      else next.delete(lessonId);
      return next;
    });
    setToastMessage(
      completed ? '🎉 Lesson marked complete! Progress saved.' : 'Lesson marked as uncompleted.',
    );
  };

  return (
    <div className="flex min-h-screen bg-app text-text-main font-sans relative">
      {/* Skip to Content Link (A11y FR-ACC-01) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-sky-600 focus:text-white focus:font-bold focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      {/* Sidebar Navigation (FR-APP-02) */}
      <nav
        aria-label="Main Navigation"
        className="w-64 bg-surface border-r border-border-subtle flex flex-col justify-between p-4 flex-shrink-0"
      >
        <div className="space-y-6">
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-3 px-3 py-2">
            <span className="text-2xl" role="img" aria-label="RoboForge robot">
              🤖
            </span>
            <div>
              <span className="text-lg font-black tracking-wider text-sky-400 block leading-tight">
                ROBOFORGE
              </span>
              <span className="text-[10px] text-text-muted font-mono tracking-widest uppercase">
                Offline School
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <ul className="space-y-1">
            {NAV_ITEMS.map(item => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20'
                        : 'text-text-muted hover:bg-surface-subtle hover:text-text-main'
                    }`}
                  >
                    <span className="text-base" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>{t(item.labelKey)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 bg-surface-subtle rounded-xl border border-border-subtle space-y-1 text-xs">
          <div className="flex items-center justify-between text-text-muted">
            <span>Status</span>
            <span className="text-emerald-400 font-semibold">● Offline</span>
          </div>
          <div className="text-[11px] text-text-muted">100% on-device. No telemetry.</div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 overflow-y-auto p-8 lg:p-12 focus:outline-none"
      >
        {activeTab === 'home' && (
          <HomeView onNavigate={setActiveTab} completedCount={completedLessons.size} />
        )}

        {activeTab === 'learn' && (
          <LearnView
            completedLessons={completedLessons}
            onToggleComplete={handleToggleComplete}
            onAskCoach={() => setActiveTab('coach')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onExportData={() => storage.exportBundle()}
            onImportData={async bundle => {
              await storage.importBundle(bundle);
              const reloaded = await storage.getSettings();
              setSettings(reloaded);
              applyTheme(reloaded.theme);
              applyAccessibilitySettings(reloaded);
              const all = await storage.getAllProgress();
              setCompletedLessons(
                new Set(all.filter(p => p.status === 'completed').map(p => p.lessonId)),
              );
              setToastMessage('Data imported successfully!');
            }}
            onResetData={async () => {
              await storage.resetAll();
              setSettings(DEFAULT_SETTINGS);
              applyTheme('dark');
              applyAccessibilitySettings(DEFAULT_SETTINGS);
              setCompletedLessons(new Set());
              setToastMessage('All progress reset.');
            }}
          />
        )}

        {activeTab === 'tools' && <ToolsView />}

        {activeTab === 'practice' && (
          <PracticeView
            storage={storage}
            completedLessons={completedLessons}
            refreshKey={motivationKey}
          />
        )}

        {activeTab === 'simulate' && (
          <SimulatorView
            onArduinoRan={handleArduinoRan}
            onRobotRan={handleRobotRan}
            lowSpecMode={settings.lowSpecMode}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsView
            onNavigate={setActiveTab}
            onProjectComplete={handleProjectComplete}
            storage={storage}
            learnerNickname={settings.learnerNickname}
          />
        )}

        {activeTab === 'library' && <LibraryView />}

        {activeTab === 'coach' && <CoachView />}
      </main>

      {/* First-Run Onboarding Wizard (FR-APP-03) */}
      <OnboardingWizard
        isOpen={!settings.onboardingCompleted}
        onComplete={async completedSettings => {
          await handleUpdateSettings(completedSettings);
          setToastMessage(
            `Welcome aboard, ${completedSettings.learnerNickname || 'Cadet'}! Setup complete.`,
          );
        }}
      />

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
};
