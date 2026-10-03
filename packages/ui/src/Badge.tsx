import React from 'react';
import clsx from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'secondary', className }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variant === 'primary' && 'bg-[var(--brand-primary)] text-[var(--brand-primary-fg)]',
        variant === 'secondary' &&
          'bg-[var(--bg-surface-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]',
        variant === 'success' &&
          'bg-[var(--status-tip-bg)] text-[var(--status-tip-text)] border border-[var(--status-tip-border)]',
        variant === 'warning' &&
          'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border border-[var(--status-warning-border)]',
        variant === 'danger' &&
          'bg-[var(--status-safety-bg)] text-[var(--status-safety-text)] border border-[var(--status-safety-border)]',
        className,
      )}
    >
      {children}
    </span>
  );
};
