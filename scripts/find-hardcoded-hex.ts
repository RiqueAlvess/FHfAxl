#!/usr/bin/env tsx

/**
 * Script para detectar cores hex hardcoded no código
 *
 * Uso: npm run scan:hex
 *
 * Este script escaneia todos os arquivos .tsx, .ts, .css, .module.css
 * em busca de padrões de cores hexadecimais (#XXXXXX) e gera um
 * relatório JSON com as ocorrências encontradas.
 */

import * as fs from 'fs'
import * as path from 'path'

interface HexOccurrence {
  file: string
  line: number
  column: number
  hex: string
  context: string
  suggestedToken?: string
}

interface ScanReport {
  scannedAt: string
  totalFiles: number
  filesWithHex: number
  totalOccurrences: number
  occurrences: HexOccurrence[]
}

// Padrão regex para detectar hex (#RGB ou #RRGGBB)
const HEX_PATTERN = /#(?:[0-9a-fA-F]{3}){1,2}\b/g

// Diretórios a serem escaneados
const SCAN_DIRS = ['app', 'components', 'lib', 'styles', 'utils']

// Diretórios a ignorar
const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', 'coverage']

// Arquivos a ignorar (whitelist - podem ter hex)
const IGNORE_FILES = [
  'design-tokens.module.css',
  'design-tokens.json',
  'chartColors.ts',
  'find-hardcoded-hex.ts',
]

// Extensões de arquivo a escanear
const SCAN_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css', '.module.css']

// Mapeamento de hex para tokens sugeridos
const HEX_TO_TOKEN_MAP: Record<string, string> = {
  '#0F3D52': '--primary',
  '#8B5CF6': '--accent',
  '#C4B5FD': '--accent-light',
  '#FFFFFF': '--foreground (ou branco puro)',
  '#000000': '--background (ou preto puro)',
  '#EF4444': '--destructive ou --chart-red',
  '#F97316': '--chart-orange',
  '#FACC15': '--warning ou --chart-yellow',
  '#22C55E': '--success ou --chart-green',
  '#3B82F6': '--info ou --chart-blue',
  '#EC4899': '--chart-pink',
  '#06B6D4': '--chart-cyan',
  '#FAFAFA': '--foreground (zinc-50)',
  '#18181B': '--background (zinc-950)',
  '#27272A': '--card (zinc-900)',
  '#3F3F46': '--secondary ou --border (zinc-800)',
  '#A1A1AA': '--muted-foreground (zinc-400)',
}

/**
 * Verifica se um diretório deve ser ignorado
 */
function shouldIgnoreDir(dirName: string): boolean {
  return IGNORE_DIRS.some((ignore) => dirName.includes(ignore))
}

/**
 * Verifica se um arquivo deve ser ignorado
 */
function shouldIgnoreFile(fileName: string): boolean {
  return IGNORE_FILES.some((ignore) => fileName.includes(ignore))
}

/**
 * Verifica se a extensão do arquivo é válida para escaneamento
 */
function isValidExtension(fileName: string): boolean {
  return SCAN_EXTENSIONS.some((ext) => fileName.endsWith(ext))
}

/**
 * Escaneia um arquivo em busca de hex hardcoded
 */
function scanFile(filePath: string): HexOccurrence[] {
  const occurrences: HexOccurrence[] = []

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    lines.forEach((line, lineIndex) => {
      let match: RegExpExecArray | null

      // Reset regex
      HEX_PATTERN.lastIndex = 0

      while ((match = HEX_PATTERN.exec(line)) !== null) {
        const hex = match[0].toUpperCase()
        const suggestedToken = HEX_TO_TOKEN_MAP[hex]

        occurrences.push({
          file: filePath,
          line: lineIndex + 1,
          column: match.index + 1,
          hex,
          context: line.trim().substring(Math.max(0, match.index - 20), match.index + 30),
          suggestedToken,
        })
      }
    })
  } catch (error) {
    console.error(`Erro ao escanear arquivo ${filePath}:`, error)
  }

  return occurrences
}

/**
 * Escaneia um diretório recursivamente
 */
function scanDirectory(dirPath: string): HexOccurrence[] {
  let occurrences: HexOccurrence[] = []

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        if (!shouldIgnoreDir(entry.name)) {
          occurrences = occurrences.concat(scanDirectory(fullPath))
        }
      } else if (entry.isFile()) {
        if (!shouldIgnoreFile(entry.name) && isValidExtension(entry.name)) {
          const fileOccurrences = scanFile(fullPath)
          occurrences = occurrences.concat(fileOccurrences)
        }
      }
    }
  } catch (error) {
    console.error(`Erro ao escanear diretório ${dirPath}:`, error)
  }

  return occurrences
}

/**
 * Função principal
 */
function main() {
  console.log('🔍 Iniciando escaneamento de cores hex hardcoded...\n')

  const startTime = Date.now()
  let allOccurrences: HexOccurrence[] = []
  const scannedFiles = new Set<string>()

  // Escanear cada diretório
  for (const dir of SCAN_DIRS) {
    const dirPath = path.join(process.cwd(), dir)

    if (fs.existsSync(dirPath)) {
      console.log(`📁 Escaneando ${dir}/...`)
      const occurrences = scanDirectory(dirPath)
      allOccurrences = allOccurrences.concat(occurrences)

      occurrences.forEach((occ) => scannedFiles.add(occ.file))
    }
  }

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)

  // Contar arquivos únicos com hex
  const filesWithHex = new Set(allOccurrences.map((occ) => occ.file))

  // Criar relatório
  const report: ScanReport = {
    scannedAt: new Date().toISOString(),
    totalFiles: scannedFiles.size,
    filesWithHex: filesWithHex.size,
    totalOccurrences: allOccurrences.length,
    occurrences: allOccurrences,
  }

  // Criar diretório reports se não existir
  const reportsDir = path.join(process.cwd(), 'reports')
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }

  // Salvar relatório
  const reportPath = path.join(reportsDir, 'hardcoded-hex.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8')

  // Imprimir resumo
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMO DO ESCANEAMENTO')
  console.log('='.repeat(60))
  console.log(`⏱️  Tempo de execução: ${duration}s`)
  console.log(`📄 Arquivos escaneados: ${scannedFiles.size}`)
  console.log(`⚠️  Arquivos com hex hardcoded: ${filesWithHex.size}`)
  console.log(`🎨 Total de ocorrências: ${allOccurrences.length}`)
  console.log(`💾 Relatório salvo em: ${reportPath}`)
  console.log('='.repeat(60))

  // Imprimir top 10 ocorrências
  if (allOccurrences.length > 0) {
    console.log('\n📝 Top 10 ocorrências:\n')

    allOccurrences.slice(0, 10).forEach((occ, index) => {
      console.log(`${index + 1}. ${occ.file}:${occ.line}:${occ.column}`)
      console.log(`   Hex: ${occ.hex}`)
      if (occ.suggestedToken) {
        console.log(`   💡 Sugestão: Use ${occ.suggestedToken}`)
      }
      console.log(`   Contexto: ${occ.context}`)
      console.log()
    })

    // Código de saída 1 se encontrar hex hardcoded
    console.log(
      '❌ Hex hardcoded detectado! Por favor, substitua por variáveis CSS dos design tokens.\n'
    )
    process.exit(1)
  } else {
    console.log('\n✅ Nenhum hex hardcoded encontrado! Parabéns! 🎉\n')
    process.exit(0)
  }
}

// Executar
main()
