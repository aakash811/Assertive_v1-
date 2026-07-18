# Assertive — Developer-First Test Management Platform

_This PRD reconciles the original brainstorming document with the current codebase state. Where the brainstorm was ambiguous or self-contradictory (e.g. SQLite vs PGlite for local storage, single "getassertive" package vs the current multi-package monorepo), this document picks the stronger option and states the reasoning — see the "Resolved Ambiguities" section at the end._

## 1. Problem Statement

Traditional test case management tools are disconnected from how developers actually work: manual data entry, stale test plans that drift from the real code, and no real visibility into whether "tests" reflect reality. Developers end up either skipping test documentation entirely or maintaining it in a tool nobody opens.

**Goal:** Build a test management platform where the **code is the source of truth**. Developers annotate Playwright tests with lightweight metadata calls; a CLI syncs that metadata into a backend; a custom reporter streams real run results (pass/fail, duration, traces) automatically. The dashboard becomes a live reflection of actual test health — not a document someone forgot to update.

## 2. Target Users & Deployment Modes

- **Solo developer**: zero-config local mode — `npx getassertive ui` starts everything with an embedded local database, no signup, no server to manage.
- **Small team**: shared Postgres + S3-compatible storage, still self-hostable via Docker Compose.
- **Enterprise**: multi-organization, multi-project, RBAC-enforced, audit-logged, with SSO as an explicit future item (not v1).

The same codebase serves all three — the only thing that changes is configuration (`assertive.config.ts` / env vars), never code.

## 3. Requirements

### 3.1 Functional Requirements

| ID   | Requirement                                                                                                                                                                                                                             |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1  | A developer can annotate a Playwright test with `assertive.id()`, `owner()`, `priority()`, `type()`, `tags()`, `field()` calls without leaving their test file                                                                          |
| FR2  | `getassertive sync` scans the codebase, parses annotations, and reconciles the result against the backend: new tests are created, existing tests are updated, tests no longer found in code are marked `stale` (never silently deleted) |
| FR3  | A custom Playwright reporter automatically reports every test run's result, duration, browser/OS, and (on failure) uploads a trace file — with zero manual reporting calls needed in the test itself                                    |
| FR4  | A test's `last_status` always reflects the most recent **automated** run; manual dashboard overrides are temporary annotations that get cleared the next time real automation reports a result                                          |
| FR5  | Every metadata change and status override is recorded in an immutable, queryable history/audit trail — who changed what, when, and the before/after diff                                                                                |
| FR6  | The dashboard computes a per-test flakiness score from recent run history and surfaces flaky tests distinctly from consistently-failing ones                                                                                            |
| FR7  | Failed test runs with a captured trace can be viewed in-browser via an embedded Playwright Trace Viewer, without downloading anything                                                                                                   |
| FR8  | The platform supports multiple organizations, each with multiple projects; a user can belong to multiple organizations with different roles in each                                                                                     |
| FR9  | API access (CLI, reporter) is authenticated via project-scoped API keys with granular scopes (read/write), never a user's personal credentials                                                                                          |
| FR10 | The reporter must never block or fail a test run due to backend unavailability — results queue locally and retry later                                                                                                                  |

### 3.2 Non-Functional Requirements

| ID   | Requirement                                                                                                                                                                                                 |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR1 | **Zero-config local start**: `npx getassertive ui` must work with no external services running — local embedded database, local file storage                                                                |
| NFR2 | **Multi-tenant data isolation**: every query is scoped by organization/project; a user must never be able to see another organization's data through any endpoint, including ones added later by mistake    |
| NFR3 | **Sync must be idempotent and non-destructive**: running `sync` repeatedly, or with a partially-reverted codebase, must never lose test history — "missing from code" always means `stale`, never `deleted` |
| NFR4 | **Reporter must degrade gracefully**: API downtime, network errors, or auth failures during a CI run must not fail the test run itself                                                                      |
| NFR5 | **Batch result ingestion must be transactional**: a partial failure while writing a batch of test runs must not leave `run_batches` counters inconsistent with the actual `test_runs` rows                  |
| NFR6 | **Self-hostable**: the full stack (API + web + Postgres + object storage) must run via a single `docker-compose up`, with clear environment-variable configuration                                          |
| NFR7 | **API and CLI/reporter contracts must not drift**: request/response shapes used by the CLI, reporter, and web client must be generated from or validated against a single shared source of truth            |

### 3.3 Current Implementation Status

This section maps each requirement to its actual codebase state as of the latest audit.

| ID   | Status | Notes |
| ---- | ------ | ----- |
| FR1  | Implemented | Helper package provides `assertive.id()`, `owner()`, `priority()`, `type()`, `tags()`, `field()`. CLI AST parser extracts annotations. |
| FR2  | Implemented | `getassertive sync` scans, parses, and POSTs to `/api/sync`. Backend reconciles new/updated/stale. Stale marking is implemented; hard deletion never occurs. |
| FR3  | Implemented | Reporter creates `RunBatch`, uploads `TestRun` results, captures traces. Offline queue handles API unavailability. |
| FR4  | Implemented | Manual override sets `is_manual_override = true`. Next automated run clears it via `testCaseRepository.clearManualOverride`. |
| FR5  | Implemented | `test_case_history` table records created/updated/restored/stale/status_changed/manual_override events. Immutable by design. |
| FR6  | Implemented | `flakinessService.recalculate` computes transition score over last 20 runs. `is_flaky` flag set when score >= 0.3. |
| FR7  | Partially implemented | Storage abstraction (`StorageProvider` interface) exists with `LocalStorageProvider` and `S3StorageProvider`. Dashboard trace embedding not verified. |
| FR8  | Partially implemented | Organization → Project → TestCase hierarchy exists. RBAC middleware exists but is **commented out**; role enforcement is not active. |
| FR9  | Implemented | API key auth via Bearer token. Scope middleware (`requireScope`) exists and is applied to API key routes. |
| FR10 | Implemented | Reporter retries 3× with exponential backoff, then writes to `.assertive/pending-results.json` offline queue. |

| ID   | Status | Notes |
| ---- | ------ | ----- |
| NFR1 | Partial | PGlite was selected for local mode but the current implementation uses standard Postgres via `DATABASE_URL`. Local embedded mode not yet implemented. |
| NFR2 | Partial | Most repository queries include `projectId`. However, some routes use `findFirst` instead of `findUnique`, RBAC is not enforced, and **no adversarial isolation tests exist**. |
| NFR3 | Implemented | Sync marks tests as `STALE` when absent from codebase. `syncState` field preserves history. |
| NFR4 | Implemented | Reporter catches all errors, logs warnings, and continues. Trace upload failures do not fail the batch. |
| NFR5 | Partial | `runBatchService.upload` wraps execution in `prisma.$transaction`. However, `testRunService.create` performs 5 separate non-transactional side-effects (increment counters, clear override, record history, recalculate flakiness) outside the batch transaction. |
| NFR6 | Partial | Dockerfiles and `docker-compose.yml` exist (not deeply audited). Environment configuration cleanup is incomplete. |
| NFR7 | Partial | Shared types exist in `@assertive/shared`. However, reporter payload fields (`browser`, `os`, `errorStack`, `attemptNumber`, `retryOf`) are not fully persisted, indicating contract drift. |

## 4. Features (Prioritized)

### Must-Have (v1 — much of this already exists in the current codebase and needs hardening, not rebuilding)

1. Test case CRUD + sync reconciliation (create/update/mark-stale, never destructive)
2. Playwright reporter: automatic run reporting, trace upload on failure, retry-on-failure queue
3. Manual status override with required comment, auto-cleared by the next automated run, fully audited
4. Flakiness scoring from recent run history
5. Organization → Project → Test Case hierarchy with **enforced** RBAC (owner/admin/member/viewer)
6. API key management (create/list-masked/revoke), scoped per project
7. Dashboard: test case list/detail, run batch list/detail, metrics overview, embedded trace viewer
8. History/audit trail on every test case, queryable and paginated

### Nice-to-Have

9. Storage abstraction supporting both local filesystem and S3-compatible object storage, switchable via config with no code changes
10. Data retention policies (configurable TTL for runs/history/traces) with a cleanup command
11. Incremental sync (file-hash caching to avoid re-parsing unchanged files on large codebases)
12. JUnit XML upload path for non-Playwright test results (explicitly scoped as a v1 stub, not a full implementation)

### Explicitly Skip (v1)

- SSO/SAML — RBAC and API-key auth cover v1; note SSO as a named future item
- The full "Team" sub-layer inside an Organization described in early brainstorming — collapsed into direct Organization → Member roles (see Resolved Ambiguities); revisit only if a real need for team-level sub-scoping emerges
- A hand-rolled "Constellation" 3D landing-page visualization — cool concept, zero product value; a clean, fast, honest dashboard beats a marketing animation every time (see design.md)

## 5. Success Criteria

| Criterion | Status | Gap |
| --------- | ------ | --- |
| Annotated test → sync → playwright run produces accurate test case and run record | **Met** | End-to-end pipeline functional. |
| Test deleted from codebase is marked `stale`, not deleted | **Met** | `syncState` field and stale-marking logic implemented. |
| User in Org A cannot retrieve Org B's data via any endpoint | **Not Met** | No adversarial isolation tests exist. RBAC enforcement is commented out. Some queries use `findFirst` instead of `findUnique`. |
| Batch of 50 results with mid-batch failure fully commits or rolls back | **Not Met** | Batch upload is transactional, but `testRunService.create` performs non-transactional side-effects (counter increments, history creation, flakiness recalculation) that can leave partial state. |
| Flaky test correctly flagged, stable test not, verified with seeded fixture | **Not Met** | Flakiness formula implemented, but no fixture-based test asserts exact `flaky_score` values. |

## 6. Resume Bullet Targets (fill in with real numbers once hardened)

- "Built a developer-first test management platform (Hono API, Next.js dashboard, Prisma/Postgres) that syncs test metadata directly from Playwright source code, eliminating manual test documentation."
- "Designed a custom Playwright reporter with automatic trace capture, retry-on-failure queuing, and zero-blocking failure handling, ensuring CI runs are never affected by backend downtime."
- "Enforced multi-tenant data isolation across a multi-organization, multi-project RBAC model, with an adversarial test suite verifying cross-tenant access is blocked at every endpoint."
- "Made batch test-run ingestion fully transactional, eliminating a class of partial-write bugs where run-batch counters could drift from actual stored results."
- "Implemented flakiness detection from run-history transition analysis, surfacing unstable tests separately from tests that are simply broken."

## 7. Resolved Ambiguities (brainstorm → decision)

| Ambiguity in source doc                                                                                                   | Decision                                                                                                                                                                                                | Why / Current State                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Local DB: SQLite vs PGlite vs "just use Postgres"                                                                         | **PGlite** for zero-config local mode, real **Postgres** for hosted/team mode                                                                                                                           | SQLite forks the query dialect from production Postgres (different types, no native JSONB/array support used elsewhere in the schema). PGlite is WASM-compiled Postgres — same SQL, same schema, zero setup. One dialect everywhere. **Gap: local embedded mode not yet implemented.** |
| Single published `getassertive` package vs current multi-package monorepo (`@assertive/cli`, `@assertive/database`, etc.) | Keep the **current multi-package monorepo** internally; publish a single `getassertive` package externally via `exports`/subpath re-exports (`getassertive/helper`, `getassertive/reporter/playwright`) | Internal package separation is good engineering (clear ownership, independent builds); the _external_ single-install experience is what the user-facing brainstorm was actually asking for — these aren't in conflict, the doc conflated packaging with distribution. |
| "Team" as a sub-layer inside "Organization" (User↔Team↔Role) vs direct Organization↔Member↔Role                           | **Direct** Organization ↔ Member ↔ Role (owner/admin/member/viewer), matching the actual implemented SQL schema                                                                                         | The Team layer added a second join table and a second role enum with no described use case beyond "groups of users" — the current schema already achieves project-level access scoping without it. Revisit only if a real multi-team-per-org need appears.            |
| `projects` table missing `id_counter` despite `unique_id` generation logic (`id_prefix + counter`) depending on it        | **Gap: not yet implemented.** Add `id_counter INTEGER NOT NULL DEFAULT 0` to `projects` and implement atomic `unique_id` generation before v1.                                                          | The generation logic requires it for concurrent-safe `TST-001`-style IDs. The current schema uses `externalId` (developer-provided string) instead.                                                                                                                                  |
| Storage: "bundled local files" vs S3 vs the general `StorageProvider` interface concept                                   | Implement the **`StorageProvider` interface** (`LocalStorageProvider`, `S3StorageProvider`) as the one mechanism, config-selected                                                                       | This was actually the least ambiguous part of the doc — multiple sections converge on the same interface pattern, just described from different angles. **Implemented but dashboard trace embedding unverified.**         |
| RBAC enforcement: documented as required but middleware is commented out                                                   | **Gap: RBAC middleware (`require-role.ts`) exists but is entirely commented out.** `organizationRole` is not set in Hono context. Scope enforcement only applies to API key routes.                     | Must be uncommented, wired into `apiKeyAuth`, and enforced on all mutating routes before v1.                                                                                                                                                                                       |
| History action typing: blueprint specifies `history_action_enum`, codebase uses plain `String`                           | **Gap: not yet implemented.** Replace `action String` with `action HistoryActionEnum` in Prisma schema and migrate existing data.                                                                     | Current codebase uses string constants (`HISTORY_ACTIONS` in shared package) but DB column is untyped.                                                                                                                                                                               |
