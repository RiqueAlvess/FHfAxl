"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Empresa = {
  id: string;
  nome: string;
  unidades: Array<{
    id: string;
    nome: string;
    setores: Array<{
      id: string;
      nome: string;
    }>;
  }>;
};

export default function CreateUserPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>("");
  const [selectedUnidade, setSelectedUnidade] = useState<string>("");
  const [formData, setFormData] = useState({
    email: "",
    nome: "",
    senha: "",
    role: "RH",
    empresaId: "",
    unidadeId: "",
    setorId: "",
  });

  useEffect(() => {
    // Carregar empresas
    fetch("/api/FHfAxl")
      .then((res) => res.json())
      .then((data) => {
        if (data.empresas) {
          setEmpresas(data.empresas);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar empresas:", error);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/FHfAxl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Usuário criado com sucesso!");
        // Limpar formulário
        setFormData({
          email: "",
          nome: "",
          senha: "",
          role: "RH",
          empresaId: "",
          unidadeId: "",
          setorId: "",
        });
        setSelectedEmpresa("");
        setSelectedUnidade("");
      } else {
        toast.error(data.error || "Erro ao criar usuário");
      }
    } catch (error) {
      toast.error("Erro ao criar usuário. Tente novamente.");
      console.error("Erro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEmpresaData = empresas.find((e) => e.id === selectedEmpresa);
  const selectedUnidadeData = selectedEmpresaData?.unidades.find(
    (u) => u.id === selectedUnidade
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Criar Usuário - Acesso Restrito
          </CardTitle>
          <CardDescription>
            Rota oculta para criação direta de usuários no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="João Silva"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@exemplo.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={(e) =>
                    setFormData({ ...formData, senha: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <p className="text-xs text-gray-500">Mínimo 8 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Perfil *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="LIDERANCA">Liderança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Select
                value={selectedEmpresa}
                onValueChange={(value) => {
                  setSelectedEmpresa(value);
                  setFormData({ ...formData, empresaId: value });
                  setSelectedUnidade("");
                }}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa (opcional para ADMIN)" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEmpresa && selectedEmpresaData && (
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade</Label>
                <Select
                  value={selectedUnidade}
                  onValueChange={(value) => {
                    setSelectedUnidade(value);
                    setFormData({ ...formData, unidadeId: value });
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedEmpresaData.unidades.map((unidade) => (
                      <SelectItem key={unidade.id} value={unidade.id}>
                        {unidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedUnidade && selectedUnidadeData && (
              <div className="space-y-2">
                <Label htmlFor="setor">Setor</Label>
                <Select
                  value={formData.setorId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, setorId: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedUnidadeData.setores.map((setor) => (
                      <SelectItem key={setor.id} value={setor.id}>
                        {setor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Criando usuário..." : "Criar Usuário"}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Observações importantes:</strong>
            </p>
            <ul className="list-disc list-inside text-xs text-yellow-700 mt-2 space-y-1">
              <li>Usuários <strong>RH</strong> e <strong>LIDERANCA</strong> devem estar vinculados a uma empresa</li>
              <li>Usuários <strong>ADMIN</strong> podem ser criados sem vínculos</li>
              <li>A senha será hasheada automaticamente usando bcrypt</li>
              <li>Esta rota é oculta e não deve ser divulgada publicamente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
