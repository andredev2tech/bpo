# Agents & Instructions

Este projeto usa customizações AI em `.github/`. Para OpenCode, as configurações estão aqui:

## Agents

| Agent | Descrição | Arquivo origem |
|-------|-----------|----------------|
| backend-implementer | Implementa/refatora APIs com foco em tenant isolation | `.github/agents/backend-implementer.agent.md` |
| test-writer | Cria testes Vitest/Playwright | `.github/agents/test-writer.agent.md` |
| security-reviewer | Revisão de segurança | `.github/agents/security-reviewer.agent.md` |

## Instructions

| Instruction | Escopo | Arquivo origem |
|-------------|--------|----------------|
| backend-api | `app/api/**/route.ts` | `.github/instructions/backend-api.instructions.md` |
| frontend-ui | `app/**/*.tsx,components/**/*.tsx` | `.github/instructions/frontend-ui.instructions.md` |
| testing | `__tests__/**/*.ts,e2e/**/*.ts` | `.github/instructions/testing.instructions.md` |
| security | `app/api/**/route.ts,lib/**/*.ts,middleware.ts` | `.github/instructions/security.instructions.md` |

## Skills

As skills estão em `.github/skills/`. Para usar com OpenCode, carregue via `/invoke skill:nome`:

| Skill | Quando usar | Arquivo origem |
|-------|-------------|----------------|
| write-api-tests | Adicionar/atualizar testes de API | `.github/skills/write-api-tests/SKILL.md` |
| tenant-audit | Auditar rotas para tenant isolation | `.github/skills/tenant-audit/SKILL.md` |
| harden-api-route | Proteger rota existente | `.github/skills/harden-api-route/SKILL.md` |
| scaffold-api-route | Criar nova rota segura | `.github/skills/scaffold-api-route/SKILL.md` |

## Convenções

- **Canonical docs**: `docs/ai/` (standards, playbooks, guardrails, mcp-policy)
- **Executable configs**: `.github/` (copilot, instructions, agents, skills, prompts)
- Prefira domain instructions e skills sobre regras globais
