#!/usr/bin/env tsx
/**
 * Script de Expurgo de Dados - LGPD
 *
 * Executa a política de retenção de dados, anonimizando
 * dados de colaboradores após o período legal de 5 anos.
 *
 * Uso:
 *   # Dry run (simulação)
 *   npm run expurgo:dry
 *
 *   # Execução real
 *   npm run expurgo:exec
 *
 *   # Com opções
 *   tsx scripts/expurgo-dados.ts --dry-run
 *   tsx scripts/expurgo-dados.ts --force
 */

import { executarExpurgoDados, obterEstatisticasRetencao } from '../lib/data-retention';

// ID do sistema para auditoria
const SYSTEM_USER_ID = 'system-expurgo';

interface ScriptOptions {
  dryRun: boolean;
  force: boolean;
  verbose: boolean;
}

function parseArgs(): ScriptOptions {
  const args = process.argv.slice(2);

  return {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    force: args.includes('--force') || args.includes('-f'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };
}

function exibirBanner() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║     VIVAMENTE360 - Expurgo de Dados (LGPD)               ║');
  console.log('║     Política de Retenção: 5 anos                         ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
}

async function exibirEstatisticas() {
  console.log('📊 Estatísticas de Retenção de Dados\n');

  const stats = await obterEstatisticasRetencao();

  console.log(`   Colaboradores ativos:                  ${stats.colaboradoresAtivos}`);
  console.log(`   Dados expiram este ano:                ${stats.colaboradoresExpiraramEsteAno}`);
  console.log(`   Dados expiram próximo ano:             ${stats.colaboradoresExpiramProximoAno}`);
  console.log(`   Dados já anonimizados (histórico):     ${stats.totalDadosAnonimizados}`);
  console.log('');
}

async function executarScript() {
  const options = parseArgs();

  exibirBanner();

  // Exibir estatísticas antes do expurgo
  await exibirEstatisticas();

  // Perguntar confirmação se não for dry-run e não tiver --force
  if (!options.dryRun && !options.force) {
    console.log('⚠️  ATENÇÃO: Você está prestes a executar o expurgo REAL de dados!');
    console.log('   Esta operação é irreversível e anonimizará dados permanentemente.');
    console.log('');
    console.log('   Para continuar, execute novamente com a flag --force:');
    console.log('   tsx scripts/expurgo-dados.ts --force');
    console.log('');
    console.log('   Ou faça um dry-run primeiro:');
    console.log('   tsx scripts/expurgo-dados.ts --dry-run');
    console.log('');
    process.exit(0);
  }

  // Executar expurgo
  const modo = options.dryRun ? '🔍 SIMULAÇÃO' : '🔥 EXECUÇÃO REAL';
  console.log(`${modo} - Iniciando expurgo de dados...`);
  console.log('');

  const resultado = await executarExpurgoDados(SYSTEM_USER_ID, options.dryRun);

  // Exibir resultados
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                    RESULTADO DO EXPURGO                   ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`   ✅ Colaboradores anonimizados:         ${resultado.colaboradoresAnonimizados}`);
  console.log(`   ✅ Respostas anonimizadas:             ${resultado.respostasAnonimizadas}`);
  console.log(`   ✅ Magic links removidos:              ${resultado.magicLinksRemovidos}`);
  console.log(`   ✅ Logs antigos limpos:                ${resultado.logsAntigos}`);
  console.log('');
  console.log(`   📅 Data de execução:                   ${resultado.timestamp.toLocaleString('pt-BR')}`);
  console.log('');

  if (resultado.erros.length > 0) {
    console.log('   ⚠️  ERROS ENCONTRADOS:');
    resultado.erros.forEach((erro, index) => {
      console.log(`      ${index + 1}. ${erro}`);
    });
    console.log('');
  }

  if (options.dryRun) {
    console.log('   ℹ️  Este foi um DRY RUN (simulação).');
    console.log('      Nenhuma alteração foi feita no banco de dados.');
    console.log('');
    console.log('   Para executar o expurgo real, use:');
    console.log('   tsx scripts/expurgo-dados.ts --force');
  } else {
    console.log('   ✅ Expurgo executado com sucesso!');
    console.log('   Dados foram anonimizados conforme política de retenção LGPD.');
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // Exibir estatísticas após o expurgo
  if (!options.dryRun) {
    console.log('📊 Estatísticas Atualizadas\n');
    await exibirEstatisticas();
  }
}

// Executar script
executarScript()
  .then(() => {
    console.log('✅ Script concluído com sucesso.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  });
