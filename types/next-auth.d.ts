import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      empresaId: string;
      unidadeId?: string;
      forcarTrocaSenha: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    empresaId: string;
    unidadeId?: string;
    forcarTrocaSenha: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    empresaId: string;
    unidadeId?: string;
    forcarTrocaSenha: boolean;
  }
}
