import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className, ...props }: InputProps) {
  const inputId = React.useId();

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-text-base"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'block w-full rounded-lg border border-neutral-border-base px-3 py-2 text-sm placeholder:text-neutral-text-subtle focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-semantic-error focus:border-semantic-error focus:ring-semantic-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-semantic-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-neutral-text-muted">{helperText}</p>
      )}
    </div>
  );
}