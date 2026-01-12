import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canAccessAdminPanel } from "@/lib/authorization";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  LogOut,
  Database,
  BarChart3,
  FileText,
} from "lucide-react";
import { AdminContentWrapper } from "@/components/admin/AdminContentWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Verificar se tem permissão de admin
  if (!canAccessAdminPanel(session)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 shadow-2xl">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-violet-400" />
            <h1 className="text-xl font-bold text-zinc-50">
              Painel Admin
            </h1>
          </div>
          <p className="text-sm text-zinc-300">{session.user.name}</p>
          <p className="text-xs text-violet-400 font-semibold">{session.user.role}</p>
        </div>

        <nav className="p-4 space-y-2">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard Admin
            </Button>
          </Link>

          <Link href="/admin/usuarios">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
              <Users className="mr-2 h-4 w-4" />
              Gerenciar Usuários
            </Button>
          </Link>

          <Link href="/admin/empresas">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
              <Building2 className="mr-2 h-4 w-4" />
              Gerenciar Empresas
            </Button>
          </Link>

          <div className="pt-2 border-t border-zinc-800">
            <p className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase">
              Visualizações por Empresa
            </p>
          </div>

          <Link href="/admin/dashboard-empresas">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard Empresas
            </Button>
          </Link>

          <Link href="/admin/colaboradores">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
              <Users className="mr-2 h-4 w-4" />
              Colaboradores
            </Button>
          </Link>

          <Link href="/admin/relatorios">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
              <FileText className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
          </Link>

          <div className="pt-2 border-t border-zinc-800 mt-2"></div>

          <Link href="/admin/auditoria">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
              <Database className="mr-2 h-4 w-4" />
              Logs de Auditoria
            </Button>
          </Link>

          <div className="pt-4 border-t border-zinc-800">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full justify-start border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 transition-colors">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-zinc-800">
          <form action="/api/auth/signout" method="POST">
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-zinc-950">
        <AdminContentWrapper>
          <div className="p-8">{children}</div>
        </AdminContentWrapper>
      </main>
    </div>
  );
}
