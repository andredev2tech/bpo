---
applyTo: "app/api/**/route.ts"
description: "Use when implementing or reviewing Next.js API routes, auth checks, tenant isolation, payload validation, and consistent HTTP responses."
---

# Backend API Route Rules

- Require authenticated session for protected endpoints.
- Enforce tenant isolation with usuarioId in all tenant-scoped operations.
- Validate request payload before write operations.
- Keep soft delete behavior aligned with project conventions.
- Return consistent status codes: 400 validation, 401 unauthenticated, 403 forbidden when applicable, 404 not found, 500 unexpected error.
- Avoid hidden behavior changes in existing contracts without explicit request.
