#!/bin/bash

# Script para configurar os bancos de dados do Prisma
# VIVAMENTE360 - Setup do Banco de Dados

set -e

echo "🗄️  VIVAMENTE360 - Configuração do Banco de Dados"
echo "=================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado!${NC}"
    echo "Criando .env a partir do .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado!${NC}"
    echo -e "${YELLOW}⚠️  Por favor, edite o arquivo .env com suas credenciais antes de continuar.${NC}"
    echo ""
    read -p "Pressione ENTER depois de configurar o .env..."
fi

# Carregar variáveis do .env
source .env

# Extrair informações da DATABASE_URL
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_SHADOW="${DB_NAME}_shadow"

echo "📋 Configurações detectadas:"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   Usuário: $DB_USER"
echo "   Banco principal: $DB_NAME"
echo "   Banco shadow: $DB_SHADOW"
echo ""

# Perguntar se deseja criar os bancos automaticamente
echo "Este script irá:"
echo "  1. Criar o banco de dados principal ($DB_NAME)"
echo "  2. Criar o banco de dados shadow ($DB_SHADOW)"
echo "  3. Conceder permissões ao usuário $DB_USER"
echo ""

read -p "Deseja continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operação cancelada."
    exit 1
fi

# Verificar se o PostgreSQL está rodando
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL não está respondendo em $DB_HOST:$DB_PORT${NC}"
    echo "Certifique-se de que o PostgreSQL está rodando:"
    echo "  sudo systemctl start postgresql"
    exit 1
fi

echo ""
echo "🔐 Digite a senha do usuário postgres (ou usuário com privilégios):"

# Criar os bancos de dados
PGPASSWORD="" psql -h $DB_HOST -p $DB_PORT -U postgres <<SQL
-- Criar banco principal se não existir
SELECT 'CREATE DATABASE $DB_NAME'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Criar banco shadow se não existir
SELECT 'CREATE DATABASE $DB_SHADOW'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_SHADOW')\gexec

-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_SHADOW TO $DB_USER;

-- Permitir que o usuário crie bancos (útil para futuras migrações)
ALTER USER $DB_USER CREATEDB;
SQL

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Bancos de dados criados com sucesso!${NC}"
    echo ""

    # Instalar dependências
    echo "📦 Instalando dependências..."
    npm install

    # Executar migrações
    echo ""
    echo "🔄 Executando migrações do Prisma..."
    npx prisma migrate dev --name init

    # Perguntar se deseja executar o seed
    echo ""
    read -p "Deseja popular o banco com dados iniciais? (s/N): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "🌱 Executando seed..."
        npx prisma db seed
    fi

    echo ""
    echo -e "${GREEN}✅ Configuração concluída com sucesso!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "  1. Execute 'npm run dev' para iniciar o servidor"
    echo "  2. Acesse http://localhost:3000"
    echo "  3. Faça login com: admin@exemplo.com / admin123"
    echo ""
else
    echo -e "${RED}❌ Erro ao criar os bancos de dados${NC}"
    echo ""
    echo "Você pode criar manualmente executando:"
    echo "  sudo -u postgres psql"
    echo ""
    echo "E depois executar:"
    echo "  CREATE DATABASE $DB_NAME;"
    echo "  CREATE DATABASE $DB_SHADOW;"
    echo "  GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    echo "  GRANT ALL PRIVILEGES ON DATABASE $DB_SHADOW TO $DB_USER;"
    exit 1
fi
