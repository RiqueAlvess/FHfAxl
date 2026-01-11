#!/usr/bin/env node

/**
 * Script de Limpeza de Relatórios Temporários
 *
 * Uso:
 * node scripts/cleanup-reports.js
 *
 * Ou via cron (adicionar ao crontab):
 * 0 * * * * cd /path/to/project && node scripts/cleanup-reports.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
  console.error('Erro: CRON_SECRET não configurado no .env');
  process.exit(1);
}

const url = new URL('/api/relatorios/cleanup', BASE_URL);
const protocol = url.protocol === 'https:' ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CRON_SECRET}`,
    'Content-Type': 'application/json',
  },
};

console.log(`Executando limpeza de relatórios em ${BASE_URL}...`);

const req = protocol.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const resultado = JSON.parse(data);

      if (resultado.sucesso) {
        console.log('✓ Limpeza executada com sucesso');
        console.log(`  - Arquivos removidos: ${resultado.removidos}`);
        console.log(`  - Erros: ${resultado.erros}`);
        process.exit(0);
      } else {
        console.error('✗ Erro na limpeza:', resultado.erro);
        process.exit(1);
      }
    } catch (error) {
      console.error('✗ Erro ao processar resposta:', error);
      console.error('Resposta:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('✗ Erro ao conectar:', error);
  process.exit(1);
});

req.end();
