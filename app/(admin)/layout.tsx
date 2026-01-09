import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
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
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Verificar se tem permissão de admin
  if (!canAccessAdminPanel(session)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-xl">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-yellow-400" />
            <h1 className="text-xl font-bold text-white">
              Painel Admin
            </h1>
          </div>
          <p className="text-sm text-slate-300">{session.user.name}</p>
          <p className="text-xs text-yellow-400 font-semibold">{session.user.role}</p>
        </div>

        <nav className="p-4 space-y-2">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start text-slate-200 hover:text-white hover:bg-slate-700">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard Admin
            </Button>
          </Link>

          <Link href="/admin/usuarios">
            <Button variant="ghost" className="w-full justify-start text-slate-200 hover:text-white hover:bg-slate-700">
              <Users className="mr-2 h-4 w-4" />
              Gerenciar Usuários
            </Button>
          </Link>

          <Link href="/admin/empresas">
            <Button variant="ghost" className="w-full justify-start text-slate-200 hover:text-white hover:bg-slate-700">
              <Building2 className="mr-2 h-4 w-4" />
              Gerenciar Empresas
            </Button>
          </Link>

          <Link href="/admin/auditoria">
            <Button variant="ghost" className="w-full justify-start text-slate-200 hover:text-white hover:bg-slate-700">
              <Database className="mr-2 h-4 w-4" />
              Logs de Auditoria
            </Button>
          </Link>

          <div className="pt-4 border-t border-slate-700">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-slate-700">
          <form action="/api/auth/signout" method="POST">
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
