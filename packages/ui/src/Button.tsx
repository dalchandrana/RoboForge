import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        // Accessible target size >= 40px
        size === 'sm' && 'min-h-[40px] px-3 text-sm min-w-[40px]',
        size === 'md' && 'min-h-[44px] px-4 text-base min-w-[44px]',
        size === 'lg' && 'min-h-[48px] px-6 text-lg min-w-[48px]',
        // Variants
        variant === 'primary' &&
          'bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] hover:opacity-90 focus:ring-[var(--brand-primary)]',
        variant === 'secondary' &&
          'bg-[var(--bg-surface-subtle)] text-[var(--text-main)] hover:bg-[var(--border-subtle)] focus:ring-[var(--border-strong)]',
        variant === 'outline' &&
          'border border-[var(--border-strong)] text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)]',
        variant === 'ghost' && 'text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)]',
        variant === 'danger' && 'bg-[var(--status-safety-text)] text-white hover:opacity-90',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
