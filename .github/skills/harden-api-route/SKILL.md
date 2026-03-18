---
name: harden-api-route
description: "Use when: secure an existing Next.js API route by adding auth checks, tenant isolation with usuarioId, payload validation, soft-delete consistency, and stable HTTP responses."
---

# Harden API Route

## Goal
Upgrade an existing API route to the repository security baseline with minimal behavioral change.

## Inputs
- Route file path.
- Expected contract constraints (if any).

## Steps
1. Confirm whether route requires authenticated session.
2. Add session validation for protected route.
3. Add tenant scoping with usuarioId in every tenant-sensitive query.
4. Validate request payload before write operations.
5. Ensure soft delete uses ativo=false where applicable.
6. Normalize error responses and status codes.
7. Add/update tests for success, unauthorized, invalid payload.

## Output
- Safe route diff.
- Short list of behavior changes (if any).
- Test coverage delta.

## Guardrails
- Do not expand scope beyond route + directly impacted tests.
- Do not break existing response contracts without explicit user request.
