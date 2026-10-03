import React, { useState, useEffect } from 'react';
import { StorageService, type SettingsRecord, DEFAULT_SETTINGS } from '@roboforge/storage';
import { t } from '@roboforge/i18n';
import { Toast } from '@roboforge/ui';
import { HomeView } from './views/HomeView';
import { LearnView } from './views/LearnView';
import { SettingsView } from './views/SettingsView';
import { ToolsView } from './views/ToolsView';
import { SimulatorView } from './views/SimulatorView';
import { PlaceholderView } from './views/PlaceholderView';

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

  // Load storage state on mount
  useEffect(() => {
    async function loadData() {
      const s = await storage.getSettings();
      setSettings(s);
      applyTheme(s.theme);

      const allProgress = await storage.getAllProgress();
      const completed = new Set(
        allProgress.filter(p => p.status === 'completed').map(p => p.lessonId),
      );
      setCompletedLessons(completed);
    }
    loadData();
  }, []);

  const applyTheme = (theme: 'dark' | 'light' | 'system') => {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  };

  const handleUpdateSettings = async (partial: Partial<SettingsRecord>) => {
    const next = await storage.updateSettings(partial);
    setSettings(next);
    if (partial.theme) {
      applyTheme(next.theme);
    }
    setToastMessage('Settings updated.');
  };

  const handleToggleComplete = async (lessonId: string, completed: boolean) => {
    await storage.setProgress(lessonId, completed ? 'completed' : 'viewed');
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
    <div className="flex min-h-screen bg-app text-text-main font-sans">
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
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        {activeTab === 'home' && (
          <HomeView onNavigate={setActiveTab} completedCount={completedLessons.size} />
        )}

        {activeTab === 'learn' && (
          <LearnView
            isCompleted={completedLessons.has('m01-l01-what-is-electricity')}
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
              setCompletedLessons(new Set());
              setToastMessage('All progress reset.');
            }}
          />
        )}

        {activeTab === 'tools' && <ToolsView />}

        {activeTab === 'practice' && (
          <PlaceholderView
            title="Practice & Assessment Engine"
            icon="🎯"
            phase="Phase 1"
            description="Auto-graded interactive problem sets with staged hint ladders, mini-games, and skill radars."
            features={[
              'Numeric problems with tolerance validation',
              'Circuit-state assertions',
              'Break-time mini-games (Resistor color codes, pin matching)',
              'Daily streak tracker (non-punitive)',
            ]}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'simulate' && <SimulatorView />}

        {activeTab === 'projects' && (
          <PlaceholderView
            title="Hardware Projects & BOM Hub"
            icon="🤖"
            phase="Phase 2"
            description="5 MVP guided robotics projects with starter-kit BOMs and simulated twins."
            features={[
              'P1: LED Blink & Timing',
              'P2: Traffic Light Controller',
              'P3: Autonomous Line Follower',
              'P4: Obstacle-Avoiding Car',
              'P5: Articulated Servo Arm',
            ]}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'library' && (
          <PlaceholderView
            title="Component Library & Cheat Sheets"
            icon="📚"
            phase="Phase 2"
            description="20 fundamental robotics components with SVG pinouts, typical circuits, and common mistakes."
            features={[
              'Pinout diagrams and absolute maximum ratings',
              'Typical application circuits and safety warnings',
              'Protocol cheat sheets: UART, I2C, SPI',
              'Vendor-neutral sourcing recommendations',
            ]}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'coach' && (
          <PlaceholderView
            title="Socratic AI Coach"
            icon="💬"
            phase="Phase 1"
            description="Private, on-device AI coach powered by localhost Ollama. Asks guiding questions and never spoils answers."
            features={[
              'Hint ladder (0 to 4): conceptual nudges before reveals',
              'Context-aware: reads your current lesson and circuit netlist',
              'Hardware safety guardrail intercepts dangerous topics',
              'AI-Off mode for 100% authored hint experience',
            ]}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
};
