![CI](https://github.com/aakash811/Assertive_v1/actions/workflows/ci.yml/badge.svg)

# Assertive

Assertive is a pnpm/Turbo monorepo for tracking Playwright test inventory, test execution history, run batches, traces, manual overrides, flakiness, tags, suites, metrics, and dashboard analytics.

The current product is built around five surfaces:

- `packages/helper`: small Playwright-side metadata helper used inside test files.
- `packages/cli`: local developer CLI for init, project linking, static test discovery, sync, status, history, dashboard launch, and scaffolding.
- `packages/reporter`: Playwright reporter that creates run batches, uploads test results, uploads traces, and queues results when the API is offline.
- `apps/api`: Hono API that authenticates API keys, validates requests, applies business rules, and persists through Prisma.
- `apps/web`: Next.js dashboard that reads and mutates API data through a server-side proxy.

## Tech Stack

- Package manager/workspace: `pnpm`, `pnpm-workspace.yaml`
- Task runner: Turbo
- API: Hono on Node, port `4321`
- Web: Next.js, port `3000`
- Database: PostgreSQL 17, Prisma ORM
- Testing: Vitest, Playwright playground
- Charts/UI data views: Recharts and React components
- Trace storage: local zip files under `storage/traces`

## Repository Layout

```txt
apps/
  api/                 Hono API, routes, services, repositories, validators
  web/                 Next.js dashboard and API proxy
packages/
  cli/                 assertive CLI commands, scanner, parser, API client
  database/            Prisma schema, migrations, seed, shared Prisma client
  helper/              assertive.* metadata helper for test files
  playground/          sample Playwright tests
  reporter/            Playwright reporter and upload client
  shared/              shared config schema, sync DTOs, error codes
docs/
  architecture.md      short architecture notes
  TODO.md              deferred work and MVP checklist
docker-compose.yml     local PostgreSQL service
storage/traces/        uploaded Playwright trace zip files
```

## Architecture

```mermaid
flowchart LR
  Tests[Playwright test files] --> Helper[packages/helper]
  Tests --> CLI[packages/cli sync]
  CLI --> API[apps/api]
  Reporter[packages/reporter] --> API
  API --> Prisma[Prisma client]
  Prisma --> DB[(PostgreSQL)]
  Web[apps/web] --> Proxy[Next /api/assertive proxy]
  Proxy --> API
  API --> Traces[(storage/traces)]
```

The backend follows a simple layered pattern:

```txt
Route -> Validator -> Service -> Repository -> Prisma -> PostgreSQL
```

- Routes define HTTP shape, auth boundaries, query parsing, and response wrapping.
- Validators use Zod for request bodies on higher-risk write paths.
- Services contain business rules such as sync diffing, stale marking, manual override clearing, run counter updates, and flakiness recalculation.
- Repositories contain Prisma queries and include/filter definitions.
- API responses use `{ success: true, data }`, paginated `{ success: true, items, pagination }`, or `{ success: false, error }`.

## End-To-End Workflow

### 1. Author Tests

Playwright tests can call helpers from `@assertive/helper`:

```ts
import { assertive } from "@assertive/helper";

assertive.id("user can log in", "AUTH-001");
assertive.owner("user can log in", "qa@example.com");
assertive.priority("user can log in", "high");
assertive.type("user can log in", "e2e");
assertive.tags("user can log in", "auth", "smoke");
assertive.field("user can log in", "component", "login");
```

`packages/helper` stores metadata in an in-memory `Map` keyed by test title. The reporter can `flush(test.title)` during execution to read and clear runtime metadata.

### 2. Discover And Sync Inventory

`assertive sync` loads `.assertive.json`, scans configured test globs, parses TypeScript with Babel, and extracts:

- `test(...)` and `it(...)` calls with literal string titles
- parent `test.describe(...)` suite name
- `assertive.id`, `owner`, `priority`, `type`, `tags`, and `field` calls matching the test title

The CLI builds a `SyncPayload` and currently attempts to send it to:

```txt
POST /api/projects/:projectId/sync
Authorization: Bearer <api-key>
```

The API implementation currently exposes `/api/sync` and `/api/sync/projects/:id/sync`, so this client/server route drift is called out in the gaps section.

The sync service upserts test cases, creates missing suites and tags, updates metadata, records history, restores stale tests, and marks missing tests as `STALE`.

### 3. Execute Tests And Upload Results

The Playwright reporter starts by creating a run batch:

```txt
POST /api/run-batches
```

For each completed test, it collects status, duration, browser, OS, errors, retry attempt, and trace attachment. If a trace zip exists, the reporter requests an upload URL, uploads the zip, and stores the returned trace URL on the result.

At the end of the run, results are uploaded in one batch:

```txt
POST /api/run-batches/:id/upload
```

The API creates `TestRun` rows for known test cases, updates run batch counters, updates each test case `lastStatus`, clears manual overrides when a real result arrives, records history, and recalculates flakiness from recent runs.

If the API is unavailable, the reporter stores a local offline queue and retries queued uploads on the next run.

### 4. View Dashboard

`apps/web` uses `src/lib/api.ts` to call local paths like `/api/assertive/test-cases`. The Next route at `apps/web/src/app/api/assertive/[...path]/route.ts` proxies these requests to the API, injects `Authorization: Bearer ${ASSERTIVE_API_KEY}`, and forwards the selected project cookie as `x-project-id`.

Dashboard pages currently cover:

- `/dashboard`: metrics, trends, status distribution, recent failures, recent run batches
- `/analytics`: pass/failure rates, most failing tests, slowest tests, flaky tests
- `/test-cases`: searchable and filterable test case explorer
- `/test-cases/[id]`: details, metadata, history, recent runs, tags, traces, manual override modal
- `/runs`: run batch explorer
- `/runs/[id]`: run batch details and results
- `/settings`: project settings, API keys, organization, members
- `/traces/[traceKey]`: trace viewer page

## Data Model

The Prisma schema is in `packages/database/prisma/schema.prisma`.

- `User`: user identity record used by organization membership.
- `Organization`: tenant container for projects and API keys.
- `OrganizationMember`: user-to-organization role link. Roles are plain strings today.
- `Project`: project-level boundary for test cases, suites, tags, and run batches.
- `ApiKey`: hashed bearer token scoped to an organization.
- `TestSuite`: optional hierarchical grouping for test cases.
- `TestCase`: inventory item with unique ID, metadata, status, flakiness, sync state, override fields, tags, runs, and history.
- `Tag`: project-scoped label.
- `TestCaseTag`: many-to-many test/tag join.
- `RunBatch`: one test execution batch with branch, commit, environment, CI metadata, and result counters.
- `TestRun`: one result for one test in one batch.
- `TestCaseHistory`: audit trail for creation, update, stale, restore, status change, manual override, and override clearing.

## Modules

### `packages/helper`

Purpose: test authoring metadata.

- Exposes `assertive.id`, `owner`, `priority`, `type`, `tags`, `field`, and `attach`.
- Stores metadata in `metadataStore`.
- `flush(testName)` returns and deletes metadata for reporter use.

### `packages/cli`

Purpose: local workflow automation.

- `init`: creates `.assertive.json` and `.assertive/.gitignore`.
- `projects`: lists projects available to the configured API key.
- `projects use <projectId>` / `link <projectId>`: writes project ID into `.assertive.json`.
- `sync`: scans files, parses annotations, detects duplicate IDs, posts sync payload.
- `status`: reads sync counts.
- `history <externalId>`: prints history for a test.
- `create <title>`: creates a DB test case and writes a Playwright scaffold.
- `ui`: starts API and web dev servers, then opens the dashboard.
- `view <externalId>`: opens the dashboard detail page for a test.
- `cleanup`: calls the cleanup endpoint.
- `upload <file>`: JUnit upload scaffold only; not wired yet.

### `packages/reporter`

Purpose: runtime result ingestion from Playwright.

- Resolves config from reporter options or `ASSERTIVE_API_URL` / `ASSERTIVE_API_KEY`.
- Creates run batches with CI context.
- Uploads traces through signed-style API URLs backed by local storage.
- Uploads batch results on `onEnd`.
- Queues uploads offline and flushes them on later runs.

### `packages/shared`

Purpose: shared contracts.

- `.assertive.json` schema and loader.
- `SyncTestCase`, `SyncPayload`, `SyncResponse`.
- Common API error code constants.

### `packages/database`

Purpose: Prisma schema/client ownership.

- Contains migrations and seed scripts.
- Exports the Prisma client used by API repositories.

### `apps/api`

Purpose: authenticated product API.

- Global CORS allows `http://localhost:3000` and Playwright trace viewer.
- Auth uses bearer API keys hashed with SHA-256.
- `x-project-id` selects a project inside the API key organization; otherwise the first organization project is used.
- App errors and Zod errors are normalized into the shared error response shape.

### `apps/web`

Purpose: dashboard UI.

- Server/client components call typed helper functions in `src/lib/api.ts`.
- The internal proxy keeps API keys server-side.
- Current UI supports dashboard, analytics, test cases, run batches, traces, settings, API key management, and manual status override.

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Start PostgreSQL:

```bash
docker compose up -d postgres
```

3. Configure environment:

```bash
cp .env.example .env
```

Important variables:

- `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/assertive`
- `ASSERTIVE_API_KEY=<dashboard/reporter/cli key>`
- `ASSERTIVE_INTERNAL_API_URL=http://localhost:4321/api`
- `APP_URL=http://localhost:4321`

4. Run migrations and seed data:

```bash
pnpm --filter @assertive/database migrate
pnpm --filter @assertive/database seed
```

5. Start apps:

```bash
pnpm dev
```

Or use the CLI after `.assertive.json` is configured:

```bash
pnpm --filter @assertive/cli dev ui
```

## API Conventions

Protected API routes require:

```txt
Authorization: Bearer <ask_live_...>
x-project-id: <project-id>        optional
Content-Type: application/json    for JSON writes
```

Success:

```json
{ "success": true, "data": {} }
```

Paginated success:

```json
{
  "success": true,
  "items": [],
  "pagination": { "page": 1, "limit": 20, "total": 0 }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {}
  }
}
```

## API Endpoints

### Health And Diagnostics

| Method | Path | Request | Response | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/api/health` | none | `{ status, timestamp }` | Public health check. |
| `GET` | `/test` | none | `{ projects }` | Public diagnostic project count. |
| `GET` | `/api/me` | auth | `{ projectId, apiKeyId }` | Confirms auth context. |

### API Keys

| Method | Path | Request | Response | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/api/api-keys` | none | `ApiKey[]` | Uses first organization in DB; currently not bearer-protected. |
| `POST` | `/api/api-keys` | `{ "name": "CI" }` | `{ id, key }` | Creates `ask_live_...`; stores only hash. |
| `DELETE` | `/api/api-keys/:id` | none | `{ success: true }` | Sets `isActive=false`. |

### Projects

| Method | Path | Request | Response | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/api/projects` | auth | `Project[]` | Organization projects for API key. |
| `POST` | `/api/projects` | `{ name, slug, organizationId }` | `Project` | Creates a project. |
| `GET` | `/api/projects/:id` | auth | `Project` | Fetch by ID. |
| `PATCH` | `/api/projects/:id` | `{ name }` | `Project` | Rename any project by ID. |
| `DELETE` | `/api/projects/:id` | auth | `{ success: true }` | Deletes project. |
| `GET` | `/api/project` | auth, optional `x-project-id` | `Project` | Current selected project. |
| `PATCH` | `/api/project` | `{ name }` | `Project` | Rename current selected project. |

### Organization

| Method | Path | Request | Response | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/api/organization` | auth | `Organization` | Current API key organization. |
| `GET` | `/api/organization/members` | auth | `OrganizationMember[]` with `user` | Ordered by role. |

### Sync And Status

| Method | Path | Request | Response | Notes |
| --- | --- | --- | --- | --- |
| `POST` | `/api/sync` | `{ testCases: SyncTestCase[] }` | `{ synced, created, updated, restored, stale }` | Uses auth-selected project. |
| `POST` | `/api/sync/projects/:id/sync` | `{ testCases: SyncTestCase[] }` | same | Rejects if route project differs from auth project. |
| `GET` | `/api/status` | auth | `{ total, synced, stale }` | Sync state summary. |

`SyncTestCase`:

```json
{
  "externalId": "AUTH-001",
  "title": "user can log in",
  "filePath": "tests/auth.spec.ts",
  "owner": "qa@example.com",
  "priority": "high",
  "testType": "e2e",
  "suite": "auth",
  "tags": ["auth", "smoke"],
  "customFields": { "component": "login" }
}
```

### Test Cases

| Method | Path | Request | Response | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/api/test-cases` | query: `page`, `limit`, `q`, `status`, `owner`, `tag`, `flaky`, `suite`, `syncState`, `testType` | paginated `TestCase[]` | Includes tags. |
| `POST` | `/api/test-cases` | `{ title, description?, owner?, priority?, testType?, suiteId?, tags? }` | `TestCase` | Generates `TST-###` unique ID. |
| `GET` | `/api/test-cases/:id` | auth | `TestCase` | Includes suite, tags, last 10 runs, last 20 history rows. |
| `PATCH` | `/api/test-cases/:id` | `{ title?, description? }` | `TestCase` | Metadata update. |
| `DELETE` | `/api/test-cases/:id` | auth | `{ success: true }` | Deletes test case. |
| `GET` | `/api/test-cases/by-external-id/:externalId` | auth | `TestCase` | Used by reporter and CLI view. |
| `POST` | `/api/test-cases/discover` | `{ externalId, title }` | `TestCase` | Creates minimal record if missing. |
| `GET` | `/api/test-cases/:id/history` | query: `page`, `limit` | paginated history | History by DB ID. |
| `GET` | `/api/history/:externalId` | query: `page`, `limit` | paginated history | History by stable unique ID. |

### Test Runs And Run Batches

| Method | Path | Request | Response | Notes |
| --- | --- | --- | --- | --- |
| `POST` | `/api/run-batches` | `{ branch?, commitSha?, environment?, triggeredBy?, ciBuildId?, ciBuildUrl? }` | `RunBatch` | Reporter calls on run start. |
| `GET` | `/api/run-batches` | query: `page`, `limit`, `q`, `environment`, `triggeredBy` | paginated `RunBatch[]` | Search checks branch and commit SHA. |
| `GET` | `/api/run-batches/:id` | auth | `RunBatch` with `runs.testCase` | Run detail page. |
| `POST` | `/api/run-batches/:id/upload` | `{ results: BatchResult[] }` | `{ uploaded }` | Creates test runs for matching unique IDs. |
| `POST` | `/api/test-runs` | `{ testCaseId, runBatchId, status, durationMs?, browser?, os?, traceUrl?, errorMessage?, errorStack? }` | `TestRun` | Direct single-run creation. |
| `GET` | `/api/test-runs` | query: `page`, `limit`, `testCaseId?` | paginated `TestRun[]` | Includes test case. |
| `GET` | `/api/test-runs/:id` | auth | `TestRun` | Fetch one run. |

`BatchResult` accepted by upload:

```json
{
  "externalId": "AUTH-001",
  "status": "PASSED",
  "durationMs": 1234,
  "errorMessage": "optional",
  "traceUrl": "http://localhost:4321/api/traces/<traceKey>"
}
```

### Tags And Suites

| Method | Path | Request | Response | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/api/tags` | auth | `Tag[]` | Project tags. |
| `POST` | `/api/tags` | `{ name, color? }` | `Tag` | Creates project tag. |
| `POST` | `/api/tags/:tagId/test-cases/:testCaseId` | none | join row | Assign tag. |
| `DELETE` | `/api/tags/:tagId/test-cases/:testCaseId` | none | `{ success: true }` | Remove tag assignment. |
| `DELETE` | `/api/tags/:id` | none | `{ success: true }` | Delete tag. |
| `GET` | `/api/test-suites` | auth | `TestSuite[]` | Project suites. |
| `POST` | `/api/test-suites` | `{ name, parentId? }` | `TestSuite` | Creates suite. |
| `POST` | `/api/test-suites/:suiteId/test-cases/:testCaseId` | none | `TestCase` | Assign test case to suite. |
| `PATCH` | `/api/test-suites/:id` | `{ name?, parentId? }` | `TestSuite` | Update suite. |
| `DELETE` | `/api/test-suites/:id` | none | `{ success: true }` | Delete suite. |

### Manual Override

| Method | Path | Request | Response | Notes |
| --- | --- | --- | --- | --- |
| `PATCH` | `/api/manual-overrides/test-cases/:id/override` | `{ status, comment }` | `{ success, testCase }` | Mounted direct API route. |
| `PATCH` | `/api/test-cases/:id/override` | `{ status, comment }` | proxied expectation in web client | Web client currently calls this path, but API mounts override under `/api/manual-overrides`; path alignment should be fixed. |

Allowed override status values: `PASSED`, `FAILED`, `SKIPPED`, `UNKNOWN`. Comments must be 3-500 characters.

The service creates a manual run batch, creates a manual `TestRun`, updates batch counters, updates `TestCase.lastStatus`, marks `isManualOverride=true`, and writes `STATUS_OVERRIDE` history.

### Metrics And Analytics

| Method | Path | Request | Response | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/api/metrics/summary` | auth | totals, pass rate, trend, breakdowns | Used by dashboard. |
| `GET` | `/api/analytics/summary` | auth | totals, pass/failure rate | Used by analytics page. |
| `GET` | `/api/analytics/failures` | auth | top failing tests | Sorted desc, top 10. |
| `GET` | `/api/analytics/slowest` | auth | slowest tests | Average duration, top 10. |
| `GET` | `/api/analytics/flaky` | auth | flaky score list | Based on recent transitions. |
| `GET` | `/api/analytics/status-distribution` | auth | status counts | Counts all runs by status. |
| `GET` | `/api/analytics/recent-failures` | auth | latest failed runs | Includes run batch branch. |

### Traces

| Method | Path | Request | Response | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/api/test-runs/upload-url` | auth | `{ traceKey, uploadUrl, traceUrl }` | Reporter requests before upload. |
| `PUT` | `/api/traces/:traceKey` | zip bytes | `{ success, traceKey, traceUrl }` | Saves zip locally. |
| `GET` | `/api/traces/:traceKey` | none | zip bytes | Public trace retrieval with CORS `*`. |

### Cleanup

| Method | Path | Request | Response | Notes |
| --- | --- | --- | --- | --- |
| `POST` | `/api/cleanup` | none | `{ runs, history, traces }` | Deletes all runs and history; trace cleanup is currently `0`. |

## Current Implementation Gaps

- Authentication/login UI is not implemented; the dashboard relies on `ASSERTIVE_API_KEY` configured server-side.
- RBAC is not implemented. Organization member roles exist as strings but are not enforced.
- Team/member invitation workflows are not implemented.
- Some route paths need alignment:
  - CLI posts `/api/projects/:id/sync`, while API currently mounts the project sync handler under `/api/sync/projects/:id/sync`.
  - Web manual override calls `/api/test-cases/:id/override`, while API mounts `/api/manual-overrides/test-cases/:id/override`.
- Web test case history expects a plain array, while the API returns a paginated response.
- Web test case filters send `type`, while the API reads `testType`.
- API key create/list/delete routes use the first organization and are not currently protected by bearer auth.
- `createTestCaseSchema` accepts `tags`, but `testCaseService.create` does not persist those tags.
- Reporter sends fields such as `browser`, `os`, `errorStack`, `attemptNumber`, and `retryOf`, but batch upload validation/service currently persists only unique ID, status, duration, error message, and trace URL.
- Reporter discovers missing tests with metadata, but the API discover validator only accepts `externalId` and `title`; metadata is ignored.
- JUnit upload command is scaffolded but not wired.
- Cleanup ignores retention env vars and does not delete traces.
- PGlite, S3 storage, and retention settings are present in env examples/TODO but not implemented in the active code path.
- Web project switcher is partially represented by project cookie helpers, but the header dropdown remains on the TODO list.
- Test case sorting is mostly UI-side; API ordering is fixed to `updatedAt desc`.

## Improvement Opportunities

- Add an OpenAPI spec or generated API client so CLI, reporter, web, and API validators cannot drift.
- Standardize route mounting for sync and manual overrides, then add integration tests for every documented endpoint.
- Protect API key management and project mutation routes with organization-aware authorization.
- Add real authentication with sessions, login pages, and role checks.
- Enforce RBAC for organization admin, tester, and viewer roles.
- Persist the full reporter payload, including browser, OS, retries, attempt number, retry chain, and stack traces.
- Make batch upload transactional so counters and test runs cannot partially update.
- Add pagination limits and request size limits to protect API endpoints.
- Use retention settings for cleanup and implement trace deletion.
- Abstract trace storage behind a provider interface before adding S3.
- Add repository/service tests for project boundaries and `x-project-id` authorization.
- Improve sync parser support for non-literal titles or document that only literal test names are supported.
- Avoid generated IDs based only on current count if deleted test cases can leave reusable numbers.
- Remove browser-facing `console.log` noise from web API helpers.
- Add seed/setup documentation for creating the first organization, project, and API key.

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test

pnpm --filter api dev
pnpm --filter web dev
pnpm --filter @assertive/database migrate
pnpm --filter @assertive/database seed
pnpm --filter @assertive/cli dev sync
```

## Configuration Files

`.assertive.json` is used by the CLI:

```json
{
  "apiUrl": "http://localhost:4321",
  "apiKey": "ask_live_...",
  "framework": "playwright",
  "projectId": "00000000-0000-0000-0000-000000000000",
  "include": ["tests/**/*.spec.ts"],
  "ignore": ["node_modules/**", "dist/**", "coverage/**"]
}
```

Do not commit real API keys. Treat both `.env` and `.assertive.json` as local secrets when they contain live values.
