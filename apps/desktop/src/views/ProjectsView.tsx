import React, { useState, useMemo } from 'react';
import { Card, Badge, Callout } from '@roboforge/ui';
import type { Project, Kit } from '@roboforge/content-schema';
import bundleData from '../content-bundle.json';

interface ContentBundleWithProjectsAndKits {
  projects?: Record<string, Project>;
  kits?: Record<string, Kit>;
}

const typedBundle = bundleData as unknown as ContentBundleWithProjectsAndKits;
const ALL_PROJECTS: Project[] = Object.values(typedBundle.projects || {});
const ALL_KITS: Kit[] = Object.values(typedBundle.kits || {});

interface ProjectsViewProps {
  onNavigate?: (tab: string) => void;
  /** Called when every build step of a project has been checked off. */
  onProjectComplete?: (projectId: string) => void;
}

type MainTab = 'projects' | 'kits';
type ProjectSubTab = 'overview' | 'wiring' | 'steps' | 'code' | 'troubleshooting' | 'bom';

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onNavigate, onProjectComplete }) => {
  const [mainTab, setMainTab] = useState<MainTab>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectSubTab, setProjectSubTab] = useState<ProjectSubTab>('overview');
  const [kitFilter, setKitFilter] = useState<'all' | 'starter' | 'builder'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected kit for Kits & BOM tab
  const [selectedKitTier, setSelectedKitTier] = useState<'starter' | 'builder'>('starter');

  // Owned parts tracking for the interactive inventory checklist
  const [ownedParts, setOwnedParts] = useState<Record<string, boolean>>({});

  // Completed steps tracking per project
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Copy toast indicator
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const showCopyFeedback = (msg: string) => {
    setCopyFeedback(msg);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return ALL_PROJECTS.filter(p => {
      const matchesKit = kitFilter === 'all' || p.kit === kitFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.skills.some(s => s.toLowerCase().includes(q));
      return matchesKit && matchesSearch;
    });
  }, [kitFilter, searchQuery]);

  const activeProject = useMemo(() => {
    return ALL_PROJECTS.find(p => p.id === selectedProjectId) || null;
  }, [selectedProjectId]);

  const activeKit = useMemo(() => {
    return ALL_KITS.find(k => k.tier === selectedKitTier) || ALL_KITS[0] || null;
  }, [selectedKitTier]);

  // Inventory stats for active kit
  const kitStats = useMemo(() => {
    if (!activeKit) return { total: 0, owned: 0, remainingCostMin: 0, remainingCostMax: 0 };
    let ownedCount = 0;
    let costMin = 0;
    let costMax = 0;

    activeKit.items.forEach((item, index) => {
      const key = `${activeKit.id}-${index}`;
      if (ownedParts[key]) {
        ownedCount++;
      } else {
        costMin += item.costUSD?.min || 0;
        costMax += item.costUSD?.max || 0;
      }
    });

    return {
      total: activeKit.items.length,
      owned: ownedCount,
      remainingCostMin: Math.round(costMin * 100) / 100,
      remainingCostMax: Math.round(costMax * 100) / 100,
    };
  }, [activeKit, ownedParts]);

  const togglePartOwned = (key: string) => {
    setOwnedParts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleStepCompleted = (stepKey: string) => {
    const next = { ...completedSteps, [stepKey]: !completedSteps[stepKey] };
    setCompletedSteps(next);
    if (activeProject && next[stepKey]) {
      const allDone = activeProject.steps.every(s => next[`${activeProject.id}-step-${s.step}`]);
      if (allDone) onProjectComplete?.(activeProject.id);
    }
  };

  // Export BOM to CSV
  const handleExportCSV = (kit: Kit) => {
    const headers = [
      'Part Name',
      'Quantity',
      'Specification',
      'Min Cost USD',
      'Max Cost USD',
      'Vendor Alternatives',
      'Notes',
    ];
    const rows = kit.items.map(i => [
      `"${i.name.replace(/"/g, '""')}"`,
      i.qty,
      `"${i.spec.replace(/"/g, '""')}"`,
      i.costUSD?.min ?? '',
      i.costUSD?.max ?? '',
      `"${i.alternatives.join('; ').replace(/"/g, '""')}"`,
      `"${(i.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${kit.id}-bom.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showCopyFeedback(`Exported ${kit.title} BOM as CSV!`);
  };

  // Export Printable Checklist
  const handleExportChecklist = (kit: Kit) => {
    const lines = [
      `=============================================================`,
      `  ${kit.title.toUpperCase()} — BUILD & PROCUREMENT CHECKLIST`,
      `  RoboForge Open Hardware Guide`,
      `=============================================================`,
      `Tier: ${kit.tier.toUpperCase()} | Est. Cost: $${kit.estimatedCostUSD.min} - $${kit.estimatedCostUSD.max} USD`,
      `Safety: ${kit.safetyRating}`,
      ``,
      `INVENTORY CHECKLIST:`,
      `-------------------------------------------------------------`,
    ];

    kit.items.forEach((item, idx) => {
      const key = `${kit.id}-${idx}`;
      const checked = ownedParts[key] ? '[X]' : '[ ]';
      lines.push(`${checked} ${item.qty}x ${item.name} (${item.spec})`);
      lines.push(
        `    Est: $${item.costUSD?.min || 0} - $${item.costUSD?.max || 0} | Alt: ${item.alternatives.join(', ')}`,
      );
      if (item.notes) lines.push(`    Note: ${item.notes}`);
      lines.push('');
    });

    lines.push(`-------------------------------------------------------------`);
    lines.push(`SAFETY DIRECTIVE:`);
    lines.push(`* School path robotics is strictly low-voltage DC <= 12V, <= 2A.`);
    lines.push(`* Disconnect power before modifying wiring.`);
    lines.push(`* Never bypass current limiting resistors.`);
    lines.push(`=============================================================`);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${kit.id}-printable-checklist.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showCopyFeedback(`Exported ${kit.title} Printable Checklist!`);
  };

  // Copy code to clipboard
  const handleCopyCode = (source: string) => {
    navigator.clipboard.writeText(source).then(() => {
      showCopyFeedback('Arduino code copied to clipboard!');
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Banner & Main Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚀</span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Projects & Starter Kits
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
            Hands-on physical hardware builds. From single-LED timing to autonomous line-following
            cars and 2-DOF robotic arms, featuring vendor-neutral BOMs and offline schematics.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-xl border border-border shrink-0">
          <button
            onClick={() => {
              setMainTab('projects');
              setSelectedProjectId(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mainTab === 'projects'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🚀 Guided Projects ({ALL_PROJECTS.length})
          </button>
          <button
            onClick={() => setMainTab('kits')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mainTab === 'kits'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📦 Official Kits & BOM ({ALL_KITS.length})
          </button>
        </div>
      </div>

      {copyFeedback && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl border border-emerald-400 font-medium text-sm flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* MAIN TAB 1: GUIDED HARDWARE PROJECTS                         */}
      {/* ============================================================ */}
      {mainTab === 'projects' && (
        <>
          {/* Detailed Project View */}
          {activeProject ? (
            <div className="space-y-6">
              {/* Breadcrumb / Back button */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20"
                >
                  ← Back to All Projects
                </button>

                <div className="flex items-center gap-2">
                  {/* Simulate First Button */}
                  <button
                    onClick={() => onNavigate?.('simulate')}
                    className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                  >
                    <span>⚡</span>
                    <span>Simulate First ({activeProject.simulatedTwin})</span>
                  </button>
                </div>
              </div>

              {/* Project Hero Header */}
              <Card className="p-6 md:p-8 bg-gradient-to-br from-card to-card/60 border-border/80 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="uppercase tracking-wider text-xs">
                        {activeProject.kit} kit
                      </Badge>
                      <span className="text-amber-400 text-sm font-medium">
                        {'★'.repeat(activeProject.difficulty)}
                        {'☆'.repeat(5 - activeProject.difficulty)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Level {activeProject.difficulty}/5
                      </span>
                      <span className="text-muted-foreground text-xs">•</span>
                      <span className="text-muted-foreground text-xs">
                        ⏱️ {activeProject.minutes} mins
                      </span>
                      <span className="text-muted-foreground text-xs">•</span>
                      <span className="text-muted-foreground text-xs">
                        💵 ${activeProject.costUSD.min} - ${activeProject.costUSD.max} USD
                      </span>
                    </div>

                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                      {activeProject.title}
                    </h2>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {activeProject.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {activeProject.skills.map(skill => (
                        <span
                          key={skill}
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border"
                        >
                          #{skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hardware Verification Pending Banner */}
                {activeProject.needsHumanVerification && (
                  <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold text-amber-300">
                      <span>⚠️</span>
                      <span>
                        Needs Human Hardware Verification (Physical Kit Verification Pending)
                      </span>
                    </div>
                    <p className="text-amber-200/80">
                      As mandated by PRD §14, real-world hardware projects must be physical-tested
                      on reference starter kits before final hardware certification.
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 pt-1 text-amber-100/70">
                      {activeProject.verifyChecklist.map((check, i) => (
                        <li key={i}>{check}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>

              {/* Sub-tab navigation */}
              <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
                {[
                  { id: 'overview', label: '📖 Overview & Safety' },
                  { id: 'wiring', label: '🔌 Wiring Guide' },
                  { id: 'steps', label: '🛠️ Build Steps' },
                  { id: 'code', label: '💻 Arduino Code' },
                  { id: 'troubleshooting', label: '🔍 Test & Troubleshooting' },
                  { id: 'bom', label: '📋 Parts & BOM' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setProjectSubTab(tab.id as ProjectSubTab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      projectSubTab === tab.id
                        ? 'bg-secondary text-secondary-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sub-tab: OVERVIEW & SAFETY */}
              {projectSubTab === 'overview' && (
                <div className="space-y-6">
                  {/* Safety Callout */}
                  <Callout type="safety" title="Laboratory Electrical Safety Directives">
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-amber-300">
                        School-Path Voltage & Current Envelope: Strict limit of ≤ 12V DC and ≤ 2A.
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-xs text-amber-200/90">
                        {activeProject.safetyRules.map((rule, idx) => (
                          <li key={idx}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  </Callout>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <span>🎯</span> Project Objectives & Learning Outcomes
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Completing this project bridges virtual simulation with physical reality.
                        You will practice reading schematics, placing components on breadboards,
                        preventing common grounding loops, and writing non-blocking microcontroller
                        firmware.
                      </p>
                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-semibold text-foreground uppercase tracking-wider">
                          Key Competencies Tested:
                        </div>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <span className="text-primary">✓</span> Breadboard mechanical retention
                            and bus rail layout
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-primary">✓</span> Circuit protection and
                            current-limiting calculations
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-primary">✓</span> Signal flow and microcontroller
                            GPIO timing
                          </li>
                        </ul>
                      </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <span>💡</span> Challenge Extensions
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Finished early? Take your project beyond the baseline instructions:
                      </p>
                      <ul className="space-y-2 text-xs text-muted-foreground">
                        {activeProject.extensions?.map((ext, idx) => (
                          <li
                            key={idx}
                            className="p-2.5 rounded-lg bg-muted/40 border border-border flex items-start gap-2"
                          >
                            <span className="text-amber-400 font-bold">#{idx + 1}</span>
                            <span>{ext}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </div>
              )}

              {/* Sub-tab: WIRING GUIDE */}
              {projectSubTab === 'wiring' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        Pinout & Interconnection Table
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Connect each lead precisely as specified before connecting power.
                      </p>
                    </div>
                  </div>

                  <Card className="p-0 overflow-hidden border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/80 text-muted-foreground uppercase text-xs border-b border-border">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Origin (From)</th>
                            <th className="px-4 py-3 font-semibold">Destination (To)</th>
                            <th className="px-4 py-3 font-semibold">Wire Color</th>
                            <th className="px-4 py-3 font-semibold">Engineering Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {activeProject.wiring.map((w, idx) => (
                            <tr key={idx} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                                {w.from}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                                {w.to}
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted border border-border">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                                    style={{
                                      backgroundColor:
                                        w.color?.toLowerCase() === 'red'
                                          ? '#ef4444'
                                          : w.color?.toLowerCase() === 'black'
                                            ? '#1e293b'
                                            : w.color?.toLowerCase() === 'yellow'
                                              ? '#eab308'
                                              : w.color?.toLowerCase() === 'green'
                                                ? '#22c55e'
                                                : w.color?.toLowerCase() === 'blue'
                                                  ? '#3b82f6'
                                                  : w.color?.toLowerCase() === 'orange'
                                                    ? '#f97316'
                                                    : '#a855f7',
                                    }}
                                  />
                                  <span>{w.color || 'Standard'}</span>
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">
                                {w.note || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* Sub-tab: STEPS */}
              {projectSubTab === 'steps' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        Step-by-Step Mechanical & Electrical Assembly
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Check off each step as you complete it in your workshop.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeProject.steps.map(s => {
                      const stepKey = `${activeProject.id}-step-${s.step}`;
                      const isDone = !!completedSteps[stepKey];
                      return (
                        <div
                          key={s.step}
                          className={`p-5 rounded-xl border transition-all ${
                            isDone
                              ? 'bg-emerald-950/20 border-emerald-700/50 shadow-sm'
                              : 'bg-card border-border hover:border-primary/40'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="pt-0.5">
                              <input
                                type="checkbox"
                                id={stepKey}
                                checked={isDone}
                                onChange={() => toggleStepCompleted(stepKey)}
                                className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                  Step {s.step}
                                </span>
                                <label
                                  htmlFor={stepKey}
                                  className={`text-base font-semibold cursor-pointer ${
                                    isDone
                                      ? 'line-through text-muted-foreground'
                                      : 'text-foreground'
                                  }`}
                                >
                                  {s.title}
                                </label>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {s.description}
                              </p>
                              {s.check && (
                                <div className="mt-2 p-2.5 rounded-lg bg-muted/60 border border-border text-xs flex items-center gap-2 text-foreground font-medium">
                                  <span className="text-primary font-bold">🔍 Check:</span>
                                  <span>{s.check}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-tab: ARDUINO CODE */}
              {projectSubTab === 'code' && (
                <div className="space-y-6">
                  {activeProject.code ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            Verified Arduino Firmware (C++)
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Copy this verified sketch to your local Arduino IDE or run directly in
                            the RoboForge simulator.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyCode(activeProject.code?.source || '')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                          >
                            📋 Copy Code
                          </button>
                          <button
                            onClick={() => onNavigate?.('simulate')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-all"
                          >
                            ▶️ Run in Simulator
                          </button>
                        </div>
                      </div>

                      <Card className="p-0 overflow-hidden border-border bg-slate-950 font-mono text-xs">
                        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-400 flex items-center justify-between">
                          <span>{activeProject.id}.ino</span>
                          <span className="text-[10px] text-slate-500 uppercase">
                            C++ / Arduino Uno
                          </span>
                        </div>
                        <pre className="p-5 text-slate-200 overflow-x-auto leading-relaxed whitespace-pre font-mono">
                          <code>{activeProject.code.source}</code>
                        </pre>
                      </Card>

                      {activeProject.code.explanation && (
                        <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
                          <span className="font-semibold text-foreground">💡 How It Works:</span>
                          <p>{activeProject.code.explanation}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      This project does not require code.
                    </p>
                  )}
                </div>
              )}

              {/* Sub-tab: TROUBLESHOOTING */}
              {projectSubTab === 'troubleshooting' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Validation Checklist & Troubleshooting Matrix
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Follow systematic diagnostic steps before asking for help.
                    </p>
                  </div>

                  {/* Operational verification checklist */}
                  <Card className="p-6 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span>✅</span> Operational Acceptance Checklist
                    </h4>
                    <div className="space-y-2">
                      {activeProject.testChecklist.map((item, idx) => (
                        <label
                          key={idx}
                          className="flex items-center gap-3 text-xs text-foreground cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-border text-primary"
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </Card>

                  {/* Troubleshooting Matrix */}
                  <Card className="p-0 overflow-hidden border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/80 text-muted-foreground uppercase text-xs border-b border-border">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Symptom</th>
                            <th className="px-4 py-3 font-semibold">Physical Root Cause</th>
                            <th className="px-4 py-3 font-semibold">Remedy / Corrective Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {activeProject.troubleshooting.map((t, idx) => (
                            <tr key={idx} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 text-xs font-semibold text-red-400">
                                {t.symptom}
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">{t.cause}</td>
                              <td className="px-4 py-3 text-xs text-emerald-400 font-medium">
                                {t.remedy}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* Sub-tab: BOM */}
              {projectSubTab === 'bom' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        Project Bill of Materials (BOM)
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        All parts required to build this specific project.
                      </p>
                    </div>
                  </div>

                  <Card className="p-0 overflow-hidden border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/80 text-muted-foreground uppercase text-xs border-b border-border">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Part Name</th>
                            <th className="px-4 py-3 font-semibold">Qty</th>
                            <th className="px-4 py-3 font-semibold">Electrical Spec</th>
                            <th className="px-4 py-3 font-semibold">Est. Cost</th>
                            <th className="px-4 py-3 font-semibold">Vendor-Neutral Alternatives</th>
                            <th className="px-4 py-3 font-semibold">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {activeProject.bom.map((b, idx) => (
                            <tr key={idx} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 font-semibold text-foreground text-xs">
                                {b.name}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs">{b.qty}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">{b.spec}</td>
                              <td className="px-4 py-3 text-xs font-mono text-foreground">
                                {b.costUSD ? `$${b.costUSD.min} - $${b.costUSD.max}` : '—'}
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">
                                {b.alternatives.join(', ')}
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">
                                {b.notes || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            /* Project Grid Selector View */
            <div className="space-y-6">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {(['all', 'starter', 'builder'] as const).map(tier => (
                    <button
                      key={tier}
                      onClick={() => setKitFilter(tier)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                        kitFilter === tier
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {tier === 'all' ? 'All Kits' : `${tier} Kit`}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search projects by skill or title..."
                    className="w-full px-3.5 py-1.5 text-xs rounded-xl bg-card border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(proj => (
                  <Card
                    key={proj.id}
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setProjectSubTab('overview');
                    }}
                    className="p-6 flex flex-col justify-between hover:border-primary/60 hover:shadow-md transition-all cursor-pointer group bg-gradient-to-b from-card to-card/70"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
                          {proj.kit} kit
                        </Badge>
                        <div className="flex items-center text-amber-400 text-xs">
                          {'★'.repeat(proj.difficulty)}
                          {'☆'.repeat(5 - proj.difficulty)}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {proj.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.skills.slice(0, 3).map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-5 border-t border-border/60 mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>⏱️ {proj.minutes}m</span>
                        <span>•</span>
                        <span>
                          💵 ${proj.costUSD.min}-${proj.costUSD.max}
                        </span>
                      </div>
                      <span className="text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
                        Open Guide →
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* MAIN TAB 2: OFFICIAL KITS & BOM (FR-PRJ-03 & FR-PRJ-04)       */}
      {/* ============================================================ */}
      {mainTab === 'kits' && activeKit && (
        <div className="space-y-6">
          {/* Kit selector tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-xl border border-border">
              {ALL_KITS.map(k => (
                <button
                  key={k.id}
                  onClick={() => setSelectedKitTier(k.tier as 'starter' | 'builder')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    selectedKitTier === k.tier
                      ? 'bg-secondary text-secondary-foreground shadow-sm font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {k.title} (${k.estimatedCostUSD.min} - ${k.estimatedCostUSD.max})
                </button>
              ))}
            </div>

            {/* Offline Export Actions (FR-PRJ-04) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCSV(activeKit)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-card border border-border hover:bg-muted text-foreground flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>📥</span>
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleExportChecklist(activeKit)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>📄</span>
                <span>Printable Checklist</span>
              </button>
            </div>
          </div>

          {/* Kit Overview Hero Card */}
          <Card className="p-6 md:p-8 bg-gradient-to-br from-card to-card/50 border-border space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="uppercase tracking-wider text-xs">
                    {activeKit.tier} tier
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Target: {activeKit.targetAudience}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{activeKit.title}</h2>
                <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                  {activeKit.description}
                </p>
              </div>

              {/* Price Tag */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center shrink-0">
                <div className="text-xs font-medium text-primary">Estimated Kit Cost</div>
                <div className="text-2xl font-extrabold text-foreground mt-0.5">
                  ${activeKit.estimatedCostUSD.min} - ${activeKit.estimatedCostUSD.max}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">Vendor-neutral total</div>
              </div>
            </div>

            {/* Safety Compliance Line */}
            <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span>🛡️</span>
              <span>Safety Compliance: {activeKit.safetyRating}</span>
            </div>
          </Card>

          {/* Interactive Inventory Status Gauge */}
          <Card className="p-5 border-border bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>🎒</span> Workshop Inventory Checklist
                </h4>
                <p className="text-xs text-muted-foreground">
                  Check off items you already own to calculate remaining purchase cost.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Owned: </span>
                  <span className="font-bold text-foreground">
                    {kitStats.owned} / {kitStats.total}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Remaining to Buy: </span>
                  <span className="font-bold text-emerald-400">
                    ${kitStats.remainingCostMin} - ${kitStats.remainingCostMax} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden mt-3">
              <div
                className="bg-primary h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${kitStats.total > 0 ? (kitStats.owned / kitStats.total) * 100 : 0}%`,
                }}
              />
            </div>
          </Card>

          {/* Full Interactive Kit Table */}
          <Card className="p-0 overflow-hidden border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/80 text-muted-foreground uppercase text-xs border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-center w-12">Have?</th>
                    <th className="px-4 py-3 font-semibold">Part Name</th>
                    <th className="px-4 py-3 font-semibold">Qty</th>
                    <th className="px-4 py-3 font-semibold">Specification</th>
                    <th className="px-4 py-3 font-semibold">Est. Cost (USD)</th>
                    <th className="px-4 py-3 font-semibold">Vendor-Neutral Alternatives</th>
                    <th className="px-4 py-3 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {activeKit.items.map((item, idx) => {
                    const itemKey = `${activeKit.id}-${idx}`;
                    const isOwned = !!ownedParts[itemKey];
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isOwned ? 'bg-emerald-950/15' : 'hover:bg-muted/30'
                        }`}
                      >
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isOwned}
                            onChange={() => togglePartOwned(itemKey)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground text-xs">
                          <span className={isOwned ? 'line-through text-muted-foreground' : ''}>
                            {item.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{item.qty}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{item.spec}</td>
                        <td className="px-4 py-3 text-xs font-mono text-foreground">
                          {item.costUSD ? `$${item.costUSD.min} - $${item.costUSD.max}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {item.alternatives.join(', ')}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {item.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Sourcing Transparency Note */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
            <span className="font-semibold text-foreground">🤝 Vendor-Neutral Open Sourcing:</span>
            <p>
              RoboForge is completely free and open source. We do not use proprietary hardware locks
              or paid affiliate links. You can source parts from SparkFun, Adafruit, AliExpress,
              DigiKey, Mouser, Amazon, or your local hobby electronics store.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
