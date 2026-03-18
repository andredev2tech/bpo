# AI Engineering Standards (Vendor-Agnostic)

## Purpose
These standards define how any AI assistant should work in this repository, independent of provider or tool.

## Core Principles
- Preserve tenant isolation in all backend operations.
- Prefer correctness and safety over speed.
- Keep edits minimal and scoped to the request.
- Avoid regressions by validating behavior with tests.
- Optimize context usage by loading only task-relevant information.

## Backend Standards
- All protected operations must validate session user id.
- All tenant-scoped reads/writes must include usuarioId constraints directly or by relation.
- Never physically delete business records when soft delete exists; use ativo=false.
- Validate external input before persistence.
- Keep HTTP responses consistent: clear message and appropriate status code.

## Frontend Standards
- Frontend reads/writes business data via API routes.
- Handle loading, error, and empty states explicitly.
- Keep UI logic separated from authorization and persistence logic.
- Keep components readable and strongly typed.

## Testing Standards
- Add or update tests for changed behavior.
- For API routes, cover at least success + unauthorized + invalid payload.
- Keep tests deterministic and isolated.

## Security Standards
- Never expose secrets in client-side variables.
- Avoid user enumeration in auth error messages.
- Favor least privilege in tools, credentials, and integrations.

## Token Efficiency Standards
- Keep always-on instructions concise.
- Move specialized workflows to on-demand skills.
- Avoid global rules that force broad context injection.
- Prefer targeted retrieval over full-repo scans when possible.
