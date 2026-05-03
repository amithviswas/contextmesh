'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-[var(--color-accent-primary)] text-[#0A0A0F] font-medium',
    'hover:brightness-110',
    'active:brightness-95',
    'shadow-[0_0_0_0_var(--color-accent-glow)]',
    'hover:shadow-[0_0_20px_4px_var(--color-accent-glow)]',
    'disabled:bg-[var(--color-bg-elevated)] disabled:text-[var(--color-text-tertiary)] disabled:shadow-none',
  ].join(' '),
  secondary: [
    'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] font-medium',
    'border border-[var(--color-bg-border)]',
    'hover:border-[var(--color-accent-primary)]/40 hover:bg-[var(--color-bg-elevated)]',
    'disabled:opacity-40',
  ].join(' '),
  ghost: [
    'bg-transparent text-[var(--color-text-secondary)]',
    'hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-text-primary)]',
    'disabled:opacity-40',
  ].join(' '),
  danger: [
    'bg-[var(--color-error)]/10 text-[var(--color-error)] font-medium',
    'border border-[var(--color-error)]/20',
    'hover:bg-[var(--color-error)]/20 hover:border-[var(--color-error)]/40',
    'disabled:opacity-40',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-[6px] gap-1.5',
  md: 'h-10 px-5 text-[15px] rounded-[8px] gap-2',
  lg: 'h-12 px-6 text-[16px] rounded-[8px] gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center',
          'font-[var(--font-body)]',
          'transition-all duration-[150ms] ease-out',
          'cursor-pointer select-none',
          'focus-visible:outline-2 focus-visible:outline-[var(--color-accent-primary)] focus-visible:outline-offset-2',
          'disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="32"
                strokeDashoffset="12"
              />
            </svg>
            <span className="opacity-70">{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
