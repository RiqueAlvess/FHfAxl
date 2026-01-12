import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "VIVAMENTE360 - Plataforma de Avaliação de Riscos Psicossociais",
  description: "Sistema de gestão de riscos psicossociais conforme NR-1, LGPD, GRO/PGR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
