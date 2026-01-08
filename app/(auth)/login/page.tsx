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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            VIVAMENTE360
          </CardTitle>
          <CardDescription>Plataforma de Avaliação de Riscos Psicossociais</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center text-sm">
              <Link
                href="/recuperar-senha"
                className="text-blue-600 hover:underline"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Conforme NR-1 • LGPD • GRO/PGR</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
