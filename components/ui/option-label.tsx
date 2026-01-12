'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface OptionLabelProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label do radio button
   */
  label: string

  /**
   * Ícone a ser exibido (componente React)
   */
  icon?: React.ReactNode

  /**
   * Descrição adicional (opcional)
   */
  description?: string

  /**
   * Classes CSS adicionais para o container
   */
  containerClassName?: string

  /**
   * Classes CSS adicionais para o ícone
   */
  iconClassName?: string
}

const OptionLabel = React.forwardRef<HTMLInputElement, OptionLabelProps>(
  (
    {
      className,
      label,
      icon,
      description,
      containerClassName,
      iconClassName,
      checked,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <label
        className={cn(
          'relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
          'hover:border-accent/50 hover:bg-accent/5',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
          checked
            ? 'border-accent bg-accent/10'
            : 'border-border bg-card',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          containerClassName
        )}
      >
        {/* Radio Input (hidden but accessible) */}
        <input
          type="radio"
          ref={ref}
          checked={checked}
          disabled={disabled}
          className={cn(
            'sr-only',
            className
          )}
          {...props}
        />

        {/* Custom Radio Indicator */}
        <div
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200',
            'flex items-center justify-center mt-0.5',
            checked
              ? 'border-accent bg-accent'
              : 'border-muted-foreground bg-background'
          )}
        >
          {checked && (
            <div className="w-2.5 h-2.5 rounded-full bg-accent-foreground" />
          )}
        </div>

        {/* Icon (if provided) */}
        {icon && (
          <div
            className={cn(
              'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200',
              checked
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground',
              iconClassName
            )}
          >
            {icon}
          </div>
        )}

        {/* Label and Description */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground">{label}</div>
          {description && (
            <div className="text-sm text-muted-foreground mt-1">
              {description}
            </div>
          )}
        </div>

        {/* Checkmark indicator (optional visual enhancement) */}
        {checked && (
          <div className="flex-shrink-0 text-accent">
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </label>
    )
  }
)

OptionLabel.displayName = 'OptionLabel'

export { OptionLabel }
