# AI Guardrails (Vendor-Agnostic)

## Safety
- Do not bypass tenant boundaries.
- Do not introduce destructive DB operations when soft delete is required.
- Do not generate secrets into tracked files.

## Tooling
- Prefer read-only tool configurations by default.
- Elevate to write-capable tools only when needed.
- Require explicit human confirmation for destructive operations.

## Change Management
- Keep diffs small and intentional.
- Preserve established project patterns unless asked to change them.
- Include a short risk summary after non-trivial changes.

## Quality Gates
- Backend changes should include route-level validation checks.
- Critical path changes should include tests or a documented testing gap.

## Governance
- Maintain allowlist of external skills and MCP servers.
- Review external dependencies regularly for trust and scope.
