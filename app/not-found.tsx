import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative z-10 text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="p-6 bg-violet-500/10 rounded-full">
            <FileQuestion className="h-24 w-24 text-violet-500" />
          </div>
        </div>

        {/* Error Code */}
        <div>
          <h1 className="text-8xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-zinc-100 mt-4">
            Página Não Encontrada
          </h2>
          <p className="text-zinc-400 mt-2">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button
            asChild
            variant="outline"
            className="bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800"
          >
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button
            asChild
            className="bg-violet-600 hover:bg-violet-700 text-zinc-50"
          >
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Ir para o Dashboard
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} VIVAMENTE360</p>
          <p className="mt-1">Conforme NR-1 • LGPD • GRO/PGR</p>
        </div>
      </div>
    </div>
  );
}
