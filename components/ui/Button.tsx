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
    'text-white font-semibold',
    'bg-[linear-gradient(135deg,#6C5CE7_0%,#8B6CF6_50%,#A78BFA_100%)]',
    'border border-white/10',
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_24px_-8px_rgba(108,92,231,0.7)]',
    'hover:brightness-110 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_32px_-6px_rgba(108,92,231,0.85)]',
    'active:translate-y-px active:brightness-95',
    'disabled:opacity-50 disabled:shadow-none disabled:hover:brightness-100',
  ].join(' '),
  secondary: [
    'bg-white/[0.04] text-[var(--color-text-primary)] font-medium',
    'border border-white/[0.14]',
    'hover:border-[var(--accent-border)] hover:bg-[rgba(108,92,231,0.08)]',
    'active:translate-y-px',
    'disabled:opacity-40',
  ].join(' '),
  ghost: [
    'bg-transparent text-[var(--color-text-secondary)] font-medium',
    'border border-transparent',
    'hover:bg-white/[0.05] hover:text-[var(--color-text-primary)]',
    'disabled:opacity-40',
  ].join(' '),
  danger: [
    'bg-[#F87171]/10 text-[#F87171] font-medium',
    'border border-[#F87171]/25',
    'hover:bg-[#F87171]/20 hover:border-[#F87171]/45',
    'active:translate-y-px',
    'disabled:opacity-40',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-[8px] gap-1.5',
  md: 'h-10 px-5 text-[14px] rounded-[10px] gap-2',
  lg: 'h-12 px-6 text-[15px] rounded-[12px] gap-2.5',
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
          'tracking-[-0.005em]',
          'transition-all duration-150 ease-out',
          'cursor-pointer select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D17]',
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
