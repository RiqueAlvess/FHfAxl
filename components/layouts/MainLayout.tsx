'use client'

import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { Header } from './Header'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  /**
   * Conteúdo da página
   */
  children: React.ReactNode

  /**
   * Role do usuário atual
   */
  userRole: 'ADMIN' | 'RH' | 'COLABORADOR'

  /**
   * Nome do usuário
   */
  userName?: string

  /**
   * Email do usuário
   */
  userEmail?: string

  /**
   * Título do header
   */
  headerTitle?: string

  /**
   * Mostrar breadcrumb no header
   * @default false
   */
  showBreadcrumb?: boolean

  /**
   * Conteúdo adicional para o lado direito do header
   */
  headerRightContent?: React.ReactNode

  /**
   * Callback de logout
   */
  onLogout?: () => void

  /**
   * Classes CSS adicionais para o container principal
   */
  className?: string

  /**
   * Classes CSS adicionais para a área de conteúdo
   */
  contentClassName?: string
}

export function MainLayout({
  children,
  userRole,
  userName,
  userEmail,
  headerTitle,
  showBreadcrumb = false,
  headerRightContent,
  onLogout,
  className,
  contentClassName,
}: MainLayoutProps) {
  return (
    <div className={cn('flex h-screen bg-background', className)}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
          onLogout={onLogout}
        />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav userRole={userRole} userName={userName} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          title={headerTitle}
          showBreadcrumb={showBreadcrumb}
          rightContent={headerRightContent}
        />

        {/* Scrollable Content */}
        <main className={cn('flex-1 overflow-y-auto', contentClassName)}>
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
