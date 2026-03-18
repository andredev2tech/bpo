---
description: Carrega instantaneamente o mapa estrutural e regras do projeto BPO Manager sem ler repositório
---
# Iniciar Contexto (BPO Manager)

**Descrição:** Como a IA deve inicializar para obter contexto total gastando menos de 500 tokens.

### Passivos
1. Utilize a tool `view_file` para ler os seguintes arquivos fundamentais se existirem:
   - Raiz: `.cursorrules`
   - Mapa Rápido: `docs/ai_context.md`
   - Requisitos Produto: `docs/projeto.md`
   - Regras Tenant/Isolamento: `docs/seguranca.md`
   - Guia de Vitest/Mocks: `docs/testes.md`

2. Assuma integralmente as regras do projeto:
   - Tenant Isolation rigoroso (`usuarioId`).
   - `ativo: false` pro Soft Deletion.
   - Rotas Restful via Next.js App Router API.

### Ação
3. Envie uma mensagem concisa ao usuário:
   `🤯 Contexto Estrutural Injetado! Stack, Entidades, Diretórios e Regras foram mapadas e compreendidas sem varrer o repositório todo. Como posso prosseguir?`

4. Só pesquise outros arquivos `.ts` / `.tsx` caso seja extremamente necessário focado na tarefa pontual solicitada.
