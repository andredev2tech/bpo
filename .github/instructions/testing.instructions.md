---
applyTo: "__tests__/**/*.ts,e2e/**/*.ts"
description: "Use when writing or updating unit/integration/E2E tests for API routes and user flows."
---

# Testing Rules

- Write deterministic tests with isolated setup.
- For API behavior changes, cover: success, unauthorized, invalid input.
- Assert status code and response shape where relevant.
- Keep tests close to existing style in repository.
- Prefer concise test names describing behavior and expected result.
