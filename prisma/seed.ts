import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (apenas em desenvolvimento)
  console.log('🧹 Limpando dados existentes...');
  await prisma.auditLog.deleteMany();
  await prisma.resposta.deleteMany();
  await prisma.magicLink.deleteMany();
  await prisma.cicloAvaliacao.deleteMany();
  await prisma.colaborador.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cargo.deleteMany();
  await prisma.setor.deleteMany();
  await prisma.unidade.deleteMany();
  await prisma.empresa.deleteMany();

  // Criar empresa exemplo
  console.log('🏢 Criando empresa exemplo...');
  const empresa = await prisma.empresa.create({
    data: {
      nome: 'Empresa Exemplo LTDA',
      cnpj: '12.345.678/0001-90',
      corPrimaria: '#2563eb',
      ativo: true,
    },
  });

  // Criar unidade exemplo
  console.log('🏭 Criando unidade exemplo...');
  const unidade = await prisma.unidade.create({
    data: {
      nome: 'Unidade Central',
      empresaId: empresa.id,
      ativo: true,
    },
  });

  // Criar setor exemplo
  console.log('📋 Criando setor exemplo...');
  const setor = await prisma.setor.create({
    data: {
      nome: 'Recursos Humanos',
      unidadeId: unidade.id,
      ativo: true,
    },
  });

  // Criar cargo exemplo
  console.log('💼 Criando cargo exemplo...');
  const cargo = await prisma.cargo.create({
    data: {
      nome: 'Analista de RH',
      setorId: setor.id,
      ativo: true,
    },
  });

  // Criar usuário admin
  console.log('👤 Criando usuário administrador...');
  const senhaHash = await bcrypt.hash('admin123', 10);

  await prisma.user.create({
    data: {
      email: 'admin@exemplo.com',
      nome: 'Administrador',
      senha: senhaHash,
      role: 'ADMIN',
      ativo: true,
      empresaId: empresa.id,
    },
  });

  // Criar alguns colaboradores exemplo
  console.log('👥 Criando colaboradores exemplo...');
  await prisma.colaborador.createMany({
    data: [
      {
        email: 'colaborador1@exemplo.com',
        empresaId: empresa.id,
        unidadeId: unidade.id,
        setorId: setor.id,
        cargoId: cargo.id,
        sexo: 'MASCULINO',
        ativo: true,
      },
      {
        email: 'colaborador2@exemplo.com',
        empresaId: empresa.id,
        unidadeId: unidade.id,
        setorId: setor.id,
        cargoId: cargo.id,
        sexo: 'FEMININO',
        ativo: true,
      },
      {
        email: 'colaborador3@exemplo.com',
        empresaId: empresa.id,
        unidadeId: unidade.id,
        setorId: setor.id,
        cargoId: cargo.id,
        sexo: 'NAO_INFORMADO',
        ativo: true,
      },
    ],
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📊 Dados criados:');
  console.log('   - 1 Empresa');
  console.log('   - 1 Unidade');
  console.log('   - 1 Setor');
  console.log('   - 1 Cargo');
  console.log('   - 1 Usuário Admin (admin@exemplo.com / admin123)');
  console.log('   - 3 Colaboradores');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
