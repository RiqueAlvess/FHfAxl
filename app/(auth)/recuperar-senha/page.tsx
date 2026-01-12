"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailEnviado, setEmailEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/recuperar-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailEnviado(true);
        toast.success("Email enviado com sucesso!");
      } else {
        toast.error(data.error || "Erro ao enviar email");
      }
    } catch (error) {
      toast.error("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailEnviado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 relative z-10 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-zinc-100">
              Email Enviado!
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Verifique sua caixa de entrada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-zinc-950 border-zinc-800">
              <Mail className="h-4 w-4" />
              <AlertDescription className="text-zinc-300">
                Se o email <strong>{email}</strong> estiver cadastrado, você
                receberá um link para redefinir sua senha. O link expira em{" "}
                <strong>1 hora</strong>.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm text-zinc-400">
              <p>Não recebeu o email?</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Verifique sua pasta de spam</li>
                <li>Aguarde alguns minutos</li>
                <li>Certifique-se de que digitou o email correto</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-100 hover:bg-zinc-800"
                onClick={() => {
                  setEmailEnviado(false);
                  setEmail("");
                }}
              >
                Tentar outro email
              </Button>
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-zinc-50"
                onClick={() => router.push("/login")}
              >
                Voltar ao Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 relative z-10 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
            Recuperar Senha
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Digite seu email para receber um link de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-zinc-50"
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 hover:underline transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Login
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
