# Rate Limiting - VIVAMENTE360

## Visão Geral

O VIVAMENTE360 implementa rate limiting em todos os endpoints críticos para:

- **Prevenir abuso**: Proteger contra ataques de força bruta, spam e uso excessivo
- **Proteger recursos**: Evitar sobrecarga do banco de dados e serviços externos (email, geração de relatórios)
- **Garantir disponibilidade**: Manter a aplicação disponível para todos os usuários
- **Conformidade LGPD**: Registrar todas as tentativas bloqueadas para auditoria

## Tecnologia

- **Redis (Upstash)**: Armazenamento distribuído para rate limiting
- **@upstash/ratelimit**: Biblioteca oficial com algoritmo sliding window
- **Fallback in-memory**: Sistema alternativo quando Redis não está configurado

## Configuração

### 1. Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
# Redis (Upstash) - for rate limiting
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
```

### 2. Criar conta no Upstash

1. Acesse [upstash.com](https://upstash.com)
2. Crie uma conta gratuita
3. Crie um novo banco de dados Redis
4. Copie as credenciais REST URL e TOKEN
5. Adicione ao `.env`

### 3. Sem Redis (Fallback)

Se as variáveis não estiverem configuradas:

- ⚠️ O sistema usará rate limiting in-memory
- ✅ A aplicação continuará funcionando normalmente
- ⚠️ Os limites serão resetados quando o servidor reiniciar
- ⚠️ Não funciona em ambientes serverless ou multi-instância

## Limites por Endpoint

### Endpoints Críticos (Alta Proteção)

| Endpoint | Método | Identificador | Limite | Janela | Razão |
|----------|--------|---------------|--------|--------|-------|
| `/api/magic-link/generate` | POST | userId | 5 req | 10 min | Prevenir spam de emails |
| `/api/magic-link/resend` | POST | userId | 5 req | 10 min | Prevenir spam de emails |
| `/api/magic-link/validate` | GET | IP | 10 req | 1 min | Prevenir descoberta de tokens |
| `/api/questionario/submit` | POST | IP+token | 1 req | 30 seg | Prevenir submissões duplicadas |
| `/api/colaboradores/import-csv` | POST | userId | 3 req | 1 min | Prevenir sobrecarga do banco |
| `/api/relatorios/pdf` | POST | userId | 2 req | 1 min | Prevenir sobrecarga de CPU/IO |
| `/api/relatorios/excel` | POST | userId | 2 req | 1 min | Prevenir sobrecarga de CPU/IO |

### Endpoints de Analytics

| Endpoint | Método | Identificador | Limite | Janela |
|----------|--------|---------------|--------|--------|
| `/api/dashboard/analytics` | GET | userId | 30 req | 1 min |

### Endpoints de Leitura

| Endpoint | Método | Identificador | Limite | Janela |
|----------|--------|---------------|--------|--------|
| `/api/colaboradores` | GET | userId | 60 req | 1 min |
| `/api/ciclos` | GET | userId | 60 req | 1 min |
| `/api/unidades` | GET | userId | 60 req | 1 min |
| `/api/setores` | GET | userId | 60 req | 1 min |
| `/api/cargos` | GET | userId | 60 req | 1 min |

### Endpoints de Escrita

| Endpoint | Método | Identificador | Limite | Janela |
|----------|--------|---------------|--------|--------|
| `/api/colaboradores` | POST | userId | 30 req | 1 min |
| `/api/ciclos` | POST | userId | 30 req | 1 min |

## Resposta ao Usuário

### Headers HTTP

Todas as respostas incluem headers informativos:

```http
X-RateLimit-Limit: 5          # Limite máximo
X-RateLimit-Remaining: 3       # Requisições restantes
X-RateLimit-Reset: 1704067200  # Timestamp Unix do reset
```

### Resposta 429 (Too Many Requests)

Quando o limite é excedido:

```json
{
  "error": "Muitas requisições. Por favor, aguarde antes de tentar novamente.",
  "message": "Você excedeu o limite de 5 requisições. Tente novamente em 120 segundos.",
  "retryAfter": 120
}
```

Headers adicionais:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 120
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704067200
```

## Auditoria e Logging

### Registro de Bloqueios

Todas as tentativas bloqueadas são registradas no `AuditLog`:

```typescript
{
  userId: "user123" ou "system",
  action: "RATE_LIMIT_EXCEEDED",
  entity: "magic-link:generate",
  details: {
    identifier: "user123",
    limit: 5,
    reset: 1704067200,
    ip: "192.168.1.1",
    userAgent: "Mozilla/5.0...",
    endpoint: "/api/magic-link/generate"
  },
  ipAddress: "192.168.1.1",
  timestamp: "2024-01-01T12:00:00Z"
}
```

### Conformidade LGPD

- ✅ Todas as tentativas bloqueadas são auditadas
- ✅ IP e User Agent são registrados
- ✅ Timestamps precisos para rastreabilidade
- ✅ Dados disponíveis para relatórios de conformidade

## Arquitetura

### Estrutura de Arquivos

```
lib/
├── rate-limit.ts              # Configuração dos rate limiters
├── rate-limit-helpers.ts      # Funções utilitárias
└── audit-log.ts               # Sistema de auditoria (já existente)

app/api/
├── magic-link/
│   ├── generate/route.ts      # ✅ Rate limiting aplicado
│   ├── resend/route.ts        # ✅ Rate limiting aplicado
│   └── validate/route.ts      # ✅ Rate limiting aplicado
├── questionario/
│   └── submit/route.ts        # ✅ Rate limiting aplicado
├── colaboradores/
│   ├── route.ts               # ✅ Rate limiting aplicado
│   └── import-csv/route.ts    # ✅ Rate limiting aplicado
├── relatorios/
│   ├── pdf/route.ts           # ✅ Rate limiting aplicado
│   └── excel/route.ts         # ✅ Rate limiting aplicado
├── dashboard/
│   └── analytics/route.ts     # ✅ Rate limiting aplicado
└── ciclos/route.ts            # ✅ Rate limiting aplicado
```

### Fluxo de Requisição

```
1. Cliente faz requisição
   ↓
2. Autenticação (se necessário)
   ↓
3. Rate Limiting Check
   ├─ Redis disponível? → Upstash
   └─ Redis indisponível? → In-memory fallback
   ↓
4. Limite excedido?
   ├─ Sim → Registrar no AuditLog → Retornar 429
   └─ Não → Continuar processamento
   ↓
5. Processar requisição normalmente
   ↓
6. Retornar resposta com headers de rate limit
```

### Algoritmo: Sliding Window

O rate limiting usa **sliding window** para:

- Distribuir uniformemente as requisições ao longo do tempo
- Evitar bursts no início de cada janela
- Maior precisão que fixed window
- Melhor experiência do usuário

Exemplo (limite: 5 req / 10 min):

```
Tempo: 10:00  10:02  10:04  10:06  10:08  10:10  10:12
Req:    ✅    ✅    ✅    ✅    ✅    ❌    ✅
                                   ^      ^
                                   |      10:02 expirou,
                                   |      agora pode fazer
                                   Limite excedido
```

## Uso no Código

### Aplicar Rate Limiting em um Endpoint

```typescript
import { withRateLimit } from "@/lib/rate-limit-helpers"

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  // Aplicar rate limiting
  const rateLimitCheck = await withRateLimit({
    limiterType: "magic-link:generate",
    identifier: session.user.id,
    request,
    userId: session.user.id,
    auditDetails: { endpoint: "/api/magic-link/generate" },
  })

  if (rateLimitCheck) return rateLimitCheck // Retorna 429 se bloqueado

  // Continuar processamento normal...
}
```

### Rate Limiting com IP (sem autenticação)

```typescript
import { withRateLimit, getClientIp } from "@/lib/rate-limit-helpers"

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request)

  // Aplicar rate limiting por IP
  const rateLimitCheck = await withRateLimit({
    limiterType: "questionario:submit",
    identifier: clientIp,
    request,
    auditDetails: { endpoint: "/api/questionario/submit" },
  })

  if (rateLimitCheck) return rateLimitCheck

  // Processar requisição...
}
```

### Criar Novo Rate Limiter

1. Adicionar ao `lib/rate-limit.ts`:

```typescript
export const meuNovoLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "meu-endpoint",
}) : null
```

2. Adicionar ao tipo:

```typescript
export type RateLimiterType =
  | "login"
  | "meu-endpoint" // <-- adicionar aqui
  | ...
```

3. Adicionar ao switch:

```typescript
export function getRateLimiter(type: RateLimiterType): Ratelimit | null {
  switch (type) {
    case "meu-endpoint":
      return meuNovoLimiter
    // ...
  }
}
```

## Monitoramento

### Logs do Sistema

Quando Redis está disponível:

```
✅ Upstash Redis configurado para rate limiting
```

Quando Redis não está configurado:

```
⚠️  Variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN não configuradas
⚠️  Rate limiting funcionará em modo fallback (in-memory)
```

Quando um limite é excedido:

```
🚨 Rate limit excedido: magic-link:generate | user123 | IP: 192.168.1.1
```

### Analytics do Upstash

Se `analytics: true` estiver configurado, o Upstash fornece:

- Dashboard com estatísticas de uso
- Gráficos de requisições ao longo do tempo
- Identificadores mais bloqueados
- Padrões de uso por endpoint

Acesse em: https://console.upstash.com/

## Manutenção

### Ajustar Limites

Para alterar limites, edite `lib/rate-limit.ts`:

```typescript
// Antes
export const csvImportLimiter = new Ratelimit({
  limiter: Ratelimit.slidingWindow(3, "1 m"), // 3 req/min
  ...
})

// Depois
export const csvImportLimiter = new Ratelimit({
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 req/min
  ...
})
```

### Limpar Rate Limits Manualmente

Se necessário limpar manualmente (em caso de testes, por exemplo):

```bash
# Via Upstash CLI
upstash-cli redis flushdb

# Ou via API REST
curl -X POST "https://your-redis-url.upstash.io/flushdb" \
  -H "Authorization: Bearer your-token"
```

**⚠️ CUIDADO**: Isso remove TODOS os rate limits de TODOS os usuários!

## Troubleshooting

### "Rate limit não está funcionando"

1. Verifique se as variáveis de ambiente estão configuradas:
   ```bash
   echo $UPSTASH_REDIS_REST_URL
   echo $UPSTASH_REDIS_REST_TOKEN
   ```

2. Verifique os logs do servidor:
   ```
   ✅ Upstash Redis configurado para rate limiting
   ```

3. Teste manualmente com curl:
   ```bash
   # Fazer 6 requisições rápidas (limite: 5)
   for i in {1..6}; do
     curl -X POST http://localhost:3000/api/magic-link/generate \
       -H "Authorization: Bearer YOUR_TOKEN" \
       -H "Content-Type: application/json" \
       -d '{"colaboradorIds":["..."], "cicloAvaliacaoId":"..."}'
     echo "Request $i"
     sleep 1
   done
   ```

### "Limite sendo excedido muito rápido"

- Verifique se está usando o identificador correto (userId vs IP)
- Verifique se há múltiplas instâncias do servidor compartilhando o mesmo Redis
- Verifique se o relógio do servidor está sincronizado

### "In-memory fallback não funciona em produção"

O fallback in-memory:

- ❌ Não funciona em ambientes serverless (Vercel, AWS Lambda)
- ❌ Não funciona com múltiplas instâncias
- ✅ Funciona apenas em servidor único com Node.js persistente

**Solução**: Configure o Upstash Redis para produção.

## Segurança

### Proteção contra Bypass

- ✅ Rate limiting é aplicado **antes** do processamento
- ✅ Identificadores incluem userId ou IP (impossível falsificar)
- ✅ Headers HTTP são informativos, mas não controlam o limite
- ✅ Limites são armazenados no servidor (Redis), não no cliente

### Proteção DDoS

Rate limiting **não** substitui proteção DDoS adequada:

- Use Cloudflare ou similar para proteção de camada 7
- Configure firewall para bloquear IPs maliciosos
- Use rate limiting do Nginx/Apache na frente da aplicação

## Performance

### Impacto de Latência

- **Com Redis (Upstash)**: +5-15ms por requisição
- **Com fallback in-memory**: +1-2ms por requisição

### Otimização

- Redis global compartilhado entre todas as instâncias
- Algoritmo sliding window é eficiente (O(1))
- Limpeza automática de entradas expiradas

## Roadmap

Melhorias futuras:

- [ ] Dashboard admin para visualizar rate limits em tempo real
- [ ] Whitelist de IPs/usuários confiáveis
- [ ] Rate limiting adaptativo baseado em carga do servidor
- [ ] Notificações para admins quando limites são excedidos frequentemente
- [ ] Integração com sistema de alertas (Slack, email)

## Referências

- [Upstash Rate Limiting Docs](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview)
- [HTTP 429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
- [Rate Limiting Patterns](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [Sliding Window Algorithm](https://en.wikipedia.org/wiki/Sliding_window_protocol)

---

**Última atualização**: 2024-01-11
**Versão**: 1.0.0
**Autor**: Sistema VIVAMENTE360
