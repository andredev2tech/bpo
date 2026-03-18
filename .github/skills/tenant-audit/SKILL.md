---
name: tenant-audit
description: "Use when: audit API routes for missing tenant isolation, missing auth checks, and unsafe data access patterns before release."
---

# Tenant Audit

## Goal
Detect and report security gaps in tenant boundaries and auth enforcement.

## Inputs
- Route files or route folder scope.

## Steps
1. Scan handlers for auth checks.
2. Scan data access for usuarioId scoping.
3. Flag direct id/slug lookups without tenant constraints.
4. Flag delete behavior violating soft-delete pattern.
5. Report findings by severity with file reference.
6. Suggest minimal safe fix per finding.

## Output
- Ordered findings list (critical/high/medium/low).
- Suggested remediations.
- Residual risk statement.

## Guardrails
- Do not apply broad refactors in audit mode.
- Prioritize concrete, verifiable findings.
