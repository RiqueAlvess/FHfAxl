import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(8),
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validar dados de entrada
          const { email, senha } = loginSchema.parse(credentials);

          // Buscar usuário no banco
          const user = await prisma.user.findUnique({
            where: { email },
            include: { empresa: true },
          });

          // Verificar se usuário existe e está ativo
          if (!user || !user.ativo) {
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
            empresaId: user.empresaId,
            unidadeId: user.unidadeId,
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.empresaId = user.empresaId;
        token.unidadeId = user.unidadeId;
        token.forcarTrocaSenha = user.forcarTrocaSenha;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.empresaId = token.empresaId as string;
        session.user.unidadeId = token.unidadeId as string | undefined;
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
