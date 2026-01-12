import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 shadow-2xl">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
            VIVAMENTE360
          </h1>
          <p className="text-sm text-zinc-300 mt-1">{session.user.name}</p>
          <p className="text-xs text-zinc-500">{session.user.role}</p>
        </div>

        <nav className="p-4 space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          {(session.user.role === "RH" || isAdmin) && (
            <Link href="/colaboradores">
              <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
                <Users className="mr-2 h-4 w-4" />
                Colaboradores
              </Button>
            </Link>
          )}

          <Link href="/questionarios">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
              <FileText className="mr-2 h-4 w-4" />
              Questionários
            </Button>
          </Link>

          <Link href="/relatorios">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
              <BarChart3 className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
          </Link>

          {isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
                <Settings className="mr-2 h-4 w-4" />
                Administração
              </Button>
            </Link>
          )}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-zinc-800">
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-6">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
