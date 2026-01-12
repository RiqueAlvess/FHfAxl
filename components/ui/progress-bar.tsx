'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Valor atual da barra (0-100)
   */
  value: number

  /**
   * Valor máximo (padrão: 100)
   * @default 100
   */
  max?: number

  /**
   * Mostrar label com percentual
   * @default false
   */
  showLabel?: boolean

  /**
   * Tamanho da barra
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Variante da cor
   * @default "accent"
   */
  variant?: 'accent' | 'primary' | 'success' | 'warning' | 'destructive'

  /**
   * Classes CSS adicionais para o container
   */
  containerClassName?: string

  /**
   * Classes CSS adicionais para a barra de progresso
   */
  barClassName?: string

  /**
   * Label customizado (substitui o percentual)
   */
  label?: string

  /**
   * Animar a transição de largura
   * @default true
   */
  animate?: boolean
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      value,
      max = 100,
      showLabel = false,
      size = 'md',
      variant = 'accent',
      containerClassName,
      barClassName,
      label,
      animate = true,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    }

    const variantClasses = {
      accent: 'bg-gradient-to-r from-accent to-accent-light',
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      destructive: 'bg-destructive',
    }

    return (
      <div ref={ref} className={cn('w-full', containerClassName)} {...props}>
        {/* Label */}
        {(showLabel || label) && (
          <div className="flex items-center justify-between mb-2">
            {label && <span className="text-sm font-medium text-foreground">{label}</span>}
            {showLabel && (
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}

        {/* Progress Bar Container */}
        <div
          className={cn(
            'w-full bg-secondary rounded-full overflow-hidden',
            sizeClasses[size],
            className
          )}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          {/* Progress Bar Fill */}
          <div
            className={cn(
              'h-full rounded-full',
              variantClasses[variant],
              animate && 'transition-all duration-500 ease-out',
              barClassName
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)

ProgressBar.displayName = 'ProgressBar'

export { ProgressBar }
