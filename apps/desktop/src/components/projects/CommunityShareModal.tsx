import React, { useState } from 'react';
import type { ProjectLog } from '@roboforge/storage';

interface CommunityShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: ProjectLog;
  learnerNickname?: string;
  projectName?: string;
}

export const CommunityShareModal: React.FC<CommunityShareModalProps> = ({
  isOpen,
  onClose,
  log,
  learnerNickname = 'Cadet Spark',
  projectName = 'Hardware Project',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate standardized GitHub PR / Discussion template (FR-PRJ-06)
  const templateMarkdown = `### 🚀 RoboForge Maker Showcase Submission

- **Project:** ${projectName} (\`${log.projectId}\`)
- **Maker Call Sign:** \`${learnerNickname}\`
- **Build Date:** ${new Date(log.createdAt).toLocaleDateString()}
- **Build Title:** ${log.title}

#### 🛠️ Hardware Setup & Modifications
${log.notes || '_No special modifications reported._'}

#### 🔬 Testing Observations & Calibration Results
${log.observations || '_Built according to standard schematic._'}

${log.photoUrl ? `#### 📸 Build Photo\n![](${log.photoUrl})\n` : ''}
---
_Generated offline with [RoboForge Desktop](https://github.com/rudrarana/Roboforge)_
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(templateMarkdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-surface border border-border-subtle rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌐</span>
            <h2 className="text-lg font-bold text-text-main">
              Submit to Community Gallery (FR-PRJ-06)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-main text-lg font-bold p-1 rounded-lg"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-text-muted">
          RoboForge has zero analytics and zero cloud servers. To showcase your hardware project in
          the community gallery, copy the generated Markdown template below and submit it directly
          to GitHub Discussions!
        </p>

        <div className="space-y-1.5">
          <label htmlFor="markdown-template" className="text-xs font-bold text-text-muted">
            Formatted Pull Request / Discussion Template:
          </label>
          <textarea
            id="markdown-template"
            readOnly
            value={templateMarkdown}
            rows={10}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <a
            href="https://github.com/rudrarana/Roboforge/discussions/new?category=show-and-tell"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 underline underline-offset-4"
          >
            <span>↗ Open GitHub Discussions</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <span>{copied ? '✓ Copied to Clipboard!' : '📋 Copy Markdown Template'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-text-main rounded-xl text-xs font-bold transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
