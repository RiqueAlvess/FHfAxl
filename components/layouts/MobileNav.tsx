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
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  userRole: 'ADMIN' | 'RH' | 'COLABORADOR'
  userName?: string
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
    label: 'Admin',
    href: '/admin',
    icon: Settings,
    allowedRoles: ['ADMIN'],
  },
]

export function MobileNav({ userRole, userName }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const filteredNavItems = navItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(userRole)
  )

  // Pega os primeiros 4 itens para a barra inferior
  const bottomNavItems = filteredNavItems.slice(0, 4)

  return (
    <>
      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Menu */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              VIVAMENTE360
            </h1>
            {userName && (
              <>
                <p className="text-sm text-foreground mt-1">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Drawer Navigation */}
        <nav className="p-4 space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

            return (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start transition-colors duration-200',
                    isActive
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30 lg:hidden">
        <nav className="flex items-center justify-around h-16 px-2">
          {/* Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors',
              'hover:bg-secondary active:bg-secondary',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
            )}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Menu</span>
          </button>

          {/* Navigation Items */}
          {bottomNavItems.slice(0, 3).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors',
                  'hover:bg-secondary active:bg-secondary',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                  isActive
                    ? 'text-accent'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs truncate max-w-[60px]">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Spacer for bottom nav */}
      <div className="h-16 lg:hidden" />
    </>
  )
}
