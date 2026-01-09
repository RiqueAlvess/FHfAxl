# Migração do Banco de Dados - Admin Access Control

## Resumo das Mudanças

Esta migração implementa o novo sistema de controle de acesso com as seguintes mudanças:

### Mudanças no Schema

1. **User.empresaId** agora é **opcional** (nullable)
   - Permite que usuários ADMIN existam sem vínculo a uma empresa específica
   - RH e LIDERANÇA continuam obrigatoriamente vinculados a uma empresa

2. **User.setorId** foi **adicionado** (opcional)
   - Permite que usuários LIDERANÇA sejam limitados a um setor específico
   - Campo opcional: null = sem limitação de setor

### Regras de Negócio por Role

#### ADMIN
- **Independente de empresa**: `empresaId` = null
- **Acessa tudo**: todas empresas, unidades, setores e colaboradores
- **Painel exclusivo**: `/admin` para gerenciar usuários e acessos
- Não deve ter `unidadeId` ou `setorId` preenchidos

#### RH
- **Vinculado a UMA empresa**: `empresaId` obrigatório
- **Vê todos os dados da empresa**: todas unidades, setores e cargos
- Não deve ter `unidadeId` ou `setorId` preenchidos
- Não tem acesso ao painel admin

#### LIDERANÇA
- **Vinculado a uma empresa**: `empresaId` obrigatório
- **Pode ser limitado por unidade**: `unidadeId` opcional
- **Pode ser limitado por setor**: `setorId` opcional
- Restrições:
  - Se apenas `unidadeId` preenchido: vê toda a unidade
  - Se `unidadeId` e `setorId` preenchidos: vê apenas o setor
  - Se apenas `setorId` preenchido: vê apenas o setor
  - Se nenhum preenchido: vê toda a empresa (mesmo comportamento que RH)

## Como Aplicar a Migração

### Opção 1: Usando Prisma Migrate (Recomendado)

```bash
npx prisma migrate deploy
```

### Opção 2: Aplicar SQL Manualmente

Execute o SQL em `prisma/migrations/20260109000000_add_admin_access_control/migration.sql` diretamente no banco de dados:

```sql
-- AlterTable - Tornar empresaId opcional
ALTER TABLE "User" ALTER COLUMN "empresaId" DROP NOT NULL;

-- AlterTable - Adicionar setorId opcional
ALTER TABLE "User" ADD COLUMN "setorId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_setorId_fkey"
  FOREIGN KEY ("setorId") REFERENCES "Setor"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
```

### Opção 3: Resetar e Recriar (Desenvolvimento)

**ATENÇÃO: Isso apaga todos os dados!**

```bash
npx prisma migrate reset
npx prisma migrate deploy
```

## Verificação Pós-Migração

Após aplicar a migração, verifique:

1. **Schema atualizado**:
   ```bash
   npx prisma db pull
   npx prisma generate
   ```

2. **Dados existentes**:
   - Todos usuários RH e LIDERANÇA devem ter `empresaId` preenchido
   - Usuários ADMIN podem ter `empresaId` null

3. **Criar primeiro usuário ADMIN** (se não existir):
   ```sql
   INSERT INTO "User" (id, email, nome, senha, role, ativo, "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid()::text,
     'admin@sistema.com',
     'Administrador Master',
     '$2a$10$exemplo-de-hash-bcrypt',  -- Trocar por hash real
     'ADMIN',
     true,
     NOW(),
     NOW()
   );
   ```

## Novos Recursos Implementados

### 1. Biblioteca de Autorização (`/lib/authorization.ts`)

Funções auxiliares para verificar permissões:
- `canAccessAdminPanel()` - Verifica se pode acessar o painel admin
- `canAccessCompany()` - Verifica acesso a uma empresa específica
- `canAccessUnidade()` - Verifica acesso a uma unidade
- `canAccessSetor()` - Verifica acesso a um setor
- `getColaboradorFilter()` - Retorna filtro Prisma baseado em permissões

### 2. Painel Admin (`/app/(admin)/admin/`)

- **Dashboard Admin**: Estatísticas gerais do sistema
- **Gerenciar Usuários**: CRUD completo de usuários com controle de roles
- **Gerenciar Empresas**: (estrutura criada, implementação futura)
- **Logs de Auditoria**: (estrutura criada, implementação futura)

### 3. Middleware Atualizado

- ADMIN é redirecionado automaticamente para `/admin` ao invés de `/dashboard`
- Proteção de rotas `/admin/*` apenas para ADMIN
- Validação de roles em todas as rotas protegidas

## Próximos Passos

1. Aplicar a migração no banco de dados
2. Gerar o Prisma Client: `npx prisma generate`
3. Criar o primeiro usuário ADMIN
4. Testar o painel admin
5. Atualizar seed do Prisma se necessário

## Rollback (Em caso de problemas)

Para reverter esta migração:

```sql
-- Remover foreign key
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_setorId_fkey";

-- Remover coluna setorId
ALTER TABLE "User" DROP COLUMN IF EXISTS "setorId";

-- Tornar empresaId obrigatório novamente (cuidado: só funciona se todos tiverem empresaId)
-- ALTER TABLE "User" ALTER COLUMN "empresaId" SET NOT NULL;
```

**IMPORTANTE**: Não torne `empresaId` obrigatório novamente se houver usuários ADMIN sem empresa!
