# 🔧 Guia de Configuração - VIVAMENTE360

## ❌ Problema Identificado

O sistema estava apresentando erro de login "email ou senha inválidos" para todos os usuários. A causa raiz foi:

1. **Falta do arquivo `.env`**: O banco de dados não estava configurado
2. **Banco de dados vazio**: Não havia usuários cadastrados para fazer login
3. **Algoritmo de hash funcionando corretamente**: O código de autenticação está perfeito, usando bcrypt com 10 rounds

## ✅ Soluções Implementadas

### 1. Rota Oculta para Criação de Usuários

Foi criada uma rota especial `/FHfAxl/` que permite criar usuários diretamente no sistema:

- **URL**: `http://localhost:3000/FHfAxl/`
- **Funcionalidade**: Interface web para criar usuários rapidamente
- **Segurança**: Nome não convencional para manter a rota oculta
- **Hash de senha**: Automático usando bcrypt (10 rounds)

### 2. Arquivo `.env` Criado

O arquivo `.env` foi criado com todas as variáveis necessárias:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/vivamente360"
SHADOW_DATABASE_URL="postgresql://user:password@localhost:5432/vivamente360_shadow"
NEXTAUTH_SECRET="H5hbuNDPQM3oF1VXcchgKjv6ISy66geMrXPeBbDyBcw="
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Dashboard Confirmado

O dashboard já existe em `/app/(dashboard)/dashboard/page.tsx` e está totalmente funcional, exibindo:
- Total de colaboradores
- Taxa de adesão
- IGRP (Índice Geral de Risco Psicossocial)
- Classificação geral
- Gráficos e análises

## 🚀 Passos para Configurar o Banco de Dados

### Opção 1: PostgreSQL Local (Recomendado para Produção)

1. **Instalar PostgreSQL**:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib

   # macOS
   brew install postgresql
   ```

2. **Iniciar o serviço**:
   ```bash
   sudo service postgresql start
   ```

3. **Criar o banco de dados**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE vivamente360;
   CREATE DATABASE vivamente360_shadow;
   CREATE USER user WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE vivamente360 TO user;
   GRANT ALL PRIVILEGES ON DATABASE vivamente360_shadow TO user;
   \q
   ```

4. **Atualizar o `.env`** com as credenciais corretas:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/vivamente360"
   ```

### Opção 2: PostgreSQL com Docker (Mais Rápido)

1. **Criar e iniciar container**:
   ```bash
   docker run --name vivamente360-db \
     -e POSTGRES_USER=user \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=vivamente360 \
     -p 5432:5432 \
     -d postgres:15
   ```

2. **Verificar se está rodando**:
   ```bash
   docker ps
   ```

### Opção 3: Banco de Dados na Nuvem (Mais Fácil)

Use um serviço gratuito como:

- **Supabase** (https://supabase.com)
- **Neon** (https://neon.tech)
- **Railway** (https://railway.app)

Após criar o banco, copie a URL de conexão para o `.env`:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/database"
```

## 📦 Executar Migrations e Seed

Após configurar o banco de dados:

1. **Instalar dependências** (se ainda não fez):
   ```bash
   npm install
   ```

2. **Executar migrations** (criar tabelas):
   ```bash
   npx prisma migrate deploy
   # ou para desenvolvimento:
   npx prisma migrate dev
   ```

3. **Executar seed** (criar dados iniciais):
   ```bash
   npx tsx prisma/seed.ts
   ```

   Isso criará:
   - 1 Empresa exemplo
   - 1 Unidade
   - 1 Setor
   - 1 Cargo
   - **1 Usuário Admin**: `admin@exemplo.com` / `admin123`
   - 3 Colaboradores exemplo

## 🔐 Como Criar Usuários

### Método 1: Usando a Rota Oculta `/FHfAxl/`

1. Acesse: `http://localhost:3000/FHfAxl/`
2. Preencha o formulário:
   - Nome completo
   - Email
   - Senha (mínimo 8 caracteres)
   - Perfil (ADMIN, RH ou LIDERANCA)
   - Empresa, Unidade, Setor (opcional para ADMIN)
3. Clique em "Criar Usuário"

**⚠️ Importante:**
- Usuários **RH** e **LIDERANCA** devem estar vinculados a uma empresa
- Usuários **ADMIN** podem ser criados sem vínculos
- A senha será hasheada automaticamente

### Método 2: Usando o Seed

Edite o arquivo `prisma/seed.ts` e adicione mais usuários:

```typescript
await prisma.user.create({
  data: {
    email: 'seu@email.com',
    nome: 'Seu Nome',
    senha: await bcrypt.hash('suasenha123', 10),
    role: 'RH',
    ativo: true,
    empresaId: empresa.id,
  },
});
```

Depois execute:
```bash
npx tsx prisma/seed.ts
```

## 🧪 Testar o Login

1. **Inicie o servidor**:
   ```bash
   npm run dev
   ```

2. **Acesse o login**:
   ```
   http://localhost:3000/login
   ```

3. **Use as credenciais padrão**:
   - Email: `admin@exemplo.com`
   - Senha: `admin123`

4. **Você será redirecionado para**:
   - `/dashboard` (se for RH ou LIDERANCA)
   - `/admin` (se for ADMIN)

## 🔍 Verificação do Sistema de Hash

O sistema de autenticação está **funcionando corretamente**:

### Como funciona:

1. **Criação de usuário** (`prisma/seed.ts:66`):
   ```typescript
   const senhaHash = await bcrypt.hash('admin123', 10);
   ```
   - Biblioteca: `bcryptjs`
   - Algoritmo: bcrypt
   - Custo: 10 rounds
   - Hash armazenado na coluna `senha`

2. **Login** (`lib/auth.ts:54-57`):
   ```typescript
   const isValidPassword = await compare(senha, user.senha);
   if (!isValidPassword) {
     return null;
   }
   ```
   - Usa `compare()` do bcryptjs
   - Compara senha em texto plano com hash do banco
   - Retorna `true` se válida, `false` caso contrário

### Conversão de valores:

✅ **Está correta!** O sistema:
- Recebe senha em texto plano do formulário
- Busca usuário pelo email
- Compara usando `bcrypt.compare()`
- Não há conversão manual necessária (bcrypt faz automaticamente)

## 📋 Checklist de Configuração

- [ ] Arquivo `.env` criado
- [ ] Banco de dados PostgreSQL configurado e rodando
- [ ] URL de conexão atualizada no `.env`
- [ ] Migrations executadas (`npx prisma migrate deploy`)
- [ ] Seed executado (`npx tsx prisma/seed.ts`)
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Login testado com `admin@exemplo.com` / `admin123`
- [ ] Dashboard acessível após login

## 🛠️ Troubleshooting

### Erro: "Email ou senha inválidos"

1. Verifique se o banco de dados tem usuários:
   ```bash
   npx prisma studio
   ```
   - Abra o navegador em `http://localhost:5555`
   - Verifique a tabela `User`

2. Crie um usuário usando a rota `/FHfAxl/`

### Erro: "Invalid DATABASE_URL"

1. Verifique se o PostgreSQL está rodando:
   ```bash
   pg_isready
   ```

2. Teste a conexão:
   ```bash
   psql "postgresql://user:password@localhost:5432/vivamente360"
   ```

### Erro: "Module not found"

1. Reinstale as dependências:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🎯 Próximos Passos

1. Configure o banco de dados (escolha uma das opções acima)
2. Execute as migrations e seed
3. Teste o login com o usuário admin
4. Use a rota `/FHfAxl/` para criar novos usuários
5. Acesse o dashboard e comece a usar o sistema!

## 📞 Suporte

Se precisar de ajuda adicional, verifique:
- Logs do servidor no terminal
- Console do navegador (F12)
- Prisma Studio para visualizar dados (`npx prisma studio`)
