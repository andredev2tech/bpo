---
applyTo: "app/api/**/route.ts,lib/**/*.ts,middleware.ts"
description: "Use when touching authentication, authorization, tenant boundaries, secrets, and security-sensitive logic."
---

# Security Rules

- Do not access tenant data without usuarioId guard.
- Keep auth error messages generic enough to avoid user enumeration.
- Do not leak secrets into client bundles or logs.
- Prefer least privilege and explicit checks over implicit assumptions.
- Flag security risks in final summary if any residual gap remains.
