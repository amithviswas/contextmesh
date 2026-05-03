'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-[var(--color-text-secondary)] leading-none"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full px-3',
            'bg-[var(--color-bg-elevated)]',
            'border border-[var(--color-bg-border)]',
            'rounded-[8px]',
            'text-[15px] text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-tertiary)]',
            'font-[var(--font-body)]',
            'outline-none',
            'transition-colors duration-[150ms]',
            'focus:border-[var(--color-accent-primary)]',
            'focus:ring-2 focus:ring-[var(--color-accent-primary)]/20',
            error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[12px] text-[var(--color-error)] leading-none">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-[12px] text-[var(--color-text-tertiary)] leading-none">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
