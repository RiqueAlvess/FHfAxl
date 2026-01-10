"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        senha: formData.senha,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email ou senha inválidos");
      } else {
        toast.success("Login realizado com sucesso!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 relative z-10 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
            VIVAMENTE360
          </CardTitle>
          <CardDescription className="text-zinc-400">Plataforma de Avaliação de Riscos Psicossociais</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-zinc-200">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                required
                disabled={isLoading}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-zinc-50" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center text-sm">
              <Link
                href="/recuperar-senha"
                className="text-violet-400 hover:text-violet-300 hover:underline transition-colors"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-500">
            <p>Conforme NR-1 • LGPD • GRO/PGR</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
