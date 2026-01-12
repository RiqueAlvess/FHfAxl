'use client'

import { signOut } from 'next-auth/react'
import { MainLayout } from './MainLayout'

interface DashboardLayoutClientProps {
  userRole: 'ADMIN' | 'RH' | 'LIDERANCA' | 'COLABORADOR'
  userName?: string
  userEmail?: string
  children: React.ReactNode
}

export function DashboardLayoutClient({
  userRole,
  userName,
  userEmail,
  children,
}: DashboardLayoutClientProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <MainLayout
      userRole={userRole}
      userName={userName}
      userEmail={userEmail}
      showBreadcrumb
      onLogout={handleLogout}
    >
      {children}
    </MainLayout>
  )
}
