import React, { useState } from 'react';
import type { ProjectLog } from '@roboforge/storage';
import type { Project } from '@roboforge/content-schema';

interface WorkshopBuildLogsProps {
  logs: ProjectLog[];
  projects: Project[];
  onSaveLog: (log: ProjectLog) => void;
  onDeleteLog: (id: string) => void;
  onShareLog: (log: ProjectLog) => void;
}

export const WorkshopBuildLogs: React.FC<WorkshopBuildLogsProps> = ({
  logs,
  projects,
  onSaveLog,
  onDeleteLog,
  onShareLog,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || 'p1-led-blink-lab',
  );
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [observations, setObservations] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newLog: ProjectLog = {
      id: `log-${Date.now()}`,
      projectId: selectedProjectId,
      title: title.trim(),
      notes: notes.trim(),
      observations: observations.trim(),
      photoUrl: photoUrl.trim() || undefined,
      createdAt: new Date().toISOString(),
      completed: true,
    };

    onSaveLog(newLog);
    setTitle('');
    setNotes('');
    setObservations('');
    setPhotoUrl('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-subtle p-5 rounded-2xl border border-border-subtle">
        <div>
          <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
            <span>🔨</span>
            <span>My Workshop Build Logs (FR-PRJ-05)</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Track your physical hardware progress, record real-world motor/sensor tuning notes, and
            export your builds to the community gallery. Stored 100% locally on your machine.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(prev => !prev)}
          id="btn-add-build-log"
          className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <span>{isAdding ? '✕ Cancel' : '+ New Build Entry'}</span>
        </button>
      </div>

      {/* Add New Build Log Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-sky-500/40 rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider">
              Document a Physical Hardware Build
            </h3>
            <span className="text-xs text-text-muted">Class III Low-Voltage (≤ 12V DC)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="log-project" className="text-xs font-bold text-text-muted block mb-1">
                Hardware Project
              </label>
              <select
                id="log-project"
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full bg-surface-subtle border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.kit.toUpperCase()} Kit)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="log-title" className="text-xs font-bold text-text-muted block mb-1">
                Build Entry Title
              </label>
              <input
                id="log-title"
                type="text"
                placeholder="e.g. Assembled TT chassis, tested TCRT5000 line sensors"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full bg-surface-subtle border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="log-notes" className="text-xs font-bold text-text-muted block mb-1">
                Wiring & Hardware Modifications
              </label>
              <textarea
                id="log-notes"
                rows={3}
                placeholder="Mention any part substitutions, battery pack used (e.g. 4xAA 6V), or custom wiring..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-surface-subtle border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label
                htmlFor="log-observations"
                className="text-xs font-bold text-text-muted block mb-1"
              >
                Testing Observations & Calibration Notes
              </label>
              <textarea
                id="log-observations"
                rows={3}
                placeholder="What happened when you turned it on? Speed tuning, sensor threshold results, or quirks..."
                value={observations}
                onChange={e => setObservations(e.target.value)}
                className="w-full bg-surface-subtle border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="log-photo" className="text-xs font-bold text-text-muted block mb-1">
              Local Photo File Path or Image URL (Optional)
            </label>
            <input
              id="log-photo"
              type="text"
              placeholder="e.g. file:///Users/.../robot_chassis.jpg or https://..."
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              className="w-full bg-surface-subtle border border-border-subtle rounded-xl p-2.5 text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-text-muted rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              💾 Save Build Entry
            </button>
          </div>
        </form>
      )}

      {/* List of Saved Logs */}
      {logs.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-border-subtle rounded-3xl space-y-3">
          <span className="text-4xl" role="img" aria-label="Toolbox">
            🧰
          </span>
          <h3 className="text-base font-bold text-text-main">No Build Logs Yet</h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Assemble one of our guided projects (like P1 LED Blink or P3 Line Follower) and record
            your hardware observations here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logs.map(log => {
            const project = projects.find(p => p.id === log.projectId);
            const dateStr = new Date(log.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={log.id}
                className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-3 hover:border-slate-600 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {project?.title || log.projectId}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">{dateStr}</span>
                  </div>

                  <h4 className="text-sm font-bold text-text-main">{log.title}</h4>

                  {log.notes && (
                    <div className="text-xs text-text-muted bg-surface-subtle p-2.5 rounded-xl border border-border-subtle">
                      <span className="font-bold text-slate-300 block mb-0.5">Wiring & Setup:</span>
                      {log.notes}
                    </div>
                  )}

                  {log.observations && (
                    <div className="text-xs text-text-muted bg-surface-subtle p-2.5 rounded-xl border border-border-subtle">
                      <span className="font-bold text-slate-300 block mb-0.5">
                        Test Observations:
                      </span>
                      {log.observations}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-subtle mt-2">
                  <button
                    type="button"
                    onClick={() => onShareLog(log)}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>🚀 Submit to Community (PR)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteLog(log.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 transition-colors p-1"
                    title="Delete build log"
                    aria-label={`Delete build log ${log.title}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
