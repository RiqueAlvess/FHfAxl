"use client";

import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link?: string;
  lida: boolean;
  createdAt: string;
}

interface NotificacoesResponse {
  notificacoes: Notificacao[];
  naoLidasCount: number;
}

export function NotificationBell() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidasCount, setNaoLidasCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotificacoes = async () => {
    try {
      const response = await fetch("/api/notificacoes");
      if (response.ok) {
        const data: NotificacoesResponse = await response.json();
        setNotificacoes(data.notificacoes);
        setNaoLidasCount(data.naoLidasCount);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  useEffect(() => {
    fetchNotificacoes();

    // Poll a cada 30 segundos
    const interval = setInterval(fetchNotificacoes, 30000);
    return () => clearInterval(interval);
  }, []);

  const marcarComoLida = async (id: string) => {
    try {
      const response = await fetch(`/api/notificacoes/${id}`, {
        method: "PUT",
      });

      if (response.ok) {
        setNotificacoes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
        );
        setNaoLidasCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const response = await fetch("/api/notificacoes/marcar-todas-lidas", {
        method: "PUT",
      });

      if (response.ok) {
        setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
        setNaoLidasCount(0);
      }
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "NOVO_CICLO":
        return "🆕";
      case "LEMBRETE_QUESTIONARIO":
        return "⏰";
      case "QUESTIONARIO_RESPONDIDO":
        return "✅";
      case "RELATORIO_PRONTO":
        return "📊";
      case "AVISO_SISTEMA":
        return "⚠️";
      default:
        return "📬";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800"
        >
          <Bell className="h-5 w-5" />
          {naoLidasCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {naoLidasCount > 9 ? "9+" : naoLidasCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-zinc-900 border-zinc-800"
      >
        <div className="flex items-center justify-between p-2">
          <h3 className="font-semibold text-zinc-100">Notificações</h3>
          {naoLidasCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={marcarTodasComoLidas}
              className="text-xs text-violet-400 hover:text-violet-300 hover:bg-zinc-800"
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todas lidas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-zinc-800" />

        {notificacoes.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notificacoes.map((notificacao) => (
              <DropdownMenuItem
                key={notificacao.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  !notificacao.lida
                    ? "bg-violet-500/10 hover:bg-violet-500/20"
                    : "hover:bg-zinc-800"
                }`}
                onClick={() => {
                  if (!notificacao.lida) {
                    marcarComoLida(notificacao.id);
                  }
                  if (notificacao.link) {
                    window.location.href = notificacao.link;
                  }
                }}
              >
                <div className="flex items-start gap-2 w-full">
                  <span className="text-lg">{getTipoIcon(notificacao.tipo)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-zinc-100">
                        {notificacao.titulo}
                      </p>
                      {!notificacao.lida && (
                        <div className="h-2 w-2 bg-violet-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {notificacao.mensagem}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {formatDistanceToNow(new Date(notificacao.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
