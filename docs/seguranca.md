# Segurança — BPO Manager

> Este documento consolida as decisões e práticas de segurança do projeto, organizadas por prioridade e por ambiente.

---

## Checklist de produção

```
[ ] Autorização por usuarioId em todas as API routes
[ ] Proteção contra enumeração de usuários no login
[ ] Rate limiting nas rotas de auth (Arcjet em serverless)
[ ] Security headers no next.config.ts
[ ] Validação de env obrigatória no startup
[ ] Zod em todas as API routes
[ ] tsc --noEmit no pre-commit (já configurado via Husky)
[ ] npm audit sem vulnerabilidades high/critical
[ ] AUTH_SECRET gerado com openssl rand -base64 32
[ ] Cookies com httpOnly + secure + sameSite documentados
[ ] Sentry configurado
[ ] Banco de teste separado (DATABASE_URL_TEST)
[ ] Logs de auditoria nas ações sensíveis
```

---

## 🔴 Crítico — antes de qualquer deploy

### 1. Autorização por tenant (usuarioId em todas as queries)

O bug mais comum em SaaS: usuário A acessa dados do usuário B trocando o slug na URL.

**Toda API route precisa:**
```ts
// app/api/clientes/slug/[slug]/tarefas-config/route.ts
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
}

const cliente = await prisma.cliente.findFirst({
  where: { slug, usuarioId: session.user.id }, // ← garante que é do dono
})
if (!cliente) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
```

**Regra:** nunca buscar por `id` ou `slug` sozinho. Sempre junto com `usuarioId: session.user.id`.

---

### 2. Proteção contra enumeração de usuários

Mensagens de erro diferentes revelam se o email existe no sistema.

```ts
// ❌ Vaza que o email existe no banco
return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })

// ✅ Não revela nada — mesma mensagem pra email inválido e senha errada
return NextResponse.json({ error: 'Email ou senha inválidos' }, { status: 401 })
```

---

### 3. Variáveis de ambiente — nunca expor secrets no cliente

Variáveis com prefixo `NEXT_PUBLIC_` são **embutidas no bundle do cliente** — qualquer um que inspecionar o JS as vê.

```ts
// ❌ NUNCA — expõe o secret no navegador
NEXT_PUBLIC_DATABASE_URL=...
NEXT_PUBLIC_AUTH_SECRET=...

// ✅ CERTO — sem NEXT_PUBLIC_ para toda informação sensível
DATABASE_URL=...
AUTH_SECRET=...
```

**Gerar o secret corretamente:**
```bash
openssl rand -base64 32
```

---

### 4. Rate limiting nas rotas de autenticação

Sem isso, scripts tentam milhares de senhas por segundo.

```ts
// lib/rate-limit.ts — solução simples para dev/testes
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, number>({ max: 500, ttl: 60_000 })

export function checkRateLimit(ip: string, max = 5): boolean {
  if (process.env.NODE_ENV === 'development') return true // bypassa em dev
  const count = (cache.get(ip) ?? 0) + 1
  cache.set(ip, count)
  return count <= max
}
```

> [!WARNING]
> **LRU em memória não funciona em ambientes serverless** (Vercel, Railway, etc). O processo reinicia constantemente e o contador zera — o rate limiting deixa de existir na prática. Em serverless, **Arcjet ou Upstash Redis não são opcionais, são obrigatórios**.

**Recomendado para produção:** [Arcjet](https://arcjet.com) — funciona no edge antes de chegar na API route, persiste entre deploys e protege contra bots automaticamente.

---

### 5. Security headers no next.config.ts

```ts
const isDev = process.env.NODE_ENV === 'development'

const securityHeaders = isDev ? [] : [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // CSP só configurar quando tiver domínio e libs definitivas — mal configurado é pior que sem
]
```

> [!WARNING]
> **CSP em desenvolvimento** quebra hot reload, React DevTools e a maioria das libs. Desabilitar completamente em dev, configurar com cuidado em produção **apenas quando as libs externas estiverem definidas**.

---

### 6. Validação de variáveis de ambiente

```ts
// lib/env.ts — importar no layout.tsx raiz
// Nota: NEXTAUTH_URL não é necessário no NextAuth v5 (inferido automaticamente)
const required = ['DATABASE_URL', 'AUTH_SECRET']
const prodOnly = ['SENTRY_DSN']

for (const key of required) {
  if (!process.env[key]) throw new Error(`[ENV] Variável obrigatória não definida: ${key}`)
}

if (process.env.NODE_ENV === 'production') {
  for (const key of prodOnly) {
    if (!process.env[key]) throw new Error(`[ENV] Variável de produção não definida: ${key}`)
  }
}
```

---

### 7. Validação de input com Zod

Toda API route que recebe body precisa validar antes de chegar no Prisma.

```ts
import { z } from 'zod'

const schema = z.object({
  nome: z.string().min(1).max(200),
  tipoId: z.string().min(1),
  recorrencia: z.enum(['DIARIA', 'SEMANAL', 'DIAS_UTEIS', 'MENSAL', 'ANUAL']),
  diaSemana: z.number().min(0).max(6).nullable().optional(),
  diaDoMes: z.number().min(1).max(31).nullable().optional(),
  mesDoAno: z.number().min(1).max(12).nullable().optional(),
})

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  // ...usa parsed.data com tipos garantidos
}
```

---

### 8. Server Actions — validação de sessão obrigatória

Server Actions executam no servidor mas são chamadas pelo cliente — sem validação, qualquer um pode chamá-las diretamente. **O middleware não as protege automaticamente.**

```ts
// app/actions/tarefa.ts
'use server'

export async function deletarTarefa(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autorizado') // SEMPRE

  const tarefa = await prisma.tarefa.findFirst({
    where: { id, cliente: { usuarioId: session.user.id } }
  })
  if (!tarefa) throw new Error('Não encontrado')

  await prisma.tarefa.delete({ where: { id } })
}
```

---

## 🟡 Importante — logo depois do MVP

### 9. Cookies de sessão — configuração segura

O NextAuth v5 já configura isso corretamente por padrão. **Não alterar** sem saber o impacto:

```ts
// auth.config.ts — documentado aqui para referência
cookies: {
  sessionToken: {
    options: {
      httpOnly: true,                                          // não acessível via JS
      secure: process.env.NODE_ENV === 'production',          // só HTTPS em prod
      sameSite: 'lax',                                        // proteção CSRF básica
    }
  }
}
```

> [!IMPORTANT]
> Qualquer alteração nas opções de cookie pode quebrar a proteção CSRF ou expor o token de sessão. Alterar só com motivo claro.

---

### 10. Timeout nas queries do Prisma

Queries lentas podem deixar conexões abertas e derrubar a aplicação em carga.

```ts
// lib/prisma.ts — adicionar middleware de timeout
prisma.$use(async (params, next) => {
  const result = await Promise.race([
    next(params),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Query timeout: ${params.model}.${params.action}`)), 5000)
    ),
  ])
  return result
})
```

---

### 11. Audit log para ações sensíveis

```ts
// lib/audit.ts
export async function auditLog(action: string, usuarioId: string, meta?: object) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', { action, usuarioId, meta })
    return
  }
  await prisma.auditLog.create({
    data: { action, usuarioId, meta: meta ? JSON.stringify(meta) : null },
  })
}
```

Schema a adicionar:
```prisma
model AuditLog {
  id         String   @id @default(cuid())
  action     String
  usuarioId  String
  meta       String?
  createdAt  DateTime @default(now())
}
```

### 12. Monitoramento de erros com Sentry

```ts
// sentry.client.config.ts
if (process.env.NODE_ENV === 'production') {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.2 })
}
```

---

## 🟢 Boas práticas contínuas

### Senhas (bcrypt)

```ts
const SALT_ROUNDS = process.env.NODE_ENV === 'development' ? 4 : 12
const hash = await bcrypt.hash(senha, SALT_ROUNDS)
```

### SQL Injection

O Prisma ORM protege automaticamente. **Cuidado apenas com `$queryRaw`:**

```ts
// ❌ VULNERÁVEL — interpolação de string
await prisma.$queryRaw`SELECT * FROM "Usuario" WHERE email = '${email}'`

// ✅ SEGURO — parâmetro interpolado pelo Prisma
await prisma.$queryRaw`SELECT * FROM "Usuario" WHERE email = ${email}`
```

### Auditoria de dependências

```bash
npm audit                       # verifica vulnerabilidades
npm audit --audit-level=high    # só high e critical (usar no CI)
```

---

## Dev vs Produção — o que liga e o que desliga

| Medida | Desenvolvimento | Produção |
|---|---|---|
| Rate limiting | ❌ Desligado (bypassa) | ✅ Ligado (Arcjet/Upstash) |
| Security headers / CSP | ❌ Desligado | ✅ Ligado |
| Audit log no banco | ❌ Só console.log | ✅ Persiste no DB |
| Sentry | ❌ Desligado | ✅ Ligado |
| Bcrypt custo | 4 (rápido) | 12 (seguro) |
| Validação de sessão | ✅ Sempre | ✅ Sempre |
| Autorização por tenant | ✅ Sempre | ✅ Sempre |
| Validação de input (Zod) | ✅ Sempre | ✅ Sempre |
| Proteção contra enumerate | ✅ Sempre | ✅ Sempre |
| tsc --noEmit | ✅ Pre-commit | ✅ CI |
| npm audit | ✅ Periodicamente | ✅ CI |

**Regra:** desliga o que atrasa o ciclo de desenvolvimento (infra). Mantém o que valida lógica de negócio (auth, tenant, tipos).

---

## Banco de teste separado

Os testes Vitest rodam contra o banco de desenvolvimento por padrão. Para evitar que o `beforeEach` limpe dados que você criou manualmente no browser:

```bash
# WSL — criar banco de teste
createdb -U bpo_user bpo_test
DATABASE_URL="postgresql://bpo_user:senha@localhost:5432/bpo_test" npx prisma db push
```

```env
# .env (não commitado)
DATABASE_URL_TEST="postgresql://bpo_user:senha@localhost:5432/bpo_test"
```

O `__tests__/setup.ts` já lê `DATABASE_URL_TEST` automaticamente.

---

## Ferramentas recomendadas

| Ferramenta | Para quê | Quando adicionar |
|---|---|---|
| **Zod** | Validação de input | Antes do MVP |
| **Arcjet** | Rate limit + bot shield no edge | Antes do deploy (obrigatório em serverless) |
| **Sentry** | Monitoramento de erros | Antes do primeiro usuário real |
| **Upstash Redis** | Rate limit persistente entre deploys | Alternativa ao Arcjet |
