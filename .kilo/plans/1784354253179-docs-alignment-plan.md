# Documentation Alignment Plan

## Goal
Align `PRD.md`, `Rules.md`, `Phases.md`, and `Architecture.md` with the source-of-truth documents (`ASSERTIVE_V1_BLUEPRINT.md` and `ASSERTIVE_V1_IMPLEMENTATION_TRACKER.md`), reconciling them against the actual current codebase state.

## 1. Current State Summary

The codebase is a partially implemented Assertive v1 platform with:
- **API**: Hono-based REST API with ~30 route files, service/repository layers, middleware for auth/scoping
- **Database**: Prisma schema with 12 models (User, Organization, OrganizationMember, Project, ApiKey, TestSuite, TestCase, Tag, TestCaseTag, RunBatch, TestRun, TestCaseHistory)
- **CLI**: Commander-based CLI with sync, create, init, ui commands
- **Reporter**: Playwright reporter with offline queue, trace upload, retry logic
- **Web**: Next.js dashboard (not deeply examined)
- **Packages**: cli, helper, reporter, database, shared monorepo

## 2. Critical Gaps Found

### A. Schema vs Blueprint (Prisma)
| Blueprint Field | Current State | Gap |
|-----------------|---------------|-----|
| `projects.id_counter` | Missing | Blocks atomic `unique_id` generation |
| `projects.description`, `repository_url`, `created_by` | Missing | Incomplete project model |
| `test_cases.unique_id` | Uses `externalId` instead | No separate internal/external identity |
| `test_cases.owner` (UUID→User) | String | Not a proper FK |
| `test_cases.priority` enum | String | No enum constraint |
| `test_cases.test_type` enum | String | No enum constraint |
| `history_action_enum` | Missing (action is String) | Not type-safe at DB level |
| `trigger_type_enum` | Missing (triggeredBy is String) | Not type-safe at DB level |
| `org_role_enum` | Missing (role is String) | Not type-safe at DB level |
| `api_keys.last_used_at`, `created_by` | Missing | No key usage tracking |
| `run_batches.started_at`, `finished_at`, `total_duration_ms`, `timed_out_count` | Missing | Incomplete batch model |
| `test_runs.environment`, `commit_sha`, `branch` | Missing | Incomplete run metadata |
| `test_case_history.changed_by` (UUID) | String | Not a proper FK |

### B. RBAC & Tenant Security
1. **RBAC middleware is completely commented out** (`require-role.ts`)
2. `organizationRole` is never set in Hono context variables
3. `apiKeyAuth` uses `findFirst` for project override lookup instead of `findUnique`
4. `apiKeyAuth` does not update `api_keys.last_used_at`
5. Scope enforcement (`requireScope`) only applied to API key routes, not test-case/run-batch/test-run routes
6. No multi-tenant isolation tests exist
7. `test.ts` route creates a new `PrismaClient()` instead of using the shared client

### C. Transactionality & Execution Engine
1. `runBatchService.upload` is transactional, but `executionEngineService.execute` calls `testRunService.create` which performs **5 separate non-transactional DB operations** (create run, increment counters, clear override, record history, recalculate flakiness)
2. No bulk insert for TestRuns (individual `create` calls in a loop)
3. No bulk history creation
4. No idempotency protection beyond `uploadCompleted` flag (no deduplication of repeated uploads)
5. No retry protection within the execution engine itself

### D. Sync Engine
1. Sync is transactional (good)
2. Suites/tags preloaded (good)
3. Tags are created on-demand, not diff-updated (creates duplicates if tag exists but with different case)
4. API route does not use Zod validation (parses JSON directly)
5. Parser errors in CLI are collected but API doesn't handle partial failures gracefully
6. No concurrent sync tests
7. No idempotency tests

### E. Reporter
1. Uses `test.title` as `externalId` instead of canonical external ID from source code annotations
2. Offline queue contents not validated on replay
3. No N+1 query issues (reporter doesn't query DB)
4. `uploadTraces` config is respected
5. Retry logic is basic (3 attempts, exponential backoff)

### F. Cleanup & Retention
1. `cleanup.service.ts` deletes ALL runs and history unconditionally
2. No configurable retention TTL
3. No trace expiration
4. No policy-driven cleanup engine

### G. Insights/Metrics
1. Metrics, Analytics, and Status are separate modules with duplicated logic
2. No shared aggregation layer
3. No time-window filtering (7d/30d/90d)
4. No cached metrics
5. No trend APIs

### H. Tests
1. **No multi-tenant isolation tests**
2. **No batch transactionality failure-injection tests**
3. **No fixture-based flakiness score tests** (only mocked unit tests)
4. **No concurrent sync tests**
5. **No end-to-end reporter integration tests**
6. **No performance benchmarks**

## 3. Documentation Updates Required

### 3.1 PRD.md
**Changes:**
- Update "Resolved Ambiguities" table to reflect actual schema state (e.g., `id_counter` is NOT yet in schema, `unique_id` is not implemented)
- Update Section 3.1 (Functional Requirements) to mark FR7 (trace viewer) as partially implemented (storage abstraction exists but no dashboard embedding verified)
- Update Section 3.2 (NFRs): NFR5 (batch transactionality) is partially met - batch upload is transactional but individual run creation side-effects are not
- Add a "Current Implementation Status" section mapping each FR/NFR to actual code state
- Remove the "Resolved Ambiguities" claim about `projects.id_counter` being added - it's still missing
- Update success criteria to note which are currently unmet

### 3.2 Rules.md
**Changes:**
- Remove or update Rule 2.5 about `unique_id` generation being atomic - the `id_counter` doesn't exist yet
- Update Rule 2.2 about `is_manual_override` - clarify that automation clears it (implemented)
- Update Rule 2.6 about tenant scoping - note that `findFirst` is still used in some places and `organizationRole` enforcement is not implemented
- Add a new rule: "All tenant-scoped repository queries must use `findUnique` when querying by `id` + `projectId`, not `findFirst`"
- Add a new rule: "RBAC must be enforced server-side on all mutating routes before business logic executes"
- Update Rule 4.1: Multi-tenant isolation tests are currently missing - mark as critical gap
- Update Rule 4.2: Sync reconciliation state transition tests exist but need expansion
- Update Rule 4.3: Reporter end-to-end test exists under `packages/playground` but needs validation
- Update Rule 4.4: Batch transactionality failure-injection test is missing
- Update Rule 4.5: Flakiness fixture-based test is missing

### 3.3 Phases.md
**Changes:**
- This document is the most out of date. It describes a "Phase 0-7" plan that conflicts with the 5-Sprint tracker.
- **Replace the entire phase structure** with the 5-Sprint plan from `ASSERTIVE_V1_IMPLEMENTATION_TRACKER.md`
- Or add a "Current State vs Phases" reconciliation section
- Update Phase 1 (Security) to reflect actual gaps: RBAC commented out, no isolation tests, `lastUsedAt` missing
- Update Phase 2 (Transactionality) to reflect: batch upload is transactional but `testRunService.create` is not fully atomic
- Update Phase 3 (Flakiness) to reflect: formula is implemented but lacks fixture tests
- Update Phase 4 (Storage) to reflect: abstraction exists but dashboard embedding unverified
- Update Phase 5 (CLI/Reporter) to reflect: init wizard exists, incremental sync exists, offline queue exists
- Update Phase 6 (Deployment) to reflect: Dockerfiles and compose exist (verify)
- Update Phase 7 (Tests/Docs/Release) to reflect: significant test gaps remain

### 3.4 Architecture.md
**Changes:**
- Update Section 3 (Database Schema) to match the **actual** Prisma schema, not the blueprint schema
  - Note differences: `unique_id` vs `externalId`, missing enums, missing columns
- Update Section 4 (Folder Structure) to reflect actual package structure
- Update Section 2.2 (Execution Flow) to note that batch ingestion is transactional at the run-batch level but `testRunService.create` side-effects are not in the same transaction
- Add a "Known Schema Gaps" subsection listing fields that exist in blueprint but not in code
- Update Section 2.5 (Multi-Tenant Scoping) to note that `findFirst` is still used in some repository methods and `organizationRole` enforcement is not implemented
- Clarify that `syncState` (SYNCED/STALE) and `lifecycle` (ACTIVE/ARCHIVED) are separate fields in the current implementation, not a unified lifecycle state

## 4. Implementation Priorities (for the implementation agent)

### P0 - Must Fix Before v1 (Blocks Production Readiness)
1. **Add `id_counter` to `projects` table** and implement atomic `unique_id` generation
2. **Uncomment and implement RBAC middleware** (`require-role.ts`)
3. **Wrap `testRunService.create` in a transaction** or move its side-effects into the batch transaction
4. **Add multi-tenant isolation tests**
5. **Add batch transactionality failure-injection test**
6. **Fix `apiKeyAuth` to use `findUnique` and update `lastUsedAt`**
7. **Add `history_action_enum`, `trigger_type_enum`, `org_role_enum` to Prisma schema**

### P1 - Should Fix (Significant Quality/Correctness)
1. Replace Reporter's `test.title` externalId with canonical source-code ID
2. Add fixture-based flakiness tests
3. Implement diff-based tag updates instead of create-on-demand
4. Add Zod validation to sync route
5. Replace string enums with proper Prisma enums
6. Add `lastUsedAt` update to API key auth
7. Implement policy-driven cleanup with TTL
8. Add trace expiration

### P2 - Nice to Have (Polish)
1. Merge Metrics/Analytics/Status into shared Insights module
2. Add time-window filtering
3. Add cached metrics
4. Add trend APIs
5. Improve pagination metadata
6. Add concurrent sync tests
7. Add performance benchmarks

## 5. Validation Plan
After documentation updates, validate by:
1. Re-reading all 4 updated docs to ensure internal consistency
2. Cross-referencing every claim against the actual codebase
3. Ensuring the 5-Sprint tracker from `ASSERTIVE_V1_IMPLEMENTATION_TRACKER.md` is accurately reflected
4. Confirming no blueprint claims are made about unimplemented features without "planned" or "gap" notation
