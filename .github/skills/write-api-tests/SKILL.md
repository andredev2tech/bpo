---
name: write-api-tests
description: "Use when: add or update Vitest API tests for routes, including success path, auth failure, validation failure, and core business rule assertions."
---

# Write API Tests

## Goal
Provide focused route tests that protect behavior and security constraints.

## Inputs
- Route handlers and expected behavior.
- Existing seed helpers and test conventions.

## Steps
1. Identify primary route scenarios.
2. Add success-case assertion with response shape and status.
3. Add unauthorized case (missing/invalid session).
4. Add invalid payload case (400).
5. Add business-rule case relevant to the route.
6. Keep tests deterministic and isolated.

## Output
- New or updated test file.
- Coverage summary of protected scenarios.

## Guardrails
- Avoid brittle test assumptions.
- Reuse existing setup and seed helpers.
