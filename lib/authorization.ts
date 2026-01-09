import { Role } from "@prisma/client";
import { Session } from "next-auth";

/**
 * Regras de autorização por role:
 *
 * ADMIN:
 * - Usuário master do sistema
 * - Independente de empresa
 * - Acessa tudo e vê tudo
 * - Tem acesso ao painel admin (/admin)
 *
 * RH:
 * - Usuário vinculado a UMA empresa
 * - Pode ver todo conteúdo voltado a sua empresa
 * - Acessa todos os dados da empresa (unidades, setores e cargos)
 * - Não tem acesso ao painel admin
 *
 * LIDERANCA:
 * - Usuário vinculado a uma empresa
 * - Geralmente limitado a uma única unidade e/ou setor
 * - Vê apenas dados da sua unidade/setor
 * - Não tem acesso ao painel admin
 */

export interface AuthorizationContext {
  empresaId?: string;
  unidadeId?: string;
  setorId?: string;
}

export function canAccessAdminPanel(session: Session | null): boolean {
  return session?.user?.role === "ADMIN";
}

export function canManageUsers(session: Session | null): boolean {
  return session?.user?.role === "ADMIN";
}

export function canViewAllCompanies(session: Session | null): boolean {
  return session?.user?.role === "ADMIN";
}

export function canAccessCompany(
  session: Session | null,
  empresaId: string
): boolean {
  if (!session?.user) return false;

  const { role, empresaId: userEmpresaId } = session.user;

  // ADMIN acessa todas as empresas
  if (role === "ADMIN") return true;

  // RH e LIDERANCA só acessam sua própria empresa
  return userEmpresaId === empresaId;
}

export function canAccessUnidade(
  session: Session | null,
  unidadeId: string,
  empresaId: string
): boolean {
  if (!session?.user) return false;

  const { role, empresaId: userEmpresaId, unidadeId: userUnidadeId } = session.user;

  // ADMIN acessa tudo
  if (role === "ADMIN") return true;

  // Verificar se pertence à empresa
  if (userEmpresaId !== empresaId) return false;

  // RH acessa todas as unidades da empresa
  if (role === "RH") return true;

  // LIDERANCA só acessa sua unidade (se definida)
  if (role === "LIDERANCA" && userUnidadeId) {
    return userUnidadeId === unidadeId;
  }

  // LIDERANCA sem unidade definida pode acessar (pode estar limitada por setor)
  if (role === "LIDERANCA" && !userUnidadeId) {
    return true;
  }

  return false;
}

export function canAccessSetor(
  session: Session | null,
  setorId: string,
  unidadeId: string,
  empresaId: string
): boolean {
  if (!session?.user) return false;

  const {
    role,
    empresaId: userEmpresaId,
    unidadeId: userUnidadeId,
    setorId: userSetorId,
  } = session.user;

  // ADMIN acessa tudo
  if (role === "ADMIN") return true;

  // Verificar se pertence à empresa
  if (userEmpresaId !== empresaId) return false;

  // RH acessa todos os setores da empresa
  if (role === "RH") return true;

  // LIDERANCA limitada por setor
  if (role === "LIDERANCA" && userSetorId) {
    return userSetorId === setorId;
  }

  // LIDERANCA limitada por unidade
  if (role === "LIDERANCA" && userUnidadeId && !userSetorId) {
    return userUnidadeId === unidadeId;
  }

  return false;
}

export function getAuthorizationContext(session: Session | null): AuthorizationContext {
  if (!session?.user) return {};

  const { role, empresaId, unidadeId, setorId } = session.user;

  // ADMIN não tem contexto (acessa tudo)
  if (role === "ADMIN") {
    return {};
  }

  // RH tem apenas empresaId
  if (role === "RH") {
    return { empresaId: empresaId! };
  }

  // LIDERANCA pode ter empresa, unidade e/ou setor
  return {
    empresaId: empresaId!,
    unidadeId: unidadeId,
    setorId: setorId,
  };
}

/**
 * Gera filtro Prisma baseado no contexto de autorização
 */
export function getEmpresaFilter(session: Session | null) {
  if (!session?.user) return { id: "never" }; // Nenhum acesso

  const { role, empresaId } = session.user;

  // ADMIN vê todas as empresas
  if (role === "ADMIN") {
    return {};
  }

  // RH e LIDERANCA veem apenas sua empresa
  return { id: empresaId! };
}

export function getUnidadeFilter(session: Session | null) {
  if (!session?.user) return { id: "never" };

  const { role, empresaId, unidadeId } = session.user;

  // ADMIN vê tudo
  if (role === "ADMIN") {
    return {};
  }

  // RH vê todas unidades da empresa
  if (role === "RH") {
    return { empresaId: empresaId! };
  }

  // LIDERANCA vê apenas sua unidade (se definida)
  if (role === "LIDERANCA" && unidadeId) {
    return { id: unidadeId };
  }

  // LIDERANCA sem unidade vê todas da empresa (limitada por setor)
  if (role === "LIDERANCA" && !unidadeId) {
    return { empresaId: empresaId! };
  }

  return { id: "never" };
}

export function getSetorFilter(session: Session | null) {
  if (!session?.user) return { id: "never" };

  const { role, empresaId, unidadeId, setorId } = session.user;

  // ADMIN vê tudo
  if (role === "ADMIN") {
    return {};
  }

  // RH vê todos setores da empresa
  if (role === "RH") {
    return { unidade: { empresaId: empresaId! } };
  }

  // LIDERANCA com setor definido
  if (role === "LIDERANCA" && setorId) {
    return { id: setorId };
  }

  // LIDERANCA com unidade definida (mas sem setor)
  if (role === "LIDERANCA" && unidadeId && !setorId) {
    return { unidadeId: unidadeId };
  }

  // LIDERANCA sem restrições específicas
  if (role === "LIDERANCA" && !unidadeId && !setorId) {
    return { unidade: { empresaId: empresaId! } };
  }

  return { id: "never" };
}

export function getColaboradorFilter(session: Session | null) {
  if (!session?.user) return { id: "never" };

  const { role, empresaId, unidadeId, setorId } = session.user;

  // ADMIN vê todos
  if (role === "ADMIN") {
    return {};
  }

  // RH vê todos colaboradores da empresa
  if (role === "RH") {
    return { empresaId: empresaId! };
  }

  // LIDERANCA com setor definido
  if (role === "LIDERANCA" && setorId) {
    return { setorId: setorId };
  }

  // LIDERANCA com unidade definida
  if (role === "LIDERANCA" && unidadeId && !setorId) {
    return { unidadeId: unidadeId };
  }

  // LIDERANCA sem restrições específicas vê todos da empresa
  if (role === "LIDERANCA" && !unidadeId && !setorId) {
    return { empresaId: empresaId! };
  }

  return { id: "never" };
}
