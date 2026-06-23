# Assertive Backlog

This file lists the missing, incomplete, or mismatched items between the current codebase and the project documentation.

Status legend: `Done` means the task is implemented in the current workspace, `Partial` means there is a working stub or only part of the contract is implemented, and `Not started` means the feature is still missing.

## High Priority

| Priority | Area                | Status      | Task                                                                                               | Notes                                                                                              |
| -------- | ------------------- | ----------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| High     | Config / onboarding | Not started | Implement `assertive.config.ts` loading with Zod validation and env overrides                      | Current CLI only reads `.assertive.json`; docs require config-driven setup and fallback behavior.  |
| High     | Config / onboarding | Not started | Add interactive `init` flow for project name, ID prefix, database, and storage                     | Current init is non-interactive and writes a different config format.                              |
| High     | CLI                 | Partial     | Add `create` command to scaffold a new test from a prompt                                          | A `create` command exists, but it still works from a direct title argument rather than a prompt.   |
| High     | CLI                 | Partial     | Add `ui` command to start API and web together                                                     | A `ui` command exists, but it currently prints launch instructions instead of starting both apps.  |
| High     | CLI                 | Done        | Add `view` command to open a test case in the browser                                              | The command exists and opens the test case route in the browser.                                   |
| High     | CLI                 | Partial     | Add `upload` command scaffold for JUnit XML import                                                 | A stub command exists, but it is not wired to actual JUnit upload behavior.                        |
| High     | CLI / packaging     | Not started | Add documented sub-path exports and package resolution for helper, config, and reporter            | Current package layout does not match the documented publish shape.                                |
| High     | Sync API            | Partial     | Change sync endpoint to `POST /api/projects/:id/sync`                                              | The route exists in code, but it is still mounted through the old API prefix.                      |
| High     | Sync API            | Done        | Reconcile test cases with create/update/stale history entries                                      | Sync now creates, updates, restores, and marks stale test cases with history entries.              |
| High     | Reporter            | Not started | Implement reporter retries with exponential backoff                                                | The reporter still falls back to an offline queue instead of retrying failed uploads.              |
| High     | Reporter            | Partial     | Add pending-results persistence for failed uploads                                                 | An offline queue exists, but it is not the documented pending-results flow.                        |
| High     | Reporter            | Partial     | Implement trace upload flow with pre-signed URL support                                            | Trace upload is wired end-to-end, but it uses a local upload route rather than pre-signed storage. |
| High     | Reporter / API      | Partial     | Align batch payload shape with documented run result fields                                        | The current payload includes the core fields, but it is still narrower than the documented shape.  |
| High     | Manual override     | Partial     | Fix override endpoint and payload contract end-to-end                                              | The API and client both have override paths, but their route/payload contracts still differ.       |
| High     | Auth / settings     | Done        | Remove hardcoded API URL and API key from the web client                                           | The web client now routes through the local proxy and environment-driven config.                   |
| High     | Auth / settings     | Not started | Implement real API key management flow with project-scoped keys                                    | Current API key flow is still simplistic compared with the documentation.                          |
| High     | Data model          | Partial     | Add or align database fields for unique id generation, manual override metadata, and trace linkage | Key fields exist, but the schema still does not fully match the documented model.                  |

## Medium Priority

| Priority | Area             | Status      | Task                                                                                                | Notes                                                                                     |
| -------- | ---------------- | ----------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Medium   | Test case list   | Not started | Add server-side filtering for status, tags, type, owner, flaky, suite, sync state, and search       | Current list endpoint only supports pagination.                                           |
| Medium   | Test case detail | Not started | Expand detail view to show description, file path, custom fields, steps, and richer metadata        | Current UI only renders a subset of the documented fields.                                |
| Medium   | History / audit  | Partial     | Add full JSON diff generation for changes and overrides                                             | Sync history generates metadata diffs, but override diffs are still incomplete.           |
| Medium   | History / audit  | Not started | Show `changed_by` and normalized audit metadata in API responses                                    | Current history records do not fully match the doc schema.                                |
| Medium   | Tags             | Not started | Add attach/detach endpoints for tags on test cases                                                  | Current API supports tag creation/listing but not the full documented relation workflow.  |
| Medium   | Test suites      | Partial     | Support nested suite trees, update, and delete operations                                           | Nested suites exist in sync, but update and delete flows are still missing.               |
| Medium   | Flakiness        | Partial     | Rework flakiness calculation to match the documented percentage-based rule                          | Flakiness is recalculated, but the formula and threshold still differ from the docs.      |
| Medium   | Metrics          | Partial     | Add stale count, trend data, and type/priority breakdowns to metrics                                | Summary metrics exist, but the documented breakdowns are still missing.                   |
| Medium   | Analytics        | Partial     | Expand analytics to include trend and breakdown visualizations required by the docs                 | Core analytics endpoints exist, but trend and breakdown views are still absent.           |
| Medium   | Sync             | Partial     | Improve incremental sync behavior and cache handling for large codebases                            | The CLI has cache handling, but the documented incremental sync flow is still incomplete. |
| Medium   | Config           | Not started | Support fallback config resolution from env vars, config file, and defaults in the documented order | Current CLI config loading is JSON-only and narrower than required.                       |
| Medium   | Dashboard        | Partial     | Add the documented trace viewer experience for failed runs                                          | Trace URLs exist, but there is no full trace viewer experience yet.                       |
| Medium   | Dashboard        | Partial     | Add responsive layout, empty states, and dark mode support                                          | The UI works, but it does not yet include the documented polish.                          |
| Medium   | Deployment       | Partial     | Expand docker-compose to include full API, web, database, and optional storage services             | Postgres is running, but the API/web services are still not part of the compose file.     |
| Medium   | Deployment       | Partial     | Add health checks, graceful shutdown, and structured logging                                        | Health checks and shutdown are present, but logging remains incomplete.                   |
| Medium   | Retention        | Partial     | Add retention settings for runs, history, and traces plus cleanup logic                             | Cleanup exists, but not in the documented policy-driven form.                             |

## Low Priority

| Priority | Area          | Status      | Task                                                                                     | Notes                                                                       |
| -------- | ------------- | ----------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Low      | Release       | Not started | Add GitHub Actions release workflow for CLI publishing                                   | Needed for public release, but not blocking core functionality.             |
| Low      | Documentation | Partial     | Expand README with getting started, CLI reference, API reference, and self-hosting guide | Current README has flow diagrams and overview text, but not the full guide. |
| Low      | Documentation | Partial     | Add architecture overview and sequence diagrams for the main workflows                   | Some diagrams are present, but the set is still incomplete.                 |
| Low      | Tests         | Partial     | Add unit tests for config loading, parsing, API handlers, and repositories               | Coverage exists in places, but the full suite is still missing.             |
| Low      | Tests         | Partial     | Add end-to-end flow coverage for init → create → run → sync → dashboard                  | There are Playwright tests, but not the full documented flow.               |
| Low      | Packaging     | Not started | Add release notes and changelog automation                                               | Good release hygiene, but not a functional blocker.                         |
| Low      | UX polish     | Not started | Add bulk archive for stale tests and other dashboard conveniences                        | Nice-to-have compared with the core data flow.                              |

## Immediate Blockers

- The hardcoded web API key blocker has been addressed in the current workspace, but the broader auth/settings flow is still incomplete.
- The documented sync route is partially wired, but the API mount point still needs to be cleaned up to match the documented path exactly.
- The reporter now uploads traces, but it still needs the documented pre-signed flow and retry behavior.
- The CLI command set is much closer now, but the config and onboarding flow are still not aligned with the docs.

---

# Assertive Roadmap (Post MVP)

> Source of truth:
>
> - Current codebase architecture
> - Documentation = feature intent only
> - Existing implementation should not be rewritten solely to match docs

---

# Phase 1: Production Foundation (Highest Priority)

Goal: Make Assertive reliable enough to be used daily by developers.

## Config & Onboarding

- [ ] Implement `assertive.config.ts`
- [ ] Add Zod schema validation
- [ ] Add environment variable overrides
- [ ] Add config fallback resolution

Resolution order:

```text
Environment Variables
↓
assertive.config.ts
↓
Defaults
```

---

## Interactive Init Flow

Implement `npx assertive init`

Questions:

- [ ] Project name
- [ ] Project ID
- [ ] Test ID prefix
- [ ] Database selection
- [ ] Storage selection
- [ ] API URL
- [ ] API key

---

## Reporter Reliability

Implement:

- [ ] Exponential backoff
- [ ] Retry mechanism
- [ ] Pending results queue
- [ ] Recovery flow

Priority:

```text
Failed upload
↓
Retry
↓
Retry
↓
Store locally
↓
Resync later
```

---

## Authentication

Implement project-scoped API keys.

Features:

- [ ] API key generation
- [ ] API key rotation
- [ ] API key revocation
- [ ] API key permissions
- [ ] API key management UI

---

# Phase 2: Dashboard Completion

Goal: Turn the dashboard into a complete test management UI.

## Server-side Filtering

Implement filters:

- [ ] Status
- [ ] Tags
- [ ] Type
- [ ] Owner
- [ ] Flaky
- [ ] Suite
- [ ] Sync state
- [ ] Search

---

## Test Case Detail View

Add:

- [ ] Description
- [ ] File path
- [ ] Custom fields
- [ ] Test steps
- [ ] Rich metadata
- [ ] Trace section
- [ ] History section

---

## History & Audit

Implement:

- [ ] Full JSON diff generation
- [ ] Override diffs
- [ ] `changed_by`
- [ ] Audit metadata normalization

---

## Tag Management

Implement:

- [ ] Attach tags endpoint
- [ ] Detach tags endpoint

---

## Test Suite Management

Implement:

- [ ] Nested suite trees
- [ ] Update suite
- [ ] Delete suite

---

## UI Improvements

Implement:

- [ ] Empty states
- [ ] Loading states
- [ ] Better responsive layouts

---

# Phase 3: Analytics & Flakiness

Goal: Help teams identify quality trends.

## Flakiness Detection

Implement percentage-based calculation.

Track:

- [ ] Stability %
- [ ] Failure %
- [ ] Consecutive failures
- [ ] Flaky threshold detection

---

## Metrics Expansion

Add:

- [ ] Stale test count
- [ ] Trend data
- [ ] Type breakdown
- [ ] Priority breakdown

---

## Analytics Dashboard

Add visualizations:

- [ ] Pass rate trends
- [ ] Failure trends
- [ ] Stability charts
- [ ] Suite breakdown
- [ ] Owner breakdown
- [ ] Priority breakdown

---

# Phase 4: Trace Viewer Experience

Goal: Make debugging failures extremely easy.

## Playwright Trace Viewer

Embed full trace viewer.

Implement:

- [ ] Actions panel
- [ ] Timeline panel
- [ ] Snapshot panel
- [ ] Console panel
- [ ] Network panel

---

## Trace Storage

Improve trace upload flow.

Implement:

- [ ] Pre-signed URLs
- [ ] Storage abstraction
- [ ] Trace cleanup

---

## Trace UI Experience

Add:

- [ ] "View Trace" button
- [ ] Embedded trace modal
- [ ] Trace loading state
- [ ] Trace error state

---

# Phase 5: Developer Experience (DX)

Goal: Make Assertive feel native to developers.

## Create Command

Improve:

`npx assertive create`

Implement:

- [ ] Interactive prompt
- [ ] Boilerplate generation
- [ ] Auto TST-ID generation
- [ ] Auto linking

---

## UI Command

Improve:

`npx assertive ui`

Implement:

- [ ] Start API
- [ ] Start web
- [ ] Health checks
- [ ] Open browser automatically

---

## Upload Command

Implement:

`npx assertive upload`

Features:

- [ ] JUnit XML parsing
- [ ] Upload results
- [ ] Error handling

---

## Incremental Sync

Improve:

- [ ] Cache handling
- [ ] Partial sync
- [ ] Large repository support

---

## Packaging

Implement:

- [ ] Config exports
- [ ] Reporter exports
- [ ] Helper exports

---

# Phase 6: Production Polish

Goal: Prepare Assertive for public release.

## Docker

Expand docker-compose.

Add:

- [ ] API service
- [ ] Web service
- [ ] Database service
- [ ] Optional storage service

---

## Reliability

Implement:

- [ ] Health checks
- [ ] Graceful shutdown
- [ ] Structured logging

---

## Retention Policies

Implement:

- [ ] Run retention
- [ ] History retention
- [ ] Trace retention
- [ ] Cleanup scheduler

---

## Documentation

Expand:

- [ ] Getting Started guide
- [ ] CLI reference
- [ ] API reference
- [ ] Self-hosting guide

---

## Architecture Docs

Add:

- [ ] HLD diagrams
- [ ] Sequence diagrams
- [ ] Sync flow diagrams

---

## Testing

Add unit tests:

- [ ] Config loading
- [ ] Parsers
- [ ] API handlers
- [ ] Repositories

Add E2E tests:

- [ ] Init flow
- [ ] Create flow
- [ ] Run flow
- [ ] Sync flow
- [ ] Dashboard flow

---

## Release Pipeline

Implement:

- [ ] GitHub Actions release workflow
- [ ] Changelog generation
- [ ] Release notes automation

---

## Dashboard UX Enhancements

Add:

- [ ] Bulk archive stale tests
- [ ] Bulk actions
- [ ] Better empty states
- [ ] Better onboarding

---

# Guiding Principles

## Rule 1

Current codebase > Documentation

## Rule 2

Documentation = Feature intent

## Rule 3

Do not restructure folders unless necessary.

## Rule 4

Prefer this architecture:

Route
↓
Validator
↓
Service
↓
Repository
↓
Prisma

## Rule 5

Avoid over-engineering.

No unnecessary:

- CQRS
- Event buses
- Microservices
- Abstract factories

## Rule 6

Extend existing UI instead of creating duplicate pages/components.
