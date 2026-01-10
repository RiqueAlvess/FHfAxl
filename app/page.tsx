import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />

      <div className="max-w-5xl w-full text-center relative z-10">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 bg-clip-text text-transparent">
          VIVAMENTE360
        </h1>
        <p className="text-2xl text-zinc-200 mb-4">
          Plataforma de Avaliação de Riscos Psicossociais
        </p>
        <p className="text-lg text-zinc-400 mb-8">
          Conforme NR-1 • LGPD • GRO/PGR
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link href="/login">
            <Button size="lg" className="text-lg px-8 bg-violet-600 hover:bg-violet-700 text-zinc-50">
              Acessar Sistema
            </Button>
          </Link>
          <Link href="/questionario/demo">
            <Button size="lg" variant="outline" className="text-lg px-8 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-50">
              Ver Demo
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl hover:border-violet-500/50 transition-all">
            <h3 className="text-xl font-semibold mb-2 text-zinc-50">🔒 Seguro</h3>
            <p className="text-zinc-400">
              Conformidade total com LGPD e proteção de dados sensíveis
            </p>
          </div>
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl hover:border-violet-500/50 transition-all">
            <h3 className="text-xl font-semibold mb-2 text-zinc-50">📊 Completo</h3>
            <p className="text-zinc-400">
              Análises detalhadas com 15+ visualizações e KPIs
            </p>
          </div>
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl hover:border-violet-500/50 transition-all">
            <h3 className="text-xl font-semibold mb-2 text-zinc-50">✅ Certificado</h3>
            <p className="text-zinc-400">
              Atende requisitos da NR-1 e GRO/PGR
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
