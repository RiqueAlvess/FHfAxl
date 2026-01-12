"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
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
import { Eye, EyeOff, ShieldAlert, Lock } from "lucide-react";

export default function TrocarSenhaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });

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
      const response = await fetch("/api/auth/trocar-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senhaAtual: formData.senhaAtual,
          novaSenha: formData.novaSenha,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Senha alterada com sucesso!");
        // Redirecionar para o dashboard após 2 segundos
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      } else {
        toast.error(data.error || "Erro ao alterar senha");
      }
    } catch (error) {
      toast.error("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

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
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 relative z-10 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orange-500/10 rounded-full">
              <ShieldAlert className="h-12 w-12 text-orange-500" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
            Troca de Senha Obrigatória
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Por segurança, você precisa alterar sua senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-zinc-950 border-zinc-800 mb-4">
            <Lock className="h-4 w-4" />
            <AlertDescription className="text-zinc-300">
              Escolha uma senha forte que você não tenha usado recentemente.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senhaAtual" className="text-zinc-200">
                Senha Atual
              </Label>
              <div className="relative">
                <Input
                  id="senhaAtual"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.senhaAtual}
                  onChange={(e) =>
                    setFormData({ ...formData, senhaAtual: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="novaSenha" className="text-zinc-200">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="novaSenha"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.novaSenha}
                  onChange={(e) =>
                    setFormData({ ...formData, novaSenha: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                >
                  {showNewPassword ? (
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
                    Força:{" "}
                    {strengthLabels[passwordStrength - 1] || "Muito fraca"}
                  </p>
                </div>
              )}

              <ul className="text-xs text-zinc-400 space-y-1 ml-4 list-disc">
                <li
                  className={
                    formData.novaSenha.length >= 8 ? "text-green-400" : ""
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

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-100 hover:bg-zinc-800"
                onClick={handleLogout}
                disabled={isLoading}
              >
                Sair
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-zinc-50"
                disabled={
                  isLoading ||
                  !formData.senhaAtual ||
                  !formData.novaSenha ||
                  !formData.confirmarSenha ||
                  formData.novaSenha !== formData.confirmarSenha
                }
              >
                {isLoading ? "Alterando..." : "Alterar Senha"}
              </Button>
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
