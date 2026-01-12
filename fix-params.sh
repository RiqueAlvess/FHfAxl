#!/bin/bash

# Script para corrigir params como Promise em rotas do Next.js 15+

FILES=(
  "app/api/ciclos/[id]/route.ts"
  "app/api/admin/usuarios/[id]/route.ts"
  "app/api/admin/empresas/[id]/route.ts"
  "app/api/notificacoes/[id]/route.ts"
  "app/api/colaboradores/[id]/route.ts"
)

for file in "${FILES[@]}"; do
  echo "Corrigindo $file..."

  # Substituir { params }: { params: { id: string } } por { params }: { params: Promise<{ id: string }> }
  sed -i 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "$file"

  # Adicionar await params após declaração de session (primeira ocorrência após auth())
  # Isso é um pouco mais complexo, então vamos fazer manualmente para cada função
done

echo "Correções de tipo aplicadas. Agora é necessário adicionar 'const { id } = await params;' manualmente em cada função."
