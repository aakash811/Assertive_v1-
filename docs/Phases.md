# phases.md — Assertive Build/Hardening Plan

Unlike Forge/Pulse/Vault, this isn't a from-scratch build — a working v1 already exists (Hono API, Next.js dashboard, Prisma/Postgres, CLI, reporter). The plan below reconciles the original Phase 0-7 hardening plan with the current 5-Sprint tracker from `ASSERTIVE_V1_IMPLEMENTATION_TRACKER.md`, reflecting actual codebase gaps.

Each phase maps to one or more sprints and notes the current implementation state.

---

## Sprint 1 — Architecture Compliance (Epic 1–4)

### Current State
- Canonical identity: `externalId` is used, but `unique_id` with atomic `id_counter` generation is **not implemented** (`projects.id_counter` missing).
- Inventory ownership: Sync owns lifecycle; Reporter uploads execution only. Partially implemented.
- Tenant security: API key scoping exists, but RBAC middleware is **commented out**. `organizationRole` is not set in context.
- History model: `test_case_history.action` is a plain `String`, not a typed enum. History actions are enforced via shared constants.

### Tasks
- [ ] Add `id_counter INTEGER NOT NULL DEFAULT 0` to `projects` table
- [ ] Implement atomic `unique_id` generation (`id_prefix` + `id_counter`) in sync/create flows
- [ ] Uncomment and wire RBAC middleware (`require-role.ts`) into all mutating routes
- [ ] Set `organizationRole` in Hono context from `org_members.role`
- [ ] Replace `history_action_enum`, `trigger_type_enum`, `org_role_enum` gaps in Prisma schema
- [ ] Remove any remaining client-supplied `organizationId` from payloads (currently none found)
- [ ] Audit all repository methods for missing `projectId`/`orgId` parameters

**Definition of Done:** Every TestCase has one canonical external ID. Sync is the only inventory owner. Every repository query is tenant-safe. RBAC is enforced server-side.

---

## Sprint 2 — Inventory & Execution (Epic 5–7)

### Current State
- Test lifecycle: `ACTIVE`/`ARCHIVED` states exist. `STALE` is a `syncState`, not a lifecycle state. Archive/restore implemented.
- Execution engine: Batch upload is transactional. `testRunService.create` performs side-effects (counter increments, history, flakiness) that are **not** in the same transaction.
- Repository architecture: Most persistence goes through repositories. Some routes still use direct `prisma` access (e.g., `routes/test.ts`, `routes/project.ts`).

### Tasks
- [ ] Move `testRunService.create` side-effects into the batch transaction or make them transactional
- [ ] Bulk insert TestRuns instead of individual `create` calls in `executionEngineService.execute`
- [ ] Bulk history creation for batch status changes
- [ ] Batch counter optimization (single `updateCounters` call instead of per-run `incrementCounters`)
- [ ] Add idempotency protection for repeated uploads (beyond `uploadCompleted` flag)
- [ ] Replace direct Prisma access in `routes/test.ts` and `routes/project.ts` with service/repository calls
- [ ] Add retry protection within execution engine

**Definition of Done:** Execution uploads are atomic. Duplicate uploads are safely handled. Services contain business logic only; repositories are the only persistence layer.

---

## Sprint 3 — Sync & Reporter Hardening (Epic 8–9)

### Current State
- Sync engine: Wrapped in `prisma.$transaction`. Suites/tags preloaded. Tags created on-demand (not diff-updated). Sync lock service exists. Parser errors collected in CLI but not fully handled in API.
- Reporter: Offline queue, retry logic, trace upload abstraction exist. Uses `test.title` as `externalId` instead of canonical source-code ID. Offline queue contents not validated on replay.

### Tasks
- [ ] Replace delete-and-recreate tags with diff-based updates
- [ ] Add Zod validation to sync route (`/api/sync`)
- [ ] Continue syncing after parser failures (per-test error handling in API)
- [ ] Improve parser error messages with file/line context
- [ ] Remove stale cache entries for deleted files (CLI)
- [ ] Add concurrent sync tests
- [ ] Add idempotency tests for sync
- [ ] Replace Reporter's `test.title` externalId with canonical source-code ID
- [ ] Validate offline queue contents on replay
- [ ] Add queue locking (exists, verify correctness)
- [ ] Remove N+1 queries in upload path (if any)
- [ ] Bulk database operations for batch history

**Definition of Done:** Sync is transactional. Large repositories sync efficiently. Sync is resilient to failures. Reporter is production-ready.

---

## Sprint 4 — Insights & Platform (Epic 10–12)

### Current State
- Insights: Metrics, Analytics, and Status are separate modules with some duplicated logic. No shared aggregation layer. No time-window filtering.
- Trace management: Storage abstraction exists (`StorageProvider` interface). Signed URLs implemented. Trace cleanup exists but is not policy-driven.
- Cleanup policies: `cleanup.service.ts` deletes ALL runs and history unconditionally. No configurable retention TTL.

### Tasks
- [ ] Merge Metrics / Analytics / Status into shared Insights module
- [ ] Shared aggregation layer to eliminate duplicated COUNT/SUM queries
- [ ] Time-window filtering (7d, 30d, 90d) for trend APIs
- [ ] Dashboard optimization (cached metrics, reduced repeated queries)
- [ ] Cached metrics with TTL
- [ ] Trend APIs for pass rate over time
- [ ] Replace `cleanup.service.ts` with policy-driven engine
- [ ] Configurable retention TTL for runs, history, and traces
- [ ] Automated cleanup jobs with configurable schedules
- [ ] Trace expiration rules

**Definition of Done:** Insights are consistent. Dashboard queries scale well. Trace storage is provider-independent. Cleanup is policy-driven.

---

## Sprint 5 — Production Readiness (Epic 13–15)

### Current State
- Infrastructure: Request ID middleware exists. Structured logging exists (`pino`). Health endpoint exists. Pagination exists but lacks `totalPages`/`hasNext`/`hasPrevious`.
- Security: API key scopes exist. RBAC commented out. No role-based authorization. No audit logging for org-level actions.
- Testing: Unit tests exist for many services. No multi-tenant isolation tests. No batch transactionality failure-injection tests. No fixture-based flakiness tests.

### Tasks
- [ ] Request IDs (implemented, verify coverage)
- [ ] Structured logging (implemented, verify format)
- [ ] Health endpoint improvements (add DB connectivity check)
- [ ] Environment configuration cleanup (`.env.example`, documentation)
- [ ] Pagination improvements (`totalPages`, `hasNext`, `hasPrevious`)
- [ ] API consistency audit (route path drift, response shapes)
- [ ] Uncomment and enforce RBAC middleware on all routes
- [ ] Role-based authorization checks (owner/admin/member/viewer)
- [ ] API key metadata (`lastUsedAt`, `createdBy`, prefix display)
- [ ] Project ownership validation to all project management endpoints
- [ ] Audit logging for organization-level actions
- [ ] Repository integration tests
- [ ] Transaction tests (batch failure injection)
- [ ] Concurrency tests (sync, unique_id generation)
- [ ] End-to-end Sync tests
- [ ] Reporter integration tests
- [ ] Performance benchmarks

**Definition of Done:** Infrastructure is production-ready. Authorization is role-aware. Critical workflows are covered by integration tests.

---

## What NOT to add once this is "done"

Resist scope creep into: the "Team" sub-layer inside Organization (resolved against in the PRD), SSO/SAML, or the marketing-site "Constellation" visualization from the early brainstorm. If there's time left after Sprint 5, it's better spent strengthening the adversarial isolation and failure-injection tests than adding new surface area.
