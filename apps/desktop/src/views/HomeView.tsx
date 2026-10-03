import React from 'react';
import { Card, Button, Callout, Badge } from '@roboforge/ui';
import { t } from '@roboforge/i18n';
import { APP_NAME } from '@roboforge/config';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  completedCount: number;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, completedCount }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-sky-900/30 via-slate-900/40 to-slate-900/20 border border-sky-500/20">
        <div className="max-w-2xl space-y-4">
          <Badge variant="primary">v0.1.0 Offline Core</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            {APP_NAME}: {t('home.title')}
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">{t('home.subtitle')}</p>
          <div className="flex gap-4 pt-2">
            <Button variant="primary" size="lg" onClick={() => onNavigate('learn')}>
              🚀 {t('home.startFoundations')}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => onNavigate('tools')}>
              ⚡ Electronics Calculators
            </Button>
          </div>
        </div>
      </div>

      <Callout type="safety" title="Safe Lab Habits">
        {t('safety.lowVoltageRule')} Never test or experiment with mains wall sockets.
      </Callout>

      {/* Progress & Quick Jump */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="surface" className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Current Curriculum
            </span>
            <h2 className="text-xl font-bold mt-2">Electronics & Embedded Foundations</h2>
            <p className="text-sm text-text-muted mt-2">
              From electric charges and circuits to programming Arduino and driving your first
              robot.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between">
            <span className="text-sm font-medium">30 Lessons</span>
            <Button size="sm" variant="outline" onClick={() => onNavigate('learn')}>
              Open Track →
            </Button>
          </div>
        </Card>

        <Card variant="surface" className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {t('home.quickStats')}
            </span>
            <div className="text-4xl font-extrabold mt-3 text-sky-400">
              {completedCount} <span className="text-lg font-normal text-text-muted">/ 30</span>
            </div>
            <p className="text-sm text-text-muted mt-2">
              {completedCount === 0
                ? 'No lessons completed yet. Ready to start lesson 1?'
                : `${completedCount} lesson(s) mastered so far!`}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border-subtle">
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-sky-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (completedCount / 30) * 100)}%` }}
              />
            </div>
          </div>
        </Card>

        <Card variant="surface" className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Privacy & Offline Guarantee
            </span>
            <h2 className="text-xl font-bold mt-2">100% Local-First</h2>
            <p className="text-sm text-text-muted mt-2">
              Zero telemetry, zero required cloud servers. Your progress and notes stay strictly on
              your laptop.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between">
            <Badge variant="success">Offline Active</Badge>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('settings')}>
              Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
