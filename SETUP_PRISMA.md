# Guia de Configuração do Prisma - VIVAMENTE360

## Problema Identificado

O erro `P3014` ocorre porque o Prisma Migrate precisa criar um banco de dados "shadow" temporário para validar as migrações, mas o usuário do PostgreSQL não tem permissão para criar novos bancos de dados.

## Solução Implementada

Foi configurado um banco de dados shadow dedicado no `schema.prisma` usando a variável `SHADOW_DATABASE_URL`.

## Passos para Configuração

### 1. Criar os Bancos de Dados no PostgreSQL

Conecte-se ao PostgreSQL com um usuário que tenha privilégios de criação de banco (geralmente `postgres`):

```bash
# Conectar ao PostgreSQL
sudo -u postgres psql

# Ou se você tiver senha configurada:
psql -U postgres -h localhost
```

Dentro do console do PostgreSQL, execute:

```sql
-- Criar o banco principal (se ainda não existir)
CREATE DATABASE nr1;

-- Criar o banco shadow para as migrações
CREATE DATABASE nr1_shadow;

-- Dar permissões ao seu usuário (substitua 'seu_usuario' pelo usuário correto)
GRANT ALL PRIVILEGES ON DATABASE nr1 TO seu_usuario;
GRANT ALL PRIVILEGES ON DATABASE nr1_shadow TO seu_usuario;

-- Sair do console
\q
```

### 2. Configurar as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (se ainda não existir) baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure as URLs do banco de dados:

```env
# Database - Ajuste as credenciais conforme seu ambiente
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/nr1"
SHADOW_DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/nr1_shadow"

# Outras variáveis necessárias...
NEXTAUTH_SECRET="sua-chave-secreta-minimo-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
# ... restante das variáveis
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Executar as Migrações

Agora você pode executar as migrações sem problemas:

```bash
# Criar e aplicar as migrações
npx prisma migrate dev --name init

# Gerar o Prisma Client (caso não tenha sido gerado automaticamente)
npx prisma generate
```

### 5. (Opcional) Popular o Banco com Dados Iniciais

Foi criado um arquivo `prisma/seed.ts` com dados iniciais de exemplo:

```bash
npx prisma db seed
```

Isso criará:
- 1 Empresa exemplo
- 1 Unidade
- 1 Setor
- 1 Cargo
- 1 Usuário Admin (email: `admin@exemplo.com`, senha: `admin123`)
- 3 Colaboradores exemplo

## Solução Alternativa (Sem Shadow Database)

Se você não puder criar um banco shadow, pode desabilitar temporariamente a verificação:

```bash
# Usar migrate deploy ao invés de migrate dev
npx prisma migrate deploy
```

**Nota:** Este método não valida as migrações e não deve ser usado em desenvolvimento ativo.

## Verificação

Para verificar se tudo está funcionando:

```bash
# Verificar status das migrações
npx prisma migrate status

# Abrir o Prisma Studio para visualizar os dados
npx prisma studio
```

## Troubleshooting

### Erro de Conexão com o Banco

Verifique se:
- O PostgreSQL está rodando: `sudo systemctl status postgresql`
- As credenciais no `.env` estão corretas
- O banco de dados existe: `psql -l`

### Permissões Negadas

Se ainda tiver problemas de permissão, conceda todas as permissões ao usuário:

```sql
ALTER USER seu_usuario CREATEDB;
```

## Próximos Passos

Após configurar o banco de dados:

1. Execute `npm run dev` para iniciar o servidor
2. Acesse `http://localhost:3000`
3. Faça login com as credenciais do admin criadas no seed

## Recursos Úteis

- [Documentação do Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Shadow Database](https://www.prisma.io/docs/concepts/components/prisma-migrate/shadow-database)
- [Troubleshooting](https://www.prisma.io/docs/guides/database/troubleshooting-orm)
