"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-500/10 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-zinc-100">
            Algo deu errado
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Ocorreu um erro ao carregar esta página
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
            <p className="text-sm text-zinc-400 font-mono break-all">
              {error.message || "Erro desconhecido"}
            </p>
            {error.digest && (
              <p className="text-xs text-zinc-500 mt-2">
                ID do Erro: {error.digest}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={reset}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-zinc-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-100 hover:bg-zinc-800"
            >
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
