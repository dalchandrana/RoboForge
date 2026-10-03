import React from 'react';
import clsx from 'clsx';

export interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  onDismiss?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onDismiss, className }) => {
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={clsx(
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all',
        type === 'success' &&
          'bg-[var(--status-tip-bg)] text-[var(--status-tip-text)] border-[var(--status-tip-border)]',
        type === 'info' &&
          'bg-[var(--status-info-bg)] text-[var(--status-info-text)] border-[var(--status-info-border)]',
        type === 'warning' &&
          'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning-border)]',
        type === 'error' &&
          'bg-[var(--status-safety-bg)] text-[var(--status-safety-text)] border-[var(--status-safety-border)]',
        className,
      )}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-2 text-current opacity-70 hover:opacity-100 min-w-[32px] min-h-[32px] flex items-center justify-center rounded"
          aria-label="Dismiss toast"
        >
          ✕
        </button>
      )}
    </div>
  );
};
