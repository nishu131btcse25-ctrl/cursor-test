import React from 'react';
import { cn } from '@/lib/utils';
import { ButtonProps } from '@/types';

const buttonVariants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm focus:ring-primary-500',
  secondary: 'bg-white hover:bg-neutral-bg-alt text-neutral-text-base border border-neutral-border-base shadow-sm focus:ring-primary-500',
  ghost: 'hover:bg-neutral-bg-elevated text-neutral-text-base focus:ring-primary-500',
  destructive: 'bg-semantic-error hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
};

const buttonSizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
};

export interface ButtonPropsExtended extends ButtonProps {
  asChild?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  className,
  asChild = false,
  ...props
}: ButtonPropsExtended & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const buttonClasses = cn(
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    buttonVariants[variant],
    buttonSizes[size],
    loading && 'opacity-50 cursor-not-allowed',
    className
  );

  if (asChild) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      ...props,
      className: cn(buttonClasses, child.props?.className),
    });
  }

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}