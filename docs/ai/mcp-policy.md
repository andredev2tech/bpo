# MCP Policy (Vendor-Agnostic)

## Default Stance
- Start with least-privilege integrations.
- Enable read-only where possible.
- Expand capabilities only after proving value and safety.

## Recommended Initial Stack
- GitHub MCP server: read-only mode first.
- Context7: documentation retrieval for up-to-date APIs.
- Next DevTools MCP: runtime diagnostics for Next.js tasks.

## Optional Stack (Later)
- Sentry MCP: production error-driven debugging once Sentry is active.
- Prisma MCP: database workflows with explicit controls.

## Approval Checklist for New MCP
- Maintainer trust and project activity.
- Scope clarity and least privilege.
- Security documentation and known risks.
- Team-level owner and rollback path.

## Operational Rules
- Keep an allowlist of approved MCP servers.
- Review enabled servers monthly.
- Document incidents and disable misbehaving integrations quickly.
