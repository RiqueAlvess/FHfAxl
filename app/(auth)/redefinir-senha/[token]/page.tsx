"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface TokenValidation {
  valid: boolean;
  error?: string;
  user?: {
    nome: string;
    email: string;
  };
  expiresAt?: string;
}

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState<TokenValidation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [senhaRedefinida, setSenhaRedefinida] = useState(false);
  const [formData, setFormData] = useState({
    novaSenha: "",
    confirmarSenha: "",
  });

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch("/api/auth/validar-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      setTokenValid(data);
    } catch (error) {
      setTokenValid({
        valid: false,
        error: "Erro ao validar token",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const validatePassword = (senha: string): string | null => {
    if (senha.length < 8) {
      return "Senha deve ter no mínimo 8 caracteres";
    }
    if (!/[a-z]/.test(senha)) {
      return "Senha deve conter letras minúsculas";
    }
    if (!/[A-Z]/.test(senha)) {
      return "Senha deve conter letras maiúsculas";
    }
    if (!/\d/.test(senha)) {
      return "Senha deve conter números";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar senhas
    const passwordError = validatePassword(formData.novaSenha);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (formData.novaSenha !== formData.confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/redefinir-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          novaSenha: formData.novaSenha,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSenhaRedefinida(true);
        toast.success("Senha redefinida com sucesso!");
      } else {
        toast.error(data.error || "Erro ao redefinir senha");
      }
    } catch (error) {
      toast.error("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-violet-500 animate-spin mx-auto" />
          <p className="text-zinc-400">Validando token...</p>
        </div>
      </div>
    );
  }

  // Token inválido
  if (!tokenValid?.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 relative z-10 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-zinc-100">
              Link Inválido
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {tokenValid?.error || "Este link não é válido"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-zinc-950 border-zinc-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-zinc-300">
                O link pode ter expirado ou já ter sido utilizado.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-100 hover:bg-zinc-800"
                onClick={() => router.push("/recuperar-senha")}
              >
                Solicitar Novo Link
              </Button>
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-zinc-50"
                onClick={() => router.push("/login")}
              >
                Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Senha redefinida com sucesso
  if (senhaRedefinida) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 relative z-10 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-zinc-100">
              Senha Redefinida!
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Sua senha foi alterada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-zinc-950 border-zinc-800">
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription className="text-zinc-300">
                Você já pode fazer login com sua nova senha.
              </AlertDescription>
            </Alert>

            <Button
              className="w-full bg-violet-600 hover:bg-violet-700 text-zinc-50"
              onClick={() => router.push("/login")}
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulário de redefinição
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.novaSenha);
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];
  const strengthLabels = [
    "Muito fraca",
    "Fraca",
    "Média",
    "Forte",
    "Muito forte",
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 relative z-10 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
            Redefinir Senha
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Olá, {tokenValid.user?.nome}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="novaSenha" className="text-zinc-200">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="novaSenha"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.novaSenha}
                  onChange={(e) =>
                    setFormData({ ...formData, novaSenha: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {formData.novaSenha && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < passwordStrength
                            ? strengthColors[passwordStrength - 1]
                            : "bg-zinc-800"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400">
                    Força: {strengthLabels[passwordStrength - 1] || "Muito fraca"}
                  </p>
                </div>
              )}

              <ul className="text-xs text-zinc-400 space-y-1 ml-4 list-disc">
                <li
                  className={
                    formData.novaSenha.length >= 8
                      ? "text-green-400"
                      : ""
                  }
                >
                  Mínimo 8 caracteres
                </li>
                <li
                  className={
                    /[A-Z]/.test(formData.novaSenha) ? "text-green-400" : ""
                  }
                >
                  Letra maiúscula
                </li>
                <li
                  className={
                    /[a-z]/.test(formData.novaSenha) ? "text-green-400" : ""
                  }
                >
                  Letra minúscula
                </li>
                <li
                  className={
                    /\d/.test(formData.novaSenha) ? "text-green-400" : ""
                  }
                >
                  Número
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha" className="text-zinc-200">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmarSenha}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmarSenha: e.target.value,
                    })
                  }
                  required
                  disabled={isLoading}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formData.confirmarSenha &&
                formData.novaSenha !== formData.confirmarSenha && (
                  <p className="text-xs text-red-400">
                    As senhas não coincidem
                  </p>
                )}
            </div>

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-zinc-50"
              disabled={
                isLoading ||
                !formData.novaSenha ||
                !formData.confirmarSenha ||
                formData.novaSenha !== formData.confirmarSenha
              }
            >
              {isLoading ? "Redefinindo..." : "Redefinir Senha"}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-violet-400 hover:text-violet-300 hover:underline transition-colors"
              >
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
