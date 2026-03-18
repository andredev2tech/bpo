# AI Customizations Map

## Canonical Knowledge (Vendor-Agnostic)
- docs/ai/standards.md
- docs/ai/playbooks.md
- docs/ai/guardrails.md
- docs/ai/mcp-policy.md

## Active Adapter (Current Tooling)
- .github/copilot-instructions.md
- .github/instructions/*.instructions.md
- .github/agents/*.agent.md
- .github/skills/*/SKILL.md
- .github/prompts/*.prompt.md

## Why this structure
- Canonical docs stay stable if tool/provider changes.
- .github adapter stays small and optimized for discovery.
- Skills carry repetitive workflows on-demand, reducing always-on token usage.

## Operating Mode
1. Put cross-vendor standards in docs/ai first.
2. Reflect only executable guidance in .github files.
3. Keep global instructions concise.
4. Prefer domain instructions and skills over broad global rules.
