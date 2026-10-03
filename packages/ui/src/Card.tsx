import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'elevated' | 'subtle';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'surface',
  interactive = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-xl border p-5 transition-all',
        variant === 'surface' &&
          'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-main)]',
        variant === 'elevated' &&
          'bg-[var(--bg-surface-elevated)] border-[var(--border-strong)] shadow-md text-[var(--text-main)]',
        variant === 'subtle' &&
          'bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] text-[var(--text-main)]',
        interactive &&
          'cursor-pointer hover:border-[var(--brand-primary)] hover:shadow-lg focus-within:ring-2 focus-within:ring-[var(--brand-primary)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
