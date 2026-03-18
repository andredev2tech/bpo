# AI Playbooks (Vendor-Agnostic)

## 1) Implement Secure API Route
1. Read route and dependencies only.
2. Add session validation.
3. Enforce tenant filter by usuarioId.
4. Validate request payload.
5. Keep response schema/status consistent.
6. Add or update API tests.

## 2) Add Frontend Feature
1. Clarify expected states and API contracts.
2. Build UI with loading/error/empty handling.
3. Integrate with existing endpoints.
4. Ensure typing and simple component boundaries.
5. Validate the happy path and failure path.

## 3) Regression Review
1. Check auth/tenant guarantees.
2. Check side effects in existing routes/components.
3. Run relevant tests/lint/typecheck.
4. Summarize risks and gaps.

## 4) Token-Safe Working Mode
1. Load only docs and files needed for the task.
2. Use focused search patterns.
3. Avoid broad always-on prompts.
4. Prefer reusable skills for repetitive flows.
