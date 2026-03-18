---
name: scaffold-api-route
description: "Use when: create a new Next.js API route already aligned with auth, tenant isolation, payload validation, and project response conventions."
---

# Scaffold API Route

## Goal
Create a new route with secure defaults and project-aligned patterns.

## Inputs
- Endpoint path and methods.
- Data model and expected payload.

## Steps
1. Create route file with method handlers.
2. Add session check when route is protected.
3. Apply tenant filter with usuarioId in queries/writes.
4. Add payload validation and clear 400 responses.
5. Use standard response statuses and messages.
6. Add initial tests for success and failure paths.

## Output
- New route file(s).
- Matching tests.
- Notes on assumptions.

## Guardrails
- Prefer minimal schema and behavior.
- Keep names and structure aligned with existing project patterns.
