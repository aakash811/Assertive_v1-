# architecture.md — Assertive

## 1. System Overview

```
Developer writes:                    CLI (getassertive):
┌─────────────────────┐              ┌──────────────────────────┐
│ auth.spec.ts          │             │ sync: scan + parse +     │
│                        │             │       reconcile          │
│ assertive.id('TST-1') │────────────▶│ create: scaffold + POST  │
│ assertive.tags(...)   │              │ ui: start local API+web  │
└─────────────────────┘              └───────────┬──────────────┘
                                                    │
CI/local run:                                      ▼
┌─────────────────────┐              ┌──────────────────────────┐
│ npx playwright test    │─────────▶ │  apps/api (Hono)          │
│  + AssertiveReporter   │  batch    │                            │
└─────────────────────┘  POST      │  Route → Validate(Zod)     │
                                     │       → Service            │
                                     │       → Repository         │
                                     │       → Prisma              │
                                     └───────────┬────────────────┘
                                                  ▼
                                     ┌──────────────────────────┐
                                     │  PostgreSQL / PGlite       │
                                     │  (org-scoped tables)       │
                                     └──────────────────────────┘
                                                  ▲
                                     ┌────────────┴──────────────┐
                                     │  apps/web (Next.js)         │
                                     │  dashboard, trace viewer    │
                                     └────────────────────────────┘

Trace files: Reporter ──(pre-signed URL)──▶ StorageProvider (Local FS or S3-compatible)
```

**Core principle:** the CLI and reporter are the only things that ever touch the developer's filesystem or Playwright process. The API never reads source code directly — it only receives structured payloads. This keeps the backend a normal, portable web service regardless of what's happening on a developer's machine.

## 2. Request/Data Flows

### 2.1 Sync Flow (code → inventory)

1. `getassertive sync` scans files matching the configured glob (default `**/*.spec.ts`), respecting `.gitignore`
2. For each file, parse `assertive.id(...)` calls and any `tags/owner/priority/type/field` calls within the same test block; extract the title from the enclosing `test()`/`it()` wrapper
3. Normalize `file_path` to be relative to project root (portable across machines/CI)
4. Compile a `SyncPayload` and `POST /api/projects/:id/sync`
5. **Backend reconciliation** (the important part): fetch all existing `test_cases` for the project, diff against the incoming list by `unique_id`:
   - In incoming, not in DB → `INSERT`, `sync_state = 'synced'`, history action `created`
   - In both, metadata changed → `UPDATE`, keep `synced`, history action `synced` with a JSONB diff
   - In DB, not in incoming → `UPDATE sync_state = 'stale'` — **never delete**. A test temporarily commented out or moved to a branch shouldn't lose its history.
6. Return a summary (`{ synced, created, updated, restored, stale }`) — CLI prints it with icons/colors

### 2.2 Execution & Reporting Flow

1. `AssertiveReporter.onBegin` creates a `run_batches` row (branch, commit SHA, CI metadata, `triggered_by` auto-detected from environment)
2. `onTestEnd` per test: read the helper's flushed metadata (title → `unique_id` mapping), capture status/duration/browser/OS; if failed and a trace exists, request a pre-signed upload URL and upload the trace directly to storage (never through the API server itself — keeps the API stateless and traces off the request path)
3. `onEnd`: construct the full batch payload and `POST /api/test-runs` (batch)
4. **Backend batch ingestion, transactionally at the run-batch level**:
    - `runBatchService.upload` wraps execution in `prisma.$transaction`
    - For each result: `INSERT test_runs`, `UPDATE test_cases.last_status`, clear `is_manual_override` if it was set, recompute `flaky_score`
    - Update `run_batches` summary counters (total/passed/failed/skipped/duration)
    - **Gap:** `testRunService.create` performs side-effects (counter increments via `incrementCounters`, history creation, flakiness recalculation) that are currently **not** in the same transaction as the batch upload. This means a failure after the batch transaction commits can leave `run_batches` counters inconsistent with actual `test_runs` rows.
    - Bulk insert for TestRuns is **not** implemented; individual `create` calls are used in a loop.
    - Bulk history creation is **not** implemented; individual `create` calls are used.
    - All of the above should be in **one transaction per batch** — a failure partway through rolls back the whole batch rather than leaving counters inconsistent with actual rows (this is NFR5, and it's a real gap in the current implementation)
5. If the API is unreachable: reporter retries 3× with exponential backoff, then writes to `.assertive/pending-results.json` for later upload via a future `sync`/`upload` call — **the test run itself must never fail because of this**

### 2.3 Manual Override Flow

1. Dashboard user changes a test's status, required to enter a comment
2. `PATCH /api/test-cases/:id/override` — in one transaction: update `test_cases.last_status`, `is_manual_override = true`, `override_comment`; insert a `test_runs` row with `is_manual_override = true`, `overridden_by`; insert `test_case_history` with action `status_override` and a `{status: {from, to}}` diff
3. **The override is temporary by design**: the next automated batch result for that test case clears `is_manual_override` and trusts the new automated status — but the override event itself is preserved forever in history, not overwritten. This asymmetry (mutable "current state" vs immutable "history") is the core audit-trail design principle of the whole schema.

### 2.4 Flakiness Calculation

Triggered after every batch ingestion, per affected test case:

```
recent = last 20 test_runs for this test_case, ordered by created_at desc
transitions = count of status changes between consecutive runs in `recent` (pass→fail or fail→pass)
flaky_score = round((transitions / len(recent)) * 100)   // 0-100
is_flaky = flaky_score > 30
```

A test that's simply always-failing has zero transitions and `flaky_score = 0` — correctly _not_ flaky, just broken. A test alternating pass/fail every run approaches `flaky_score = 100`. This distinction (flaky vs broken) is a real product feature, not just a number — surface it distinctly in the UI (see design.md).

### 2.5 Multi-Tenant Scoping (every read/write path)

Every authenticated request resolves to a `projectId` (from the API key or `x-project-id` header, validated against the caller's organization membership) **before** touching any tenant-scoped table. Every repository query includes `WHERE project_id = :projectId` (or joins through `project.organization_id` for org-level resources). This is application-layer scoping, not database-layer RLS.

**Current gaps:**
- Some repository methods use `findFirst` instead of `findUnique` when querying by `id` + `projectId` (e.g., `testCaseRepository.findById` uses `findFirst`, which can mask data leaks if `id` is not unique within scope)
- `apiKeyAuth` uses `findFirst` for project override lookup instead of `findUnique`
- RBAC enforcement (`requireRole` middleware) is **commented out**; `organizationRole` is not set in Hono context
- No adversarial isolation tests exist to verify cross-tenant access is blocked

Call these out explicitly as real design tradeoffs (see rules.md for why, and what would need to change to harden it further).

## 3. Database Schema (target vs current)

### Target Schema (from Blueprint)

```sql
-- ENUMS
CREATE TYPE sync_state_enum     AS ENUM ('synced', 'stale', 'new');
CREATE TYPE test_status_enum    AS ENUM ('passed', 'failed', 'skipped', 'timed_out', 'not_run');
CREATE TYPE test_type_enum      AS ENUM ('happy-path', 'negative-path', 'edge-case', 'a11y', 'performance');
CREATE TYPE priority_enum       AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE org_role_enum       AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE history_action_enum AS ENUM ('created', 'updated', 'status_override', 'synced', 'marked_stale', 'archived');
CREATE TYPE trigger_type_enum   AS ENUM ('ci', 'local', 'manual');
-- ... (full target schema in ASSERTIVE_V1_BLUEPRINT.md)
```

### Current Schema (actual Prisma implementation)

The current schema lives at `packages/database/prisma/schema.prisma`. Key differences from target:

| Target Field | Current State | Gap |
|--------------|---------------|-----|
| `projects.id_counter` | Missing | Blocks atomic `unique_id` generation |
| `projects.description`, `repository_url`, `created_by` | Missing | Incomplete project model |
| `test_cases.unique_id` | Uses `externalId` (String) | No separate internal/external identity |
| `test_cases.owner` (UUID→User FK) | String | Not a proper FK |
| `test_cases.priority` enum | String | No enum constraint |
| `test_cases.test_type` enum | String | No enum constraint |
| `history_action_enum` | Missing (`action` is String) | Not type-safe at DB level |
| `trigger_type_enum` | Missing (`triggeredBy` is String) | Not type-safe at DB level |
| `org_role_enum` | Missing (`role` is String) | Not type-safe at DB level |
| `api_keys.last_used_at`, `created_by` | Missing | No key usage tracking |
| `run_batches.started_at`, `finished_at`, `total_duration_ms`, `timed_out_count` | Missing | Incomplete batch model |
| `test_runs.environment`, `commit_sha`, `branch` | Missing | Incomplete run metadata |
| `test_case_history.changed_by` (UUID) | String | Not a proper FK |
| `test_cases.lifecycle` | Present (`LifecycleState` enum) | Blueprint does not define this enum separately |
| `run_batches.uploadCompleted`, `uploadedAt` | Present | Not in blueprint (v1 addition) |
| `test_runs.attemptNumber`, `retryOfId` | Present | Not in blueprint (v1 addition) |

### Known Schema Gaps

1. **No typed enums**: `priority`, `testType`, `action`, `triggeredBy`, and `role` are plain strings. This allows invalid values at the DB level.
2. **No `id_counter`**: Atomic `unique_id` generation (`TST-001`) is impossible without it. Current implementation uses developer-provided `externalId`.
3. **Missing audit fields**: `api_keys.last_used_at` and `api_keys.created_by` are absent. `projects.created_by` is absent.
4. **Missing run metadata**: `test_runs` lacks `environment`, `commit_sha`, `branch`. `run_batches` lacks `started_at`, `finished_at`, `total_duration_ms`, `timed_out_count`.
5. **`testCaseHistory.changedBy` is a string**: Should reference `users(id)` for referential integrity.
6. **`testCase.owner` is a string**: Should reference `users(id)` for referential integrity.
7. **`sync_state_enum` target includes `'new'`**: Current enum only has `SYNCED` and `STALE`.

## 4. Folder & File Structure

```
assertive/
├── apps/
│   ├── api/                       Hono API
│   │   ├── src/
│   │   │   ├── routes/            HTTP shape, auth boundary, response wrapping
│   │   │   ├── validators/        Zod schemas for write paths
│   │   │   ├── services/          business logic: sync diff, flakiness, override, history
│   │   │   ├── repositories/      Prisma queries, tenant-scoped by construction
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts        bearer key → { projectId, orgId, scopes }
│   │   │   │   ├── require-role.ts   role check middleware (currently commented out)
│   │   │   │   ├── require-scope.ts  scope check middleware
│   │   │   │   ├── request-id.ts     request ID generation
│   │   │   │   └── request-logger.ts structured logging
│   │   │   ├── lib/
│   │   │   │   ├── storage/       StorageProvider implementations
│   │   │   │   │   ├── trace-provider.ts
│   │   │   │   │   ├── local-trace-provider.ts
│   │   │   │   │   ├── s3-trace-provider.ts
│   │   │   │   │   ├── trace-signing.ts
│   │   │   │   │   ├── trace-cleanup.ts
│   │   │   │   │   └── storage-factory.ts
│   │   │   │   ├── cleanup/       policy-driven cleanup engine
│   │   │   │   ├── prisma.ts      shared Prisma client
│   │   │   │   ├── logger.ts      pino logger
│   │   │   │   ├── config.ts      environment config
│   │   │   │   └── pagination.ts  pagination helpers
│   │   │   └── jobs/              background jobs (cleanup)
│   │   └── Dockerfile.api
│   │
│   └── web/                       Next.js dashboard
│       ├── src/app/                dashboard, test-cases, runs, settings, traces
│       ├── src/lib/api.ts          typed fetch wrappers
│       └── Dockerfile.web
│
├── packages/
│   ├── cli/                       getassertive CLI (init, create, sync, ui, view, upload)
│   │   ├── src/
│   │   │   ├── commands/          CLI commands
│   │   │   ├── parser/            AST-based annotation parser
│   │   │   ├── scanner/           file scanner with .gitignore support
│   │   │   ├── utils/             sync cache, path normalization, duplicate detection
│   │   │   └── lib/               API client, config loading
│   ├── helper/                    assertive.* test-authoring metadata helper
│   │   └── src/
│   │       ├── assertive.ts       main helper API
│   │       ├── store.ts           in-memory metadata store
│   │       └── metadata.ts        metadata extraction
│   ├── reporter/                  Playwright reporter (batch reporting, trace upload, retry queue)
│   │   └── src/
│   │       ├── reporter.ts        AssertiveReporter class
│   │       ├── client.ts          HTTP client for API
│   │       ├── offline-queue.ts   local pending-results queue
│   │       ├── config.ts          reporter config resolution
│   │       └── context.ts         CI context detection
│   ├── database/                  Prisma schema, migrations, seed, shared client
│   │   └── prisma/
│   │       └── schema.prisma      current schema
│   └── shared/                    SyncPayload/SyncTestCase types, error codes, config schema
│       └── src/
│           ├── sync.ts           SyncTestCase, SyncPayload interfaces
│           ├── constants/        error codes, history actions
│           ├── config/           assertive config loading
│           └── security.ts       API scopes, organization roles
│
├── docker-compose.yml              api + web + postgres (+ minio for local S3-compatible testing)
├── .assertive/                     (gitignored) local PGlite data, sync cache, pending-results queue
└── docs/
    ├── PRD.md
    ├── architecture.md
    ├── rules.md
    ├── phases.md
    ├── design.md
    └── ASSERTIVE_V1_BLUEPRINT.md
    └── ASSERTIVE_V1_IMPLEMENTATION_TRACKER.md
```

## 5. Tech Stack

| Layer                  | Choice                                                                                                                | Why                                                                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| API framework          | Hono                                                                                                                  | Lightweight, fast, edge-compatible if ever needed — already the current implementation choice                                                     |
| Web dashboard          | Next.js                                                                                                               | Server/client component split fits the "server-side proxy keeps API keys off the client" pattern already in use                                   |
| ORM                    | Prisma                                                                                                                | Already in use; migrations + typed client fit the multi-table relational schema well                                                              |
| Local database         | **PGlite** (WASM Postgres)                                                                                            | Zero-config, but same SQL dialect as hosted Postgres — no query-layer fork between local and team mode (see PRD Resolved Ambiguities)             |
| Hosted database        | PostgreSQL 17                                                                                                         | JSONB (`custom_fields`, `changes`), array columns (`scopes`), GIN indexes — all used meaningfully, not just "a SQL database"                      |
| Object storage         | `StorageProvider` interface: `LocalStorageProvider` (fs) / `S3StorageProvider` (AWS SDK, R2/MinIO-compatible)         | Config-switchable, no code change between solo-dev and team deployment                                                                            |
| CLI tooling            | `commander` + `inquirer`/`clack`, `jiti` for on-the-fly TS config loading                                             | Standard, well-understood; `jiti` specifically solves "load a .ts config file without a build step" cleanly                                       |
| Task runner / monorepo | pnpm + Turborepo                                                                                                      | Already in use; enables independent Docker builds per app despite shared packages                                                                 |
| Testing                | Vitest (unit/integration), a real Playwright project under `packages/playground` for reporter/helper end-to-end tests | Fast unit/integration loop, and testing the reporter against _real_ Playwright output (not mocked) is the only way to catch reporter-format drift |
