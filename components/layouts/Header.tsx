'use client'

import { NotificationBell } from '@/components/NotificationBell'
import { Breadcrumb } from '@/components/Breadcrumb'
import { cn } from '@/lib/utils'

interface HeaderProps {
  /**
   * Título da página atual
   */
  title?: string

  /**
   * Mostrar breadcrumb
   * @default false
   */
  showBreadcrumb?: boolean

  /**
   * Componentes adicionais para renderizar no lado direito do header
   */
  rightContent?: React.ReactNode

  /**
   * Classes CSS adicionais
   */
  className?: string
}

export function Header({
  title,
  showBreadcrumb = false,
  rightContent,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'h-[var(--header-height)] border-b border-border bg-card flex items-center justify-between px-6',
        'sticky top-0 z-20',
        className
      )}
    >
      {/* Left Side - Title or Breadcrumb */}
      <div className="flex-1">
        {showBreadcrumb ? (
          <Breadcrumb />
        ) : title ? (
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        ) : null}
      </div>

      {/* Right Side - Notifications and Custom Content */}
      <div className="flex items-center gap-3">
        {rightContent}
        <NotificationBell />
      </div>
    </header>
  )
}
