# Assertive v1 — Memory & Context

## Project Overview
Assertive is a developer-first test management platform where **source code is the source of truth** for test inventory. It automatically synchronizes test metadata from Playwright tests and collects execution history from CI/local runs.

## Architecture
- **API**: Hono (TypeScript) — `apps/api`
- **Web**: Next.js dashboard — `apps/web`
- **Database**: Prisma + PostgreSQL — `packages/database`
- **CLI**: Commander + clack — `packages/cli`
- **Reporter**: Playwright custom reporter — `packages/reporter`
- **Helper**: Test authoring metadata helper — `packages/helper`
- **Shared**: Types, error codes, constants — `packages/shared`

## Key Domain Models
- `Organization` → `Project` → `TestCase` (inventory)
- `TestCase` has `tags`, `suites`, `history`, `runs`
- `RunBatch` → `TestRun` → `Trace` (execution)
- `ApiKey` for project-scoped authentication
- `OrganizationMember` for role-based access

## Current Implementation State (as of latest audit)

### Working Well
- Sync engine: transactional reconciliation, stale marking, history creation
- Execution engine: batch uploads, trace upload abstraction, offline queue
- Flakiness calculation: transition-based scoring over last 20 runs
- Manual overrides: transactional with audit trail
- Storage abstraction: `StorageProvider` interface with local/S3 implementations
- API response standardization, pagination, error handling

### Critical Bugs Fixed (this session)
1. **History service swapped args**: `listByExternalId` called `findById` with args reversed — fixed to use `findByExternalId`
2. **`routes/test.ts` created new `PrismaClient()`**: replaced with shared client import
3. **`routes/history.ts` unauthenticated**: added `apiKeyAuth` middleware
4. **`routes/cleanup.ts` unauthenticated destructive**: added `apiKeyAuth` middleware
5. **Reporter used `test.title` as `externalId`**: now flushes canonical ID from `@assertive/helper` store
6. **Reporter `traceUrl` when `uploadTraces=false`**: now explicitly sets `null`
7. **`testCaseRepository.findById` used `findFirst`**: changed to `findUnique` with post-query projectId check
8. **Empty sync payload marks all stale**: added Zod validation with `min(1)` guard
9. **Sync route lacked Zod validation**: added `syncPayloadSchema`
10. **`test-suite`/`tags` routes missing `projectId` scoping**: updated service/repository layers to require and pass `projectId`
11. **`manual-override` service missing `projectId`**: added parameter and tenant check
12. **`runBatchService.upload` TOCTOU race**: moved `findUploadState` inside transaction
13. **`testRunService.create` non-transactional side-effects**: wrapped in `withTransaction`
14. **Execution engine N+1 queries**: switched to `createMany` + bulk counter updates
15. **CLI `create` orphaned server records**: moved file existence check before API POST
16. **`SyncResponse` type incomplete**: added `created`, `updated`, `restored` fields
17. **Test mocks out of sync**: updated `tag.service.test`, `test-suite.service.test`, `manual-override.service.test`, `sync.service.test`, `sync-workflow.test`

### Remaining Critical Gaps (not fixed in this session)
1. **RBAC middleware commented out**: `require-role.ts` is entirely commented out; `organizationRole` not in `HonoVariables`
2. **`apiKeyAuth` does not set `organizationRole`**: needs to load from `OrganizationMember`
3. **`apiKeyAuth` does not update `lastUsedAt`**: field doesn't exist in schema yet
4. **Schema gaps vs blueprint**: missing `id_counter`, typed enums, `last_used_at`, `created_by`, etc.
5. **No multi-tenant isolation tests**: adversarial test suite does not exist
6. **No batch transactionality failure-injection tests**
7. **No fixture-based flakiness score tests**
8. **`cleanup.service.ts` deletes ALL data unconditionally**: no policy-driven retention
9. **`syncLockService` is in-memory only**: no cross-instance protection
10. **`routes/project.ts` and `routes/projects.ts` missing `requireScope`**
11. **`organization.ts` missing role checks**
12. **`test.ts` still mounted at `/test` without auth** (fixed client, but route still exists unauthenticated)

## Documentation Alignment
- `PRD.md`: Added Section 3.3 (Current Implementation Status), updated success criteria with gaps, fixed Resolved Ambiguities
- `Rules.md`: Added enforcement rules for `findUnique`, RBAC, testing gaps
- `Phases.md`: Replaced Phase 0-7 with 5-Sprint tracker from `ASSERTIVE_V1_IMPLEMENTATION_TRACKER.md`
- `Architecture.md`: Added target-vs-current schema comparison, documented execution flow gaps, updated folder structure

## Key Files to Know
| File | Purpose |
|------|---------|
| `apps/api/src/index.ts` | Hono app, route mounting, scheduler |
| `apps/api/src/middleware/api-key-auth.ts` | Bearer auth, project resolution |
| `apps/api/src/services/sync.service.ts` | Sync reconciliation logic |
| `apps/api/src/services/execution-engine.service.ts` | Batch test run ingestion |
| `apps/api/src/services/test-run.service.ts` | Single test run creation |
| `apps/api/src/services/run-batch.service.ts` | Run batch CRUD + upload |
| `apps/api/src/services/manual-override.service.ts` | Manual status override |
| `packages/reporter/src/reporter.ts` | Playwright reporter |
| `packages/cli/src/commands/sync.ts` | CLI sync command |
| `packages/shared/src/sync.ts` | Shared SyncTestCase/SyncPayload types |
| `packages/database/prisma/schema.prisma` | Prisma schema |

## Running the Project
- API typecheck: `cd apps/api && npx tsc --noEmit`
- API tests: `npx vitest run apps/api/src/__tests__`
- Reporter tests: `npx vitest run packages/reporter/src/__tests__`
- Shared tests: `npx vitest run packages/shared/src/__tests__`
- All tests: `npx vitest run`

## Design Decisions
- **No Team layer**: Direct Organization → Member → Role (owner/admin/member/viewer)
- **Sync owns inventory**: Reporter only uploads execution; never creates TestCases
- **Archive over delete**: TestCases are archived, not hard-deleted
- **Manual overrides are temporary**: Cleared by next automated run, preserved in history
- **StorageProvider abstraction**: Local FS or S3-compatible, config-switchable
- **PGlite for local mode**: Selected but not yet implemented; current uses Postgres
