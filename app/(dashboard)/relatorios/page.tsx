import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";
import ReportBuilder from "@/components/relatorios/ReportBuilder";

export default async function RelatoriosPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Verificar se o usuário tem permissão (apenas RH e ADMIN)
  if (session.user.role !== "RH" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Determinar empresaId baseado no role
  const empresaId = session.user.role === "ADMIN"
    ? session.user.empresaId || ""
    : session.user.empresaId;

  if (!empresaId) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50">Relatórios</h1>
          <p className="text-zinc-400">Gere relatórios personalizados de saúde ocupacional</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhuma empresa associada. Entre em contato com o administrador.
          </p>
        </div>
      </div>
    );
  }

  // Buscar opções de filtros
  const [ciclos, unidades, setores] = await Promise.all([
    prisma.cicloAvaliacao.findMany({
      where: { empresaId, ativo: true },
      select: { id: true, nome: true },
      orderBy: { dataInicio: "desc" },
    }),
    prisma.unidade.findMany({
      where: { empresaId, ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
    prisma.setor.findMany({
      where: {
        unidade: { empresaId, ativo: true },
        ativo: true,
      },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-50 flex items-center gap-3">
          <FileText className="h-8 w-8" />
          Relatórios
        </h1>
        <p className="text-zinc-400 mt-2">
          Gere relatórios personalizados de saúde ocupacional em PDF ou Excel
        </p>
      </div>

      <ReportBuilder
        empresaId={empresaId}
        options={{
          ciclos,
          unidades,
          setores,
        }}
      />
    </div>
  );
}
