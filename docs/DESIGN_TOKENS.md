# Design Tokens - VIVAMENTE360

Sistema de design tokens centralizado para garantir consistência visual e facilitar manutenção do projeto.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Tokens de Cores](#tokens-de-cores)
- [Tokens de Espaçamento](#tokens-de-espaçamento)
- [Tokens de Animação](#tokens-de-animação)
- [Como Usar](#como-usar)
- [Regras e Boas Práticas](#regras-e-boas-práticas)
- [Exportação para Design Tools](#exportação-para-design-tools)

## 🎨 Visão Geral

O sistema de design tokens do VIVAMENTE360 é baseado em variáveis CSS (custom properties) que definem todas as cores, espaçamentos, animações e outros valores de design usados na aplicação.

**Benefícios:**
- ✅ Consistência visual em toda a aplicação
- ✅ Fácil manutenção e alterações de tema
- ✅ Suporte a temas dark/light
- ✅ Type-safe com TypeScript
- ✅ Exportação para ferramentas de design (Figma, etc.)

## 📁 Estrutura de Arquivos

```
styles/
├── design-tokens.module.css    # Tokens CSS (variáveis)
└── animations.module.css       # Animações e keyframes

design-tokens.json              # Exportação JSON para design tools

utils/
└── chartColors.ts              # Paleta de cores para gráficos
```

## 🎨 Tokens de Cores

### Core Colors

| Token | HEX | HSL | Uso |
|-------|-----|-----|-----|
| `--primary` | `#0F3D52` | `198 72% 19%` | Cor principal da marca (Teal escuro) |
| `--primary-foreground` | `#FFFFFF` | `0 0% 100%` | Texto sobre primary |
| `--accent` | `#8B5CF6` | `262.1 83.3% 57.8%` | Cor de destaque (Violet 500) |
| `--accent-light` | `#C4B5FD` | `266 100% 77%` | Accent claro para gradientes |
| `--accent-foreground` | `#FFFFFF` | `0 0% 100%` | Texto sobre accent |

### Background & Foreground

| Token | HEX | HSL | Uso |
|-------|-----|-----|-----|
| `--background` | `#18181B` | `240 5.9% 10%` | Fundo principal (Zinc 950) |
| `--foreground` | `#FAFAFA` | `240 5% 96%` | Texto principal (Zinc 50) |

### UI Elements

| Token | HEX | HSL | Uso |
|-------|-----|-----|-----|
| `--card` | `#27272A` | `240 4% 16%` | Background de cards (Zinc 900) |
| `--card-foreground` | `#FAFAFA` | `240 5% 96%` | Texto em cards |
| `--popover` | `#27272A` | `240 4% 16%` | Background de popovers/dropdowns |
| `--popover-foreground` | `#FAFAFA` | `240 5% 96%` | Texto em popovers |
| `--secondary` | `#3F3F46` | `240 3.7% 15.9%` | Cor secundária (Zinc 800) |
| `--secondary-foreground` | `#FAFAFA` | `240 5% 96%` | Texto sobre secondary |
| `--muted` | `#3F3F46` | `240 3.7% 15.9%` | Background silenciado |
| `--muted-foreground` | `#A1A1AA` | `240 5% 64.9%` | Texto silenciado (Zinc 400) |
| `--border` | `#3F3F46` | `240 3.7% 15.9%` | Cor de bordas (Zinc 800) |
| `--input` | `#3F3F46` | `240 3.7% 15.9%` | Background de inputs |
| `--ring` | `#8B5CF6` | `262.1 83.3% 57.8%` | Focus ring (acessibilidade) |

### Semantic Colors

| Token | HEX | HSL | Uso |
|-------|-----|-----|-----|
| `--success` | `#22C55E` | `142 71% 45%` | Sucesso e confirmações (Green 500) |
| `--warning` | `#FACC15` | `45 93% 47%` | Avisos (Yellow 500) |
| `--destructive` | `#EF4444` | `0 72% 51%` | Erros e ações destrutivas (Red 500) |
| `--info` | `#3B82F6` | `221 83% 53%` | Informações (Blue 500) |

### Chart Colors

| Token | HEX | HSL | Uso |
|-------|-----|-----|-----|
| `--chart-red` | `#EF4444` | `0 72% 51%` | Gráficos - Vermelho |
| `--chart-orange` | `#F97316` | `25 95% 53%` | Gráficos - Laranja |
| `--chart-yellow` | `#FACC15` | `45 93% 47%` | Gráficos - Amarelo |
| `--chart-green` | `#22C55E` | `142 71% 45%` | Gráficos - Verde |
| `--chart-blue` | `#3B82F6` | `221 83% 53%` | Gráficos - Azul |
| `--chart-violet` | `#8B5CF6` | `262.1 83.3% 57.8%` | Gráficos - Violeta |
| `--chart-pink` | `#EC4899` | `330 81% 60%` | Gráficos - Rosa |
| `--chart-cyan` | `#06B6D4` | `189 94% 43%` | Gráficos - Ciano |

## 📏 Tokens de Espaçamento

### Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius` | `0.5rem` (8px) | Padrão |
| `--radius-sm` | `0.25rem` (4px) | Pequeno |
| `--radius-md` | `0.375rem` (6px) | Médio |
| `--radius-lg` | `0.5rem` (8px) | Grande |
| `--radius-xl` | `0.75rem` (12px) | Extra grande |
| `--radius-2xl` | `1rem` (16px) | 2x extra grande |
| `--radius-full` | `9999px` | Circular |

### Layout

| Token | Valor | Uso |
|-------|-------|-----|
| `--sidebar-width` | `16rem` (256px) | Largura da sidebar expandida |
| `--sidebar-collapsed-width` | `4rem` (64px) | Largura da sidebar colapsada |
| `--header-height` | `4rem` (64px) | Altura do header |

## ⚡ Tokens de Animação

### Timing Functions

| Token | Valor | Uso |
|-------|-------|-----|
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Entrada e saída suaves |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Saída suave |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Entrada suave |

### Durations

| Token | Valor | Uso |
|-------|-------|-----|
| `--duration-fast` | `150ms` | Animações rápidas |
| `--duration-normal` | `300ms` | Animações normais |
| `--duration-slow` | `500ms` | Animações lentas |

### Keyframes Disponíveis

- `fadeInUp` - Fade in com movimento para cima
- `fadeIn` - Fade in simples
- `fadeOut` - Fade out simples
- `slideInRight` - Desliza da direita
- `slideInLeft` - Desliza da esquerda
- `slideDown` - Desliza para baixo
- `scaleIn` - Escala com fade
- `successPop` - Pop de sucesso (escala com bounce)
- `confetti` - Efeito confetti (queda rotacionando)
- `pulse` - Pulsação
- `bounce` - Quique
- `spin` - Rotação
- `shimmer` - Shimmer (skeleton loader)
- `shake` - Tremor
- `wiggle` - Balanço

## 💻 Como Usar

### Em CSS/Tailwind

```css
/* Usando variáveis CSS diretamente */
.my-component {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-radius: var(--radius);
  transition-duration: var(--duration-normal);
}

/* Usando classes Tailwind (já configuradas) */
<div class="bg-primary text-primary-foreground rounded-lg">
  Conteúdo
</div>
```

### Em TypeScript/React

```tsx
import { CHART_COLORS } from '@/utils/chartColors'

// Usando cores para gráficos
const chartData = {
  datasets: [{
    backgroundColor: CHART_COLORS.violet,
    borderColor: CHART_COLORS.violet,
  }]
}

// Obtendo valor CSS no runtime
import { getCSSVariable } from '@/utils/chartColors'

const primaryColor = getCSSVariable('--primary', '#0F3D52')
```

### Componentes com Gradiente

```tsx
import { ProgressBar } from '@/components/ui/progress-bar'

// ProgressBar usa gradiente de --accent para --accent-light
<ProgressBar value={75} variant="accent" showLabel />
```

### Animações

```tsx
// Importar no globals.css
@import '../styles/animations.module.css';

// Usar classes de animação
<div className="animate-fadeInUp">
  Conteúdo com animação
</div>

<div className="animate-successPop delay-300">
  Animação com delay
</div>
```

## 🚫 Regras e Boas Práticas

### ❌ PROIBIDO

1. **Nunca usar cores hex hardcoded** em componentes `.tsx`, `.ts`, `.css`
   ```tsx
   // ❌ ERRADO
   <div style={{ color: '#8B5CF6' }}>

   // ✅ CORRETO
   <div className="text-accent">
   // ou
   <div style={{ color: 'hsl(var(--accent))' }}>
   ```

2. **Nunca usar valores de espaçamento hardcoded** (exceto quando necessário)
   ```css
   /* ❌ ERRADO */
   border-radius: 8px;

   /* ✅ CORRETO */
   border-radius: var(--radius);
   ```

### ✅ RECOMENDADO

1. **Sempre usar variáveis CSS** para cores, espaçamentos, animações
2. **Usar classes Tailwind** quando possível (já configuradas com tokens)
3. **Para gráficos**, usar `CHART_COLORS` de `utils/chartColors.ts`
4. **Executar `npm run scan:hex`** antes de commits para detectar hex hardcoded

### 🔍 Verificação de Hex Hardcoded

Execute o script de escaneamento:

```bash
npm run scan:hex
```

Este script:
- Escaneia todos os arquivos `.tsx`, `.ts`, `.css`
- Detecta cores hex hardcoded (`#XXXXXX`)
- Gera relatório em `reports/hardcoded-hex.json`
- Sugere tokens CSS para substituir cada hex
- Falha se encontrar hex hardcoded (útil para CI/CD)

**Exceções permitidas:**
- `design-tokens.module.css` (definição dos tokens)
- `design-tokens.json` (exportação)
- `chartColors.ts` (mapeamento central)
- `find-hardcoded-hex.ts` (o próprio script)

## 🎨 Exportação para Design Tools

### Figma / Sketch

O arquivo `design-tokens.json` contém todos os tokens em formato JSON estruturado, compatível com:
- Figma Tokens Plugin
- Sketch Design Tokens
- Adobe XD

```json
{
  "tokens": {
    "colors": {
      "primary": {
        "value": "#0F3D52",
        "hsl": "198 72% 19%",
        "description": "Cor principal da marca - Teal escuro"
      }
    }
  }
}
```

### Uso Programático

```typescript
import tokens from '@/design-tokens.json'

const primaryColor = tokens.tokens.colors.primary.value // "#0F3D52"
const primaryHSL = tokens.tokens.colors.primary.hsl     // "198 72% 19%"
```

## 🔄 Atualizando Tokens

Para adicionar ou modificar tokens:

1. **Editar** `styles/design-tokens.module.css`
2. **Atualizar** `design-tokens.json` (manter sincronizado)
3. **Se for cor para gráficos**, adicionar em `utils/chartColors.ts`
4. **Documentar** neste arquivo (`DESIGN_TOKENS.md`)
5. **Executar** `npm run scan:hex` para verificar integridade
6. **Testar** a aplicação em dark/light mode (se aplicável)

## 📚 Referências

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Design Tokens Community Group](https://www.designtokens.org/)
- [Tailwind CSS Theme Configuration](https://tailwindcss.com/docs/theme)
- [HSL Color Model](https://en.wikipedia.org/wiki/HSL_and_HSV)

## 🤝 Contribuindo

Ao contribuir com novos componentes ou estilos:

1. **Sempre use tokens** existentes quando possível
2. **Se precisar nova cor**, adicione como token (não hardcode)
3. **Documente** uso recomendado do novo token
4. **Execute** `npm run scan:hex` antes de commit
5. **Teste** em diferentes resoluções e temas

---

**Última atualização:** 2026-01-12
**Versão dos tokens:** 1.0.0
