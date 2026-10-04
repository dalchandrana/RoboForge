import React, { useState } from 'react';
import { Modal, Button } from '@roboforge/ui';
import type { SettingsRecord } from '@roboforge/storage';

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: (settings: Partial<SettingsRecord>) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [nickname, setNickname] = useState('Cadet Spark');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [aiOffMode, setAiOffMode] = useState(false);

  const handleFinish = () => {
    onComplete({
      onboardingCompleted: true,
      learnerNickname: nickname,
      learnerLevel: level,
      theme,
      aiOffMode,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Welcome to RoboForge 🤖">
      <div className="space-y-6 text-sm text-text-main font-sans">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
            Setup Step {step} of 4
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(s => (
              <span
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step === s ? 'bg-sky-400 scale-110' : step > s ? 'bg-emerald-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Welcome & Philosophy */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-center gap-4">
              <span className="text-4xl" role="img" aria-label="Sparking robot">
                🤖⚡
              </span>
              <div>
                <h3 className="font-bold text-base text-sky-300">
                  Your Free, Offline Robotics Laboratory
                </h3>
                <p className="text-xs text-sky-200/80 mt-1 leading-relaxed">
                  RoboForge teaches physical computing and robotics from first principles — without
                  accounts, cloud dependencies, or tracking.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-text-muted leading-relaxed">
              <div className="flex items-center gap-2 text-text-main font-semibold">
                <span className="text-emerald-400">✓</span> 100% Offline-First: All simulators and
                data stay strictly on your computer.
              </div>
              <div className="flex items-center gap-2 text-text-main font-semibold">
                <span className="text-emerald-400">✓</span> Interactive Twin: Breadboard and
                schematic simulators with real-time MNA physics.
              </div>
              <div className="flex items-center gap-2 text-text-main font-semibold">
                <span className="text-emerald-400">✓</span> Private AI Coach: Local Socratic
                mentorship powered by localhost Ollama.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={() => setStep(2)}>
                Next: Choose Call Sign →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Call Sign & Experience Level */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="learner-callsign"
                className="block text-xs font-bold text-text-muted uppercase mb-1.5"
              >
                Robotics Call Sign / Nickname:
              </label>
              <input
                id="learner-callsign"
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="e.g. Cadet Spark"
                className="w-full bg-surface-subtle border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm text-text-main focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <span className="text-[11px] text-text-muted mt-1 block">
                Stored only in local SQLite on this device.
              </span>
            </div>

            <div>
              <div className="block text-xs font-bold text-text-muted uppercase mb-1.5">
                Starting Experience Level:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'beginner', title: 'Explorer', desc: 'Ages 12-18 / New to electronics' },
                  { id: 'intermediate', title: 'Builder', desc: 'Knows basics / Coding' },
                  { id: 'advanced', title: 'Engineer', desc: 'College / Prototyping' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLevel(opt.id as typeof level)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      level === opt.id
                        ? 'bg-sky-500/10 border-sky-500 text-sky-300 ring-1 ring-sky-500'
                        : 'bg-surface-subtle border-border-subtle text-text-muted hover:text-text-main'
                    }`}
                  >
                    <div className="font-bold text-sm text-text-main">{opt.title}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="secondary" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button variant="primary" onClick={() => setStep(3)}>
                Next: Theme Preference →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Theme Preference */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <div className="block text-xs font-bold text-text-muted uppercase mb-2">
                Choose Visual Theme:
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dark', label: '🌙 Dark Mode', desc: 'High-contrast neon workspace' },
                  { id: 'light', label: '☀️ Light Mode', desc: 'Clean bright classroom theme' },
                  { id: 'system', label: '🖥️ System Default', desc: 'Matches your OS theme' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id as typeof theme)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      theme === opt.id
                        ? 'bg-sky-500/10 border-sky-500 text-sky-300 ring-1 ring-sky-500'
                        : 'bg-surface-subtle border-border-subtle text-text-muted hover:text-text-main'
                    }`}
                  >
                    <div className="font-bold text-sm text-text-main">{opt.label}</div>
                    <div className="text-[11px] opacity-80 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="secondary" onClick={() => setStep(2)}>
                ← Back
              </Button>
              <Button variant="primary" onClick={() => setStep(4)}>
                Next: AI Coach Setup →
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: AI Coach Mode */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <div className="block text-xs font-bold text-text-muted uppercase mb-2">
                Socratic AI Coach Configuration:
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setAiOffMode(false)}
                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    !aiOffMode
                      ? 'bg-sky-500/10 border-sky-500 text-sky-300 ring-1 ring-sky-500'
                      : 'bg-surface-subtle border-border-subtle text-text-muted hover:text-text-main'
                  }`}
                >
                  <span className="text-2xl">🤖</span>
                  <div>
                    <div className="font-bold text-sm text-text-main">
                      Local AI Enabled (Recommended)
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">
                      Connects strictly to your local Ollama instance on localhost:11434. Generates
                      dynamic Socratic hints without sending a single byte over the Internet.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAiOffMode(true)}
                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    aiOffMode
                      ? 'bg-sky-500/10 border-sky-500 text-sky-300 ring-1 ring-sky-500'
                      : 'bg-surface-subtle border-border-subtle text-text-muted hover:text-text-main'
                  }`}
                >
                  <span className="text-2xl">📖</span>
                  <div>
                    <div className="font-bold text-sm text-text-main">
                      AI-Off Mode (Authored Hints Only)
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">
                      100% human-authored hint ladders. No LLM or Ollama required. Perfect for
                      low-spec machines or offline exams.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="secondary" onClick={() => setStep(3)}>
                ← Back
              </Button>
              <Button variant="primary" onClick={handleFinish}>
                Launch RoboForge 🚀
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
