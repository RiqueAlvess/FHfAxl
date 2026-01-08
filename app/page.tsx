import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          VIVAMENTE360
        </h1>
        <p className="text-2xl text-gray-600 mb-4">
          Plataforma de Avaliação de Riscos Psicossociais
        </p>
        <p className="text-lg text-gray-500 mb-8">
          Conforme NR-1 • LGPD • GRO/PGR
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link href="/login">
            <Button size="lg" className="text-lg px-8">
              Acessar Sistema
            </Button>
          </Link>
          <Link href="/questionario/demo">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Ver Demo
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-2">🔒 Seguro</h3>
            <p className="text-gray-600">
              Conformidade total com LGPD e proteção de dados sensíveis
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-2">📊 Completo</h3>
            <p className="text-gray-600">
              Análises detalhadas com 15+ visualizações e KPIs
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-2">✅ Certificado</h3>
            <p className="text-gray-600">
              Atende requisitos da NR-1 e GRO/PGR
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
