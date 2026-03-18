# BPO Manager — Documento de Referência do Projeto

> Este documento não é rígido. Evolui junto com o projeto.

---

## O que é o sistema

Ferramenta de gestão operacional para profissionais de BPO financeiro que atendem múltiplos clientes simultaneamente. O problema central: com 10+ empresas como cliente, cada uma com tarefas recorrentes diferentes, é impossível controlar tudo sem risco de esquecer algo.

O sistema centraliza todas as tarefas em um único painel, organizado por dia, por cliente e por urgência. Todo dia ele monta automaticamente a lista do que precisa ser feito — sem intervenção do operador.

---

## Stack escolhida

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework full-stack | Next.js (App Router) | 16.1.6 |
| Linguagem | TypeScript | ^5 |
| Banco de dados | PostgreSQL (WSL Ubuntu) | — |
| ORM | Prisma | ^6 |
| Estilização | Tailwind CSS | ^4 |
| Autenticação | NextAuth.js | ^5 beta |

**Banco de dados:** rodando no WSL Ubuntu, acessível via `localhost:5432`  
**Database:** `bpo_manager` | **Usuário:** `bpo_user`

---

## Estrutura de rotas (App Router)

```
app/
├── (auth)/
│   └── login/page.tsx                     → /login
│
├── (dashboard)/                           → protegido por login
│   ├── layout.tsx                         → sidebar global + navegação
│   ├── page.tsx                           → / (painel principal)
│   ├── clientes/
│   │   ├── page.tsx                       → /clientes (lista + CRUD)
│   │   └── novo/page.tsx
│   └── tarefas/                           → catálogo global de modelos de tarefa
│       ├── page.tsx                       → /tarefas (lista funcional)
│       ├── novo/page.tsx                  → /tarefas/novo
│       └── [id]/page.tsx                  → /tarefas/[id] (editar)
│
├── clientes/
│   └── [slug]/                            → mini-app por cliente
│       ├── layout.tsx                     → sidebar colorida por cliente
│       ├── page.tsx                       → dashboard do cliente
│       ├── tarefas/page.tsx               → tarefas do dia (stub)
│       ├── vencimentos/page.tsx           → stub
│       ├── editar/                        → stub
│       └── configuracoes/
│           └── tarefas/page.tsx           → configurar quais tarefas o cliente tem ✅
│
└── api/
    ├── tipos/route.ts                     → GET (lista), POST (criar) ✅
    ├── tipos/[id]/route.ts                → PUT, DELETE (soft) ✅
    ├── clientes/route.ts                  → GET (lista), POST (criar) ✅
    ├── clientes/[id]/route.ts             → GET, PUT, DELETE (soft) ✅
    ├── clientes/slug/[slug]/              → GET por slug ✅
    ├── clientes/slug/[slug]/tarefas-config/route.ts  → GET, POST ✅
    ├── clientes/slug/[slug]/tarefas-config/[id]/route.ts → PATCH, DELETE ✅
    ├── tarefas-modelo/route.ts            → GET, POST (catálogo global) ✅
    ├── tarefas-modelo/[id]/route.ts       → GET, PUT, DELETE ✅
    └── tarefas/
        ├── route.ts                       → (a implementar)
        ├── [id]/route.ts                  → (a implementar)
        ├── [id]/iniciar/route.ts          → PATCH (registra iniciadaEm) ✅
        ├── [id]/finalizar/route.ts        → PATCH (registra finalizadaEm, concluida=true) ✅
        └── gerar/route.ts                 → (a implementar — cron diário)
```

---

## Navegação

**Sidebar principal (dashboard global):**
```
Home
Clientes
Tarefas          ← catálogo global de modelos reutilizáveis
Vencimentos
```

**Sidebar do cliente:**
```
Dashboard
Tarefas do dia   ← instâncias diárias do cliente
Vencimentos
── Configurações ──
Dados do cliente
Tarefas          ← configurar quais tarefas o cliente tem
```

---

## Schema do banco

```
Usuario
  └── TarefaModelo[]        → catálogo pessoal de modelos reutilizáveis
  └── Cliente[]
        └── TarefaConfig[]  → tarefa configurada por cliente (pode vir de um TarefaModelo ou ser específica)
              └── Tarefa[]  → instâncias diárias geradas pelo cron
        └── Vencimento[]    → alertas de datas importantes
```

**Dinâmico:** `TipoTarefa` (Model no banco, permissão de criar e editar nomes e cores. O seed fornece os iniciais: CONCILIACAO, PAGAMENTO, RELATORIO, FISCAL)  
**Enums:** `TipoRecorrencia` (DIARIA, SEMANAL, DIAS_UTEIS, MENSAL, ANUAL)

**Notas do schema:**
- Soft delete via `ativo: boolean` em modelos relevantes
- `TarefaConfig.modeloId` é nullable → tarefa específica do cliente (sem modelo base)
- `Tarefa.iniciadaEm` / `Tarefa.finalizadaEm` rastreiam tempo gasto na execução
- Restrições únicas por usuário: `@@unique([usuarioId, slug])`, `@@unique([usuarioId, cnpj])`

---

## Lógica central do sistema

- Cada cliente tem **tarefas recorrentes** configuradas (`TarefaConfig`)
- Recorrência pode ser: diária, semanal (dia específico), só dias úteis, mensal (dia específico) ou anual (mês do ano)
- Todo dia um **cron job** chama `/api/tarefas/gerar`, que instancia `Tarefa` para cada `TarefaConfig` ativa que se encaixa no dia
- A geração é **idempotente** — não duplica se já existe tarefa para o par (cliente + config + data)
- Tarefa não concluída → vira **tarefa atrasada** (`data < hoje AND concluida = false`)
- Usuário clica **Iniciar** → registra `iniciadaEm`; clica **Finalizar** → registra `finalizadaEm` e marca `concluida = true`
- Tempo gasto = `finalizadaEm - iniciadaEm`

---

## Fluxo de configuração de tarefas por cliente

### Fontes de uma TarefaConfig
1. **Do catálogo (modelo):** usuário ativa via toggle → cria `TarefaConfig` com `modeloId` referenciado
2. **Editada do modelo:** mesma ativação, mas o usuário edita nome / dia → dados customizados, `modeloId` ainda como referência
3. **Específica do cliente:** `+ Criar tarefa específica` → form inline → `TarefaConfig` com `modeloId = null`

### Layout de Configurações → Tarefas do cliente
```
┌─ TAREFAS ────────────────────────────────────────────────────┐
│  [+ Criar tarefa específica]                                  │
│                                                               │
│  — Específicas deste cliente ──────────────────────────────  │
│  [●] Envio relatório p/ sócios  Mensal — dia 10  [editar]   │
│                                                               │
│  — Do catálogo ──────────────────────────────────────────    │
│  [●] Conciliação bancária     Dias úteis         [editar]    │
│  [●] DAS Simples Nacional     Mensal — dia 20    [editar]    │
│  [○] DARF — IRPJ              Mensal — dia 31                │
└──────────────────────────────────────────────────────────────┘
```
- Toggle desativa mas **mantém na lista** (`ativo: false`)
- Clique em `[editar]` expande formulário inline

---

## Status de implementação

| Módulo | Status |
|---|---|
| Schema Prisma (TarefaModelo, TarefaConfig, Tarefa) | ✅ Completo |
| Autenticação (login + middleware + JWT) | ✅ Funcional |
| Seed de dados | ✅ Pronto |
| API clientes (CRUD completo) | ✅ Funcional |
| API tarefas-modelo (catálogo global) | ✅ Funcional |
| API tarefas-config (config por cliente) | ✅ Funcional |
| API tarefas/[id]/iniciar e finalizar | ✅ Implementado |
| Página catálogo global `/tarefas` | ✅ Funcional |
| Página config por cliente `/configuracoes/tarefas` | ✅ Funcional |
| Página de CRUD de tipos `/configuracoes/tipos` | ✅ Funcional |
| Sidebar com nova estrutura de menus | ✅ Atualizado |
| Dashboard global (UI) | 🔶 Mockado — visual OK, sem dados reais |
| Página lista de clientes | ✅ Funcional |
| Dashboard individual por cliente | 🔶 Básico |
| Página tarefas do dia por cliente | ❌ A implementar |
| Lógica de geração de tarefas (cron) | ❌ A implementar |
| API tarefas (lista do dia, GET) | ❌ A implementar |
| Dashboard conectado ao banco | ❌ A implementar |

---

## Pendências técnicas conhecidas

- API routes não verificam `usuarioId` da sessão → qualquer usuário autenticado pode acessar dados de outros (corrigir antes de produção)
- Dashboard usa dados hardcoded
- Cron job de geração de tarefas ainda sem infraestrutura definida (Vercel Cron, Railway, etc.)

---

## Convenções do projeto

- Toda comunicação de dados via API Routes (`/api/...`)
- Componentes de UI em `components/`
- Lógica de banco exclusivamente no servidor (Server Components ou API Routes)
- Variáveis sensíveis apenas no `.env` (nunca commitadas)
- Soft delete: nunca deletar registros, usar `ativo: false`
- Toggle de tarefa por cliente: PATCH imediato, sem confirmar
