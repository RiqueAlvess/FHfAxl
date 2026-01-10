"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Send,
  Loader2,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MagicLink {
  id: string;
  token: string;
  status: "PENDING" | "SENT" | "ACCESSED" | "COMPLETED" | "EXPIRED";
  expiresAt: Date;
  sentAt?: Date;
  accessedAt?: Date;
  completedAt?: Date;
  colaborador: {
    id: string;
    email: string;
    unidade?: { nome: string };
    setor?: { nome: string };
    cargo?: { nome: string };
  };
  cicloAvaliacao: {
    id: string;
    nome: string;
  };
}

interface MagicLinksDashboardProps {
  cicloId?: string;
  onResend?: (magicLinkIds: string[]) => void;
}

export default function MagicLinksDashboard({
  cicloId,
  onResend,
}: MagicLinksDashboardProps) {
  const [magicLinks, setMagicLinks] = useState<MagicLink[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<MagicLink[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    fetchMagicLinks();
  }, [cicloId]);

  useEffect(() => {
    applyFilters();
  }, [magicLinks, statusFilter, searchQuery]);

  const fetchMagicLinks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (cicloId) params.append("cicloAvaliacaoId", cicloId);

      const response = await fetch(`/api/magic-link/status?${params}`);
      if (!response.ok) throw new Error("Erro ao buscar magic links");

      const data = await response.json();
      setMagicLinks(data);
    } catch (error) {
      console.error("Erro ao buscar magic links:", error);
      toast.error("Erro ao carregar magic links");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = magicLinks;

    if (statusFilter !== "all") {
      filtered = filtered.filter((link) => link.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter((link) =>
        link.colaborador.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLinks(filtered);
  };

  const handleResend = async () => {
    if (selectedLinks.length === 0) {
      toast.error("Selecione pelo menos um colaborador");
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch("/api/magic-link/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ magicLinkIds: selectedLinks }),
      });

      if (!response.ok) throw new Error("Erro ao reenviar magic links");

      const result = await response.json();
      toast.success(
        `${result.success} email(s) reenviado(s) com sucesso!`
      );

      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} erro(s) ao enviar`);
      }

      setSelectedLinks([]);
      fetchMagicLinks();

      if (onResend) {
        onResend(selectedLinks);
      }
    } catch (error) {
      console.error("Erro ao reenviar magic links:", error);
      toast.error("Erro ao reenviar magic links");
    } finally {
      setIsResending(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLinks.length === filteredLinks.length) {
      setSelectedLinks([]);
    } else {
      setSelectedLinks(filteredLinks.map((link) => link.id));
    }
  };

  const toggleSelectLink = (linkId: string) => {
    if (selectedLinks.includes(linkId)) {
      setSelectedLinks(selectedLinks.filter((id) => id !== linkId));
    } else {
      setSelectedLinks([...selectedLinks, linkId]);
    }
  };

  const getStatusBadge = (status: MagicLink["status"]) => {
    const config = {
      PENDING: {
        label: "Pendente",
        variant: "secondary" as const,
        icon: Clock,
      },
      SENT: {
        label: "Enviado",
        variant: "default" as const,
        icon: Mail,
      },
      ACCESSED: {
        label: "Acessado",
        variant: "default" as const,
        icon: AlertCircle,
      },
      COMPLETED: {
        label: "Completado",
        variant: "default" as const,
        icon: CheckCircle2,
      },
      EXPIRED: {
        label: "Expirado",
        variant: "destructive" as const,
        icon: XCircle,
      },
    };

    const { label, variant, icon: Icon } = config[status];

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getStatusStats = () => {
    const stats = {
      total: magicLinks.length,
      enviados: magicLinks.filter((l) => l.status === "SENT").length,
      acessados: magicLinks.filter((l) => l.status === "ACCESSED").length,
      completados: magicLinks.filter((l) => l.status === "COMPLETED").length,
      pendentes: magicLinks.filter((l) => l.status === "PENDING").length,
      expirados: magicLinks.filter((l) => l.status === "EXPIRED").length,
    };

    return stats;
  };

  const stats = getStatusStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Enviados</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {stats.enviados}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Acessados</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {stats.acessados}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completados</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {stats.completados}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pendentes</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {stats.pendentes}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Expirados</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {stats.expirados}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Magic Links</CardTitle>
              <CardDescription>
                Gerencie o status dos questionários enviados
              </CardDescription>
            </div>
            {selectedLinks.length > 0 && (
              <Button
                onClick={handleResend}
                disabled={isResending}
                className="gap-2"
              >
                {isResending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Reenviar ({selectedLinks.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="SENT">Enviado</SelectItem>
                <SelectItem value="ACCESSED">Acessado</SelectItem>
                <SelectItem value="COMPLETED">Completado</SelectItem>
                <SelectItem value="EXPIRED">Expirado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedLinks.length === filteredLinks.length &&
                        filteredLinks.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Unidade/Setor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enviado Em</TableHead>
                  <TableHead>Expira Em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        Nenhum magic link encontrado
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedLinks.includes(link.id)}
                          onCheckedChange={() => toggleSelectLink(link.id)}
                          disabled={link.status === "COMPLETED"}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {link.colaborador.email}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{link.colaborador.unidade?.nome || "N/A"}</p>
                          <p className="text-muted-foreground">
                            {link.colaborador.setor?.nome || "N/A"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(link.status)}</TableCell>
                      <TableCell>
                        {link.sentAt
                          ? format(new Date(link.sentAt), "dd/MM/yyyy HH:mm", {
                              locale: ptBR,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(link.expiresAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR }
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
