'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userRole: 'ADMIN' | 'RH' | 'COLABORADOR'
  userName?: string
  userEmail?: string
  onLogout?: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  allowedRoles?: ('ADMIN' | 'RH' | 'COLABORADOR')[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Colaboradores',
    href: '/colaboradores',
    icon: Users,
    allowedRoles: ['ADMIN', 'RH'],
  },
  {
    label: 'Questionários',
    href: '/questionarios',
    icon: FileText,
  },
  {
    label: 'Relatórios',
    href: '/relatorios',
    icon: BarChart3,
  },
  {
    label: 'Administração',
    href: '/admin',
    icon: Settings,
    allowedRoles: ['ADMIN'],
  },
]

export function Sidebar({ userRole, userName, userEmail, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const filteredNavItems = navItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(userRole)
  )

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-card border-r border-border shadow-2xl transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[var(--sidebar-width)]'
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-border relative">
        {!isCollapsed && (
          <>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              VIVAMENTE360
            </h1>
            {userName && (
              <>
                <p className="text-sm text-foreground mt-1 truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userRole}</p>
              </>
            )}
          </>
        )}
        {isCollapsed && (
          <div className="text-2xl font-bold bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent text-center">
            V
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'absolute top-8 -right-3 bg-card border border-border rounded-full p-1',
            'hover:bg-secondary transition-colors duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          )}
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full transition-all duration-200',
                  isCollapsed ? 'justify-center px-2' : 'justify-start',
                  isActive
                    ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', !isCollapsed && 'mr-2')} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={onLogout}
          className={cn(
            'w-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200',
            isCollapsed ? 'justify-center px-2' : 'justify-start'
          )}
          title={isCollapsed ? 'Sair' : undefined}
        >
          <LogOut className={cn('h-5 w-5 flex-shrink-0', !isCollapsed && 'mr-2')} />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  )
}
