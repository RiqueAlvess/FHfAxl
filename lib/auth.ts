import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Role } from "@prisma/client";

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(8),
});

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials, _request) {
        try {
          // Validar dados de entrada
          const { email, senha } = loginSchema.parse(credentials);

          // Buscar usuário no banco
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              empresa: true,
              unidade: true,
              setor: true,
            },
          });

          // Verificar se usuário existe e está ativo
          if (!user || !user.ativo) {
            return null;
          }

          // Validar regras de negócio por role
          if (user.role === "RH" && !user.empresaId) {
            console.error("RH deve estar vinculado a uma empresa");
            return null;
          }

          if (user.role === "LIDERANCA" && !user.empresaId) {
            console.error("LIDERANCA deve estar vinculado a uma empresa");
            return null;
          }

          // Verificar senha
          const isValidPassword = await compare(senha, user.senha);
          if (!isValidPassword) {
            return null;
          }

          // Atualizar último login (em background)
          prisma.user.update({
            where: { id: user.id },
            data: {
              lastLoginAt: new Date(),
              // lastLoginIp seria preenchido no middleware
            },
          }).catch(console.error);

          // Retornar dados do usuário
          return {
            id: user.id,
            email: user.email,
            name: user.nome,
            role: user.role,
            empresaId: user.empresaId ?? undefined,
            unidadeId: user.unidadeId ?? undefined,
            setorId: user.setorId ?? undefined,
            forcarTrocaSenha: user.forcarTrocaSenha,
          };
        } catch (error) {
          console.error("Erro no login:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Novo login - carregar dados do usuário
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.empresaId = user.empresaId;
        token.unidadeId = user.unidadeId;
        token.setorId = user.setorId;
        token.forcarTrocaSenha = user.forcarTrocaSenha;
      }

      // Atualizar token se sessão mudou (ex: perfil atualizado)
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.empresaId = token.empresaId as string | undefined;
        session.user.unidadeId = token.unidadeId as string | undefined;
        session.user.setorId = token.setorId as string | undefined;
        session.user.forcarTrocaSenha = token.forcarTrocaSenha as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
