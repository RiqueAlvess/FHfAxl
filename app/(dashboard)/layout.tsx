import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            VIVAMENTE360
          </h1>
          <p className="text-sm text-gray-500 mt-1">{session.user.name}</p>
          <p className="text-xs text-gray-400">{session.user.role}</p>
        </div>

        <nav className="p-4 space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          {(session.user.role === "RH" || isAdmin) && (
            <Link href="/colaboradores">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Colaboradores
              </Button>
            </Link>
          )}

          <Link href="/questionarios">
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Questionários
            </Button>
          </Link>

          <Link href="/relatorios">
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
          </Link>

          {isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Administração
              </Button>
            </Link>
          )}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
