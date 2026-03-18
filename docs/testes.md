# Estratégia de Testes — BPO Manager

> Três camadas de cobertura: tipos, lógica de API e fluxos E2E.

---

## Stack de testes

| Ferramenta | Papel |
|---|---|
| `tsc --noEmit` | Valida tipos em todos os arquivos (pre-commit) |
| **Vitest** | Testes de unidade e integração das API routes |
| **Playwright** | Testes E2E no browser (fluxos reais) |
| **Husky** | Hooks que rodam testes automaticamente no git |

---

## Estrutura de arquivos

```
bpo/
├── __tests__/
│   ├── setup.ts                    → configura banco de teste (limpa entre testes)
│   ├── seed.test.ts                → seed isolado para testes
│   └── api/
│       ├── tarefas-modelo.test.ts  → GET/POST/DELETE do catálogo global
│       ├── tarefas-config.test.ts  → toggle e config por cliente
│       └── middleware.test.ts      → proteção de rotas (auth)
│
├── e2e/
│   ├── smoke.spec.ts               → páginas críticas respondem 200
│   └── tarefas.spec.ts             → fluxo de toggle + iniciar/finalizar
│
├── vitest.config.ts
├── playwright.config.ts
└── .husky/
    ├── pre-commit   → tsc --noEmit + lint
    └── pre-push     → vitest run
```

---

## Camada 1 — Tipos (pre-commit)

```bash
npm run test:types   # tsc --noEmit
npm run lint         # eslint
```

Roda em **todo commit**. Pega erros de tipo antes de chegar no repositório.

---

## Camada 2 — Vitest (APIs)

```bash
npm test             # vitest run (single pass)
npm run test:watch   # vitest em modo watch
npm run test:cov     # com coverage report
```

**Banco de teste:** usa variável `DATABASE_URL_TEST` no `.env.test`.  
**Isolamento:** `beforeEach` limpa as tabelas na ordem correta para evitar contaminação entre testes.

### O que cobrir (prioridade alta)

- `GET /api/tarefas-modelo` → retorna lista, respeita `ativo`
- `POST /api/tarefas-modelo` → cria modelo, valida campos obrigatórios
- `DELETE /api/tarefas-modelo/[id]` → soft delete (`ativo: false`)
- `GET /api/clientes/slug/[slug]/tarefas-config` → retorna modelos + vinculadas + específicas
- `POST /api/clientes/slug/[slug]/tarefas-config` → cria vínculo ou específica
- `PATCH /api/clientes/slug/[slug]/tarefas-config/[id]` → toggle `ativo`, edição
- `PATCH /api/tarefas/[id]/iniciar` → registra `iniciadaEm`, rejeita se já iniciada
- `PATCH /api/tarefas/[id]/finalizar` → registra `finalizadaEm`, rejeita se já finalizada

---

## Camada 3 — Playwright (E2E)

```bash
npm run test:e2e             # todos os specs
npm run test:e2e:ui          # modo visual interativo
npm run test:smoke           # apenas smoke tests
```

### Fluxos cobertos

1. **Smoke:** `/login`, `/`, `/tarefas`, `/clientes` respondem < 400
2. **Auth:** rota protegida sem sessão → redireciona para `/login`
3. **Tarefas do cliente:** toggle liga/desliga tarefa do catálogo
4. **Criar específica:** formulário inline → nova tarefa aparece na lista
5. **Iniciar/Finalizar:** botões registram tempo corretamente

---

## Camada 4 — Husky (automação)

```bash
# .husky/pre-commit → roda a cada git commit
npm run lint && npm run test:types

# .husky/pre-push → roda antes do git push
npm test
```

---

## Banco de teste

Criar `.env.test` com banco PostgreSQL separado:

```env
DATABASE_URL_TEST="postgresql://bpo_user:senha@localhost:5432/bpo_test"
```

O `setup.ts` detecta o ambiente e usa `DATABASE_URL_TEST` automaticamente.  
Rodar `npx prisma db push --schema=prisma/schema.prisma` apontando para o banco de teste antes de começar.

---

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm test` | Vitest — run único |
| `npm run test:watch` | Vitest — modo watch |
| `npm run test:cov` | Vitest — coverage |
| `npm run test:types` | TypeScript — checa tipos |
| `npm run test:e2e` | Playwright — E2E completo |
| `npm run test:smoke` | Playwright — smoke tests |
| `npm run test:e2e:ui` | Playwright — UI visual |
| `npm run test:all` | Tipos + Vitest + Playwright |
