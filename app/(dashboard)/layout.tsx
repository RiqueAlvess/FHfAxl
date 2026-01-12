import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayoutClient } from "@/components/layouts/DashboardLayoutClient"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <DashboardLayoutClient
      userRole={session.user.role}
      userName={session.user.name || undefined}
      userEmail={session.user.email || undefined}
    >
      {children}
    </DashboardLayoutClient>
  )
}
