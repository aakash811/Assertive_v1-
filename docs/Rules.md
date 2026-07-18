# rules.md — Assertive

## 1. Libraries — Use vs Avoid

### Use

- `zod` for every write-path validator — request bodies, `assertive.config.ts` shape, and the `SyncPayload`/`SyncTestCase` contracts shared between CLI, reporter, and API
- `jiti` for loading `assertive.config.ts` at runtime in the CLI and reporter — zero-build TypeScript config loading, exactly the right tool for "read a user's TS config file without compiling their whole project"
- `commander` + `clack` (or `inquirer`) for the CLI — standard, scriptable, good DX for the `init` wizard
- Prisma for all database access from `apps/api` — no raw SQL in application code except inside `packages/database/migrations` where schema/index definitions belong
- `pino` for structured JSON logs in production (matches the logging choice already used in your other TS projects — Forge, Pulse — keep it consistent)
- Vitest for unit/integration tests; a **real** `@playwright/test` project under `packages/playground` for reporter end-to-end tests — don't mock Playwright's Reporter interface, run it for real

### Avoid, and why

- **An ORM abstraction over the `StorageProvider` interface** — keep `LocalStorageProvider`/`S3StorageProvider` as plain classes implementing a small interface (`upload`, `getSignedUrl`, `delete`). A generic "storage library" would hide the exact thing this interface exists to make explicit and swappable.
- **SQLite for local mode** — see architecture.md's Resolved Ambiguities: PGlite keeps one SQL dialect across local and hosted modes. Don't reintroduce a SQLite path "for simplicity" — it reintroduces exactly the dialect-fork problem PGlite was chosen to avoid.
- **A generic "multi-tenancy" npm package that auto-scopes queries** — same principle as in Vault's rules.md: a library that injects `WHERE project_id = ...` for you is doing the isolation _for_ you, which undercuts the value of understanding and demonstrating it yourself. Write the scoping explicitly in each repository method.
- **Building a second "Team" layer inside Organization** — resolved in the PRD; don't resurrect it mid-implementation without a concrete need, it adds a join table and a role enum with no described use case.
- **Client-side-only route protection in the dashboard** — every RBAC check must be enforced server-side in `apps/api`; the Next.js UI hiding a button is a UX nicety, never the actual permission boundary.

## 2. Design Conventions

- **`sync_state = 'stale'` is not deletion, and no code path should ever hard-delete a `test_case` as a side effect of sync.** If a test disappears from the codebase, mark it stale. Deletion is a separate, explicit, user-initiated action (`DELETE /api/test-cases/:id`), never something that happens as a consequence of running `sync`.
- **`is_manual_override` is _always_ overwritten by the next automated result, never merged with it.** Automation is the permanent source of truth for `last_status`; manual overrides are annotations on top, preserved in history but never allowed to "win" against a newer automated run. Don't add a "pin this override" feature without a very deliberate product discussion — it directly contradicts the audit-trail design principle.
- **Every write to `test_cases` that changes metadata must produce a `test_case_history` row in the same transaction.** If you add a new mutable field to `test_cases`, you must also add it to the diff-generation logic — an un-audited field is a silent gap in the audit trail, which defeats the point of having one.
- **Tenant scoping happens in the repository layer, not the route or service layer.** Every repository method that touches a tenant-scoped table takes `projectId` (or `orgId` for org-level resources) as a required parameter, not an optional one — make it a TypeScript compile error to write a query without it, not a runtime discipline problem.
- **The reporter never throws in a way that fails the test run.** Every reporter method (`onTestEnd`, `onEnd`, trace upload) must catch its own errors, log them, and continue. A backend outage during a CI run is a "we lost some reporting data, logged for later" event, never a "the CI pipeline failed" event.
 - **`unique_id` generation (`id_prefix` + `id_counter`) must be atomic under concurrent test creation.** Two developers running `create` at the same second must not receive the same `TST-042` — increment `id_counter` via a single atomic `UPDATE ... RETURNING`, not a read-then-write. **Gap: `id_counter` column does not yet exist in the `projects` table; this must be added and wired before v1.**
 - **All tenant-scoped repository queries must use `findUnique` when querying by `id` + `projectId`, not `findFirst`.** `findFirst` silently returns the first matching row if the `id` is not unique within the project scope, which can mask data leaks or return wrong records under edge cases. Make this a lint rule or code-review checklist item.
 - **RBAC must be enforced server-side on all mutating routes before business logic executes.** The `requireRole` middleware exists but is entirely commented out. `organizationRole` is not set in Hono context. No route currently checks caller role against required permission. Uncomment, wire, and enforce before v1.

## 3. Error Handling

- **Sync reconciliation failures are per-test-case, not all-or-nothing for the whole sync.** If one test case's payload is malformed, log it, skip it, and continue reconciling the rest — a single bad annotation in a 500-test codebase shouldn't block syncing the other 499.
- **Batch run ingestion (`POST /api/test-runs`) is all-or-nothing within a batch, via a single transaction** (NFR5) — this is the opposite of the sync rule above, deliberately: a batch represents one atomic execution event (one `npx playwright test` run), and partial ingestion would make `run_batches` counters lie about what actually happened.
- **API key validation failures return 401 with no detail about _why_** (expired vs revoked vs malformed vs simply-wrong) to the caller — but log the specific reason server-side. Don't help an attacker distinguish "this key format is wrong" from "this key was revoked."
- **RBAC failures return 403** (not 404) for authenticated users acting within their organization but exceeding their role's permissions — unlike Vault's cross-_tenant_ case, this is a legitimate "you don't have permission" situation the user should understand, not a boundary you're hiding the existence of.
- **Cross-_organization_ access attempts return 404**, matching Vault's principle — a viewer in Org A should get "not found" for an Org B project ID, not "forbidden" (which would confirm the project exists).
- **Trace upload failures never fail the batch report.** If a pre-signed URL request or the upload itself fails, log a warning, omit `trace_url` from that result, and continue — a missing trace on one failed test is much better than losing the pass/fail signal for the whole batch.
- **Config loading failures (`assertive.config.ts` missing or invalid) fail fast with a clear message** at CLI startup — this is the one place "fail loud immediately" is correct, since a misconfigured local dev environment silently falling back to wrong defaults would be confusing, not helpful.

## 4. Testing Rules

 - **The multi-tenant isolation tests are not optional**, same principle as Vault: at minimum, a test creating two organizations/projects and confirming an API key from Project A cannot read/write Project B's test cases, runs, or history via any endpoint. **Status: CRITICAL GAP — no such tests exist in the current codebase.**
 - **Sync reconciliation needs a test for every state transition**: new→synced, synced→updated (metadata changed), synced→stale (removed from code), stale→synced (restored). Each of these is a real behavior with real consequences; test each one explicitly rather than only testing the "happy path" of a first-time sync. **Status: Unit tests exist but need expansion to cover all transitions.**
 - **The reporter needs at least one true end-to-end test**: a real Playwright test file under `packages/playground`, run with the actual `AssertiveReporter` configured, asserting the API received the correct payload and the DB ended up in the correct state (this is Epic 4's task 4.9 from the original plan — keep it, it's the right instinct). **Status: `packages/playground` exists; end-to-end validation required.**
 - **Batch transactionality needs an explicit failure-injection test**: simulate a failure partway through a batch (e.g. a constraint violation on the 30th of 50 results) and assert zero of the 50 `test_runs` rows were committed and `run_batches` counters remain at their pre-batch values. **Status: CRITICAL GAP — no such test exists. Note: current batch upload is wrapped in `prisma.$transaction`, but `testRunService.create` performs non-transactional side-effects (counter increments, history, flakiness) that must also be validated.**
 - **Flakiness scoring needs a fixture-based test**: seed a known run-history sequence (e.g. pass, fail, pass, fail, pass) and assert the exact expected `flaky_score`, not just "is_flaky is true/false" — the formula is simple enough that an off-by-one in transition counting should be caught by an exact-value assertion. **Status: CRITICAL GAP — no fixture-based test exists; only mocked unit tests.**
 - **Every write to `test_cases` that changes metadata must produce a `test_case_history` row in the same transaction.** If you add a new mutable field to `test_cases`, you must also add it to the diff-generation logic — an un-audited field is a silent gap in the audit trail, which defeats the point of having one. **Status: Implemented for most paths; audit all new mutable fields.**

## 5. What "done" looks like for each must-have feature

Same standard as your other projects: don't mark a feature complete until you can say, in one sentence, "here's the test that proves this works." For the tenant-isolation and batch-transactionality features specifically, add the second sentence too: "and here's the test that proves it can't be bypassed by a partial failure or a forgotten scope check."
