# VIVAMENTE360

Plataforma de Avaliação de Riscos Psicossociais - Conforme NR-1, LGPD, GRO/PGR

## Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript 5.x
- **Banco de Dados**: PostgreSQL 15+ com Prisma ORM
- **Autenticação**: NextAuth.js v5
- **UI**: Shadcn/ui + Tailwind CSS
- **Gráficos**: Recharts
- **Email**: Resend + React Email
- **Tabelas**: TanStack Table
- **Validação**: Zod
- **Formulários**: React Hook Form

## Estrutura do Projeto

```
vivamente360/
├── app/
│   ├── (auth)/              # Grupo de autenticação
│   │   └── login/           # Página de login
│   ├── (dashboard)/         # Área autenticada
│   │   ├── layout.tsx       # Layout com sidebar
│   │   └── dashboard/       # Dashboard principal
│   ├── api/
│   │   └── auth/            # NextAuth API routes
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   └── ui/                  # Shadcn/ui components
├── lib/
│   ├── prisma.ts            # Prisma client
│   ├── auth.ts              # NextAuth config
│   ├── email.ts             # Resend service
│   └── utils.ts             # Helpers
├── prisma/
│   └── schema.prisma        # Database schema
├── types/
│   └── next-auth.d.ts       # TypeScript types
└── middleware.ts            # Auth middleware
```

## Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vivamente360"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-min-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_QsmSYLiT_ErtMjZCKfKz7T3GKJjaWKKtM"
EMAIL_FROM="help@3sdev.com.br"

# App Configuration
MAGIC_LINK_EXPIRATION_HOURS=48
PASSWORD_RESET_EXPIRATION_HOURS=1
MIN_GROUP_SIZE=5
```

### 3. Configurar Banco de Dados

```bash
# Criar migrations
npx prisma migrate dev --name init

# Gerar Prisma Client
npx prisma generate

# (Opcional) Seed inicial
npx prisma db seed
```

### 4. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## Prisma Schema

O schema inclui os seguintes modelos:

- **User**: Usuários do sistema (ADMIN, RH, LIDERANCA)
- **Empresa**: Empresas cadastradas
- **Unidade**: Unidades organizacionais
- **Setor**: Setores dentro de unidades
- **Cargo**: Cargos dos colaboradores
- **Colaborador**: Colaboradores que respondem questionários
- **MagicLink**: Links mágicos para acesso aos questionários
- **CicloAvaliacao**: Ciclos de avaliação
- **Resposta**: Respostas dos questionários HSE-IT
- **PasswordResetToken**: Tokens para reset de senha
- **AuditLog**: Logs de auditoria

## Funcionalidades Implementadas

### ✅ Concluído

- [x] Estrutura base do Next.js 14
- [x] Configuração do TypeScript
- [x] Configuração do Tailwind CSS
- [x] Instalação de dependências
- [x] Prisma Schema completo
- [x] NextAuth.js configurado
- [x] Middleware de autenticação e autorização
- [x] Componentes UI Shadcn/ui (Button, Input, Card, Dialog, etc.)
- [x] Página de login
- [x] Layout do dashboard
- [x] Sistema de email com templates
- [x] Tipos TypeScript estendidos
- [x] Configuração de segurança (headers, CORS)

### 🚧 Em Desenvolvimento

- [ ] Módulo de gestão de colaboradores
- [ ] Importação CSV de colaboradores
- [ ] Sistema de magic links para questionários
- [ ] Questionário HSE-IT (35 perguntas)
- [ ] Algoritmo de scoring (0-140 pontos)
- [ ] Dashboard com 15+ visualizações
- [ ] Painel administrativo
- [ ] Sistema de relatórios
- [ ] K-Anonymity e LGPD compliance
- [ ] Rate limiting com Upstash
- [ ] Testes automatizados

## Perfis de Acesso

### ADMIN
- Acesso total ao sistema
- Painel administrativo
- CRUD de usuários e empresas
- Logs de auditoria

### RH
- Importar colaboradores
- Enviar magic links
- Visualizar dashboards completos
- Gerar relatórios

### LIDERANCA
- Visualizar dashboards filtrados por unidade
- Sem acesso a dados individuais

## Questionário HSE-IT

### Dimensões (35 perguntas)

1. **Demandas** (8 perguntas) - Polaridade NEGATIVA
2. **Controle** (6 perguntas) - Polaridade POSITIVA
3. **Apoio Gerencial** (5 perguntas) - Polaridade POSITIVA
4. **Apoio de Colegas** (4 perguntas) - Polaridade POSITIVA
5. **Relacionamentos** (4 perguntas) - Polaridade NEGATIVA
6. **Papel** (5 perguntas) - Polaridade POSITIVA
7. **Mudanças** (3 perguntas) - Polaridade POSITIVA

### Escala Likert

- 0: Nunca
- 1: Raramente
- 2: Às vezes
- 3: Frequentemente
- 4: Sempre

### Classificação de Risco

- **Satisfatório**: ≤ 40 pontos
- **Atenção**: 41-80 pontos
- **Crítico**: > 80 pontos

## Segurança

- ✅ HTTPS obrigatório em produção
- ✅ Headers de segurança (CSP, X-Frame-Options, etc.)
- ✅ Rate limiting
- ✅ Senhas hasheadas com bcrypt (12 rounds)
- ✅ Tokens seguros com nanoid
- ✅ Proteção CSRF
- ✅ Validação de input com Zod
- ✅ K-Anonymity (mínimo 5 respondentes)

## Conformidade LGPD

- ✅ Consentimento explícito
- ✅ K-Anonymity implementado
- ✅ Logs de auditoria
- ✅ Dados anonimizados em análises
- 🚧 Direitos do titular
- 🚧 Política de retenção
- 🚧 Portabilidade de dados

## Scripts

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Lint
npm run lint

# Prisma Studio
npx prisma studio
```

## Próximos Passos

1. Implementar CRUD de colaboradores
2. Sistema de importação CSV
3. Geração de magic links
4. Questionário HSE-IT completo
5. Algoritmo de scoring
6. Dashboard com visualizações
7. Painel administrativo
8. Testes automatizados

## Licença

Proprietary - © 2026 VIVAMENTE360

---

**Desenvolvido com Next.js 14 + TypeScript + Prisma**
