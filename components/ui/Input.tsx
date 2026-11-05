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
            'h-[42px] w-full px-3.5',
            'bg-white/[0.03]',
            'border border-white/[0.14]',
            'rounded-[10px]',
            'text-[15px] text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-tertiary)]',
            'outline-none',
            'transition-[border-color,box-shadow,background-color] duration-150',
            'hover:border-white/[0.22]',
            'focus:border-[#A78BFA] focus:bg-[rgba(108,92,231,0.06)]',
            'focus:ring-[3px] focus:ring-[#6C5CE7]/30',
            error && 'border-[#F87171]/70 focus:border-[#F87171] focus:ring-[#F87171]/20',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[12px] text-[#F87171] leading-snug">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-[12px] text-[var(--color-text-tertiary)] leading-snug">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
