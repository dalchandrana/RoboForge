import React from 'react';
import clsx from 'clsx';

export type CalloutType = 'info' | 'tip' | 'warning' | 'safety';

export interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const ICONS: Record<CalloutType, string> = {
  info: 'ℹ️',
  tip: '💡',
  warning: '⚠️',
  safety: '🛡️',
};

const LABELS: Record<CalloutType, string> = {
  info: 'Information',
  tip: 'Pro Tip',
  warning: 'Warning',
  safety: 'Safety First',
};

export const Callout: React.FC<CalloutProps> = ({ type = 'info', title, children, className }) => {
  const displayTitle = title || LABELS[type];

  return (
    <aside
      role={type === 'safety' || type === 'warning' ? 'alert' : 'note'}
      aria-label={displayTitle}
      className={clsx(
        'my-4 p-4 rounded-xl border-l-4 transition-colors',
        type === 'info' &&
          'bg-[var(--status-info-bg)] border-l-[var(--brand-primary)] text-[var(--status-info-text)]',
        type === 'tip' &&
          'bg-[var(--status-tip-bg)] border-l-[var(--status-tip-border)] text-[var(--status-tip-text)]',
        type === 'warning' &&
          'bg-[var(--status-warning-bg)] border-l-[var(--status-warning-border)] text-[var(--status-warning-text)]',
        type === 'safety' &&
          'bg-[var(--status-safety-bg)] border-l-[var(--status-safety-text)] text-[var(--status-safety-text)] ring-1 ring-[var(--status-safety-border)]',
        className,
      )}
    >
      <div className="flex items-center gap-2 font-bold mb-1">
        <span aria-hidden="true">{ICONS[type]}</span>
        <span>{displayTitle}</span>
      </div>
      <div className="text-sm leading-relaxed text-[var(--text-main)]">{children}</div>
    </aside>
  );
};
