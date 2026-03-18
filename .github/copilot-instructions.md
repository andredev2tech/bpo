# BPO Manager Copilot Instructions

## Always-On Invariants
- Enforce tenant isolation in backend access using usuarioId from authenticated session.
- For protected routes: validate session user id before data access.
- Use soft delete (ativo=false) where the project follows this pattern.
- Keep API behavior consistent with clear status codes and messages.
- Do not expose secrets to client-side code.

## Project Context Loading
- Prefer reading docs/ai and docs/ files before deep codebase exploration.
- Load only task-relevant files to optimize token usage.

## Delivery Expectations
- Keep modifications small and focused.
- Preserve current architecture and naming patterns unless user asks otherwise.
- When changing behavior, add or update tests where practical.

## Stack
- Next.js App Router, TypeScript, Prisma, PostgreSQL, NextAuth, Vitest, Playwright.
