# Assertive v1 Production Blueprint

> **Version:** 1.0 (Draft)
>
> **Status:** Target Architecture
>
> **Audience:** Core Maintainers, Contributors, Open Source Contributors
>
> **Last Updated:** July 2026

---

# Table of Contents

1. Executive Summary
2. Vision
3. Product Philosophy
4. Core Principles
5. Product Goals
6. Product Non-Goals
7. Domain Model
8. System Architecture
9. Ownership Rules
10. Test Lifecycle
11. Execution Lifecycle
12. Canonical Identity Model
13. Multi-tenancy
14. Database Standards
15. API Standards
16. Backend Architecture
17. Frontend Architecture
18. CLI Architecture
19. Reporter Architecture
20. Sync Engine
21. Execution Engine
22. Trace Management
23. History & Event Model
24. Analytics Philosophy
25. Security Standards
26. Performance Standards
27. Coding Standards
28. Contributor Guidelines
29. Release Philosophy
30. Roadmap

---

# 1. Executive Summary

Assertive is a developer-first test management platform designed around one simple idea:

> **Source code is the source of truth for test inventory.**

Unlike traditional Test Management Systems that require developers to maintain test cases manually inside a web application, Assertive automatically synchronizes test metadata directly from the codebase.

Developers continue writing tests exactly as they do today using Playwright (and eventually other frameworks). Assertive continuously synchronizes those tests into a structured inventory while collecting execution history from CI, local runs, and manual executions.

This creates a single platform capable of answering questions like:

- Which tests exist?
- Which tests are failing?
- Which tests are flaky?
- What changed recently?
- Who owns this test?
- What happened during the last deployment?

without forcing developers to leave their normal development workflow.

Assertive is designed to remain invisible during development while providing complete visibility during execution.

---

# 2. Vision

## Mission

Build the most developer-friendly test management platform for modern engineering teams.

The platform should require minimal maintenance, integrate naturally into existing workflows, and treat code—not spreadsheets or manual dashboards—as the source of truth.

---

## Vision Statement

> Every automated test should have a permanent identity, complete execution history, clear ownership, and rich metadata without requiring developers to manage any of it manually.

---

## Long-Term Vision

Assertive should become the engineering team's central source of truth for test inventory, execution history, quality metrics, and reliability insights.

It should integrate seamlessly into CI/CD systems, development workflows, and issue tracking systems while remaining framework-agnostic.

---

# 3. Product Philosophy

Every architectural decision in Assertive follows a small number of product philosophies.

These philosophies are intentionally more important than individual implementation details.

Whenever a new feature is proposed, contributors should first verify that it aligns with these philosophies.

---

## Philosophy 1

### Source Code Owns Inventory

The inventory of tests is never manually maintained.

Inventory comes exclusively from source code.

If a test exists in code, it exists in Assertive.

If it is removed from code, Assertive records that change.

This prevents inventory drift.

---

## Philosophy 2

### Execution Creates History

Running tests should never modify inventory.

Execution creates immutable historical records.

Inventory and execution are different concepts.

---

## Philosophy 3

### Preserve Everything

History should never be lost.

Instead of deleting information, Assertive archives it.

Historical execution data is valuable for debugging, auditing, and engineering metrics.

---

## Philosophy 4

### Developers Come First

Every feature should reduce developer effort.

Developers should never maintain duplicate information.

Metadata should live as close to the source code as possible.

---

## Philosophy 5

### Open Architecture

Every subsystem should be independently replaceable.

Storage.

Authentication.

Trace storage.

Execution providers.

Framework integrations.

Nothing should be tightly coupled.

---

# 4. Core Principles

These principles define how every subsystem behaves.

---

## Principle 1

### Source Code Owns Test Inventory

Only the Sync Engine may create or modify TestCases.

Reporter cannot create tests.

Dashboard cannot create tests.

Manual Override cannot create tests.

Inventory belongs exclusively to Sync.

---

## Principle 2

### Execution Never Owns Inventory

Execution produces:

- RunBatch
- TestRun
- History
- Traces

Execution never creates inventory.

---

## Principle 3

### Every Meaningful Action Produces History

Every important change becomes a historical event.

Examples include:

- Test created
- Test restored
- Metadata updated
- Test archived
- Manual override
- Run completed
- Status changed
- Sync completed

Nothing important happens silently.

---

## Principle 4

### Inventory Is Archived, Not Deleted

Deleting inventory destroys historical context.

Instead:

- Active
- Stale
- Archived

are preferred lifecycle states.

---

## Principle 5

### One RunBatch Represents One Execution Session

A RunBatch is not tied to CI.

A RunBatch represents any execution session including:

- GitHub Actions
- GitLab CI
- Jenkins
- Azure Pipelines
- Local execution
- Scheduled execution
- Manual execution

The execution source is metadata—not a different model.

---

# 5. Product Goals

Assertive aims to solve the following engineering problems.

## Primary Goals

- Automatic inventory synchronization
- Rich execution history
- Flaky test detection
- Ownership tracking
- Trace management
- Test discoverability
- CI integration
- Reliable analytics

---

## Secondary Goals

- Notifications
- Team insights
- Historical trends
- AI-assisted diagnostics
- Audit logging
- Integrations

---

# 6. Product Non-Goals

Assertive is intentionally **not** designed to be:

- A CI platform
- A Playwright replacement
- A test runner
- A build system
- A project management platform
- A bug tracker
- A Grafana replacement

Instead, Assertive complements these systems.

---

# 7. Domain Model

The domain model defines the core business entities of Assertive and the relationships between them.

Unlike the database schema, the domain model describes **business concepts**, not implementation details.

---

# High-Level Domain

```text
                    Organization
                          │
                ┌─────────┴──────────┐
                │                    │
            Project              API Keys
                │
                ▼
         Test Inventory
                │
          ┌─────┴─────┐
          │           │
      TestSuite      Tag
          │
          ▼
      TestCase
          │
   ┌──────┴────────┐
   │               │
History        Executions
                    │
             ┌──────┴──────┐
             │             │
         RunBatch       TestRun
                            │
                          Trace
```

---

## Organization

Represents a company or engineering team.

Responsibilities:

- Own Projects
- Own API Keys
- Own Members
- Provide tenant isolation

Organizations never own tests directly.

Projects do.

---

## Project

A Project represents one logical software system.

Examples

- Frontend
- Backend
- Mobile App
- Payments Service

Projects own:

- Test Inventory
- Executions
- Analytics
- Traces

Projects are the primary unit of work inside Assertive.

---

## Test Inventory

Inventory represents every known automated test.

Inventory is **not execution**.

Inventory answers:

- What tests exist?
- Where are they?
- Who owns them?
- What metadata do they have?

Inventory changes only through synchronization.

---

## TestCase

TestCase represents one logical automated test.

It contains:

- identity
- title
- ownership
- metadata
- lifecycle state

It does NOT contain execution history.

Execution history belongs elsewhere.

---

## TestSuite

Logical grouping of TestCases.

Suites exist for organization only.

They should never affect execution.

---

## Tags

Tags provide flexible categorization.

Examples

- smoke
- regression
- checkout
- api
- payments

Tags should remain lightweight.

Business workflows should not depend on tags.

---

## Execution Domain

Execution is completely separate from inventory.

Execution answers:

- What happened?
- When?
- How long?
- Why did it fail?

Execution never owns inventory.

---

## RunBatch

Represents one execution session.

Examples:

- GitHub Actions workflow
- Local execution
- Nightly pipeline
- Manual execution
- Jenkins build

Every TestRun belongs to exactly one RunBatch.

---

## TestRun

Represents one execution of one TestCase.

Contains:

- status
- duration
- retry
- browser
- operating system
- trace
- errors

TestRun is immutable.

Once created it should never change.

---

## Trace

Trace belongs to TestRun.

A Trace is optional.

Storage implementation should be abstract.

Possible providers:

- Local filesystem
- Amazon S3
- Cloudflare R2
- Azure Blob Storage

Changing providers must not require API changes.

---

## History

History records important business events.

History is not execution.

Examples:

- Created
- Updated
- Restored
- Archived
- Override
- Metadata changed

History exists to explain **why** inventory changed.

---

# 8. System Architecture

Assertive follows a layered architecture.

```text
          Frontend
              │
              ▼
          HTTP Routes
              │
              ▼
          Services
              │
              ▼
        Repositories
              │
              ▼
            Prisma
              │
              ▼
          PostgreSQL
```

---

## Routes

Routes are responsible for:

- parsing HTTP
- validation
- authentication
- returning responses

Routes never contain business logic.

---

## Services

Services contain business rules.

Examples:

- Sync
- Reporter uploads
- Manual overrides
- Analytics

Services coordinate repositories.

---

## Repositories

Repositories perform persistence only.

Repositories never:

- validate requests
- compute business rules
- send notifications

Repositories should be thin.

---

## Database

Database stores state.

Database should not contain business rules.

Business logic belongs in Services.

---

# 9. Ownership Rules

Ownership rules define which subsystem owns which data.

This prevents inconsistent behavior across the platform.

---

## Test Inventory

Owner

```text
Sync Engine
```

Allowed Operations

- Create
- Update metadata
- Restore
- Mark stale
- Archive

Forbidden

- Reporter
- Dashboard
- Manual Override

---

## Execution

Owner

```text
Reporter
```

Allowed

- Create RunBatch
- Create TestRun
- Upload traces

Forbidden

- Create TestCases
- Modify inventory

---

## Manual Override

Owner

```text
User
```

Allowed

- Create manual execution
- Override status
- Record history

Forbidden

- Delete executions
- Remove history

---

## Dashboard

Owner

Read-only.

Dashboard never mutates business data.

---

## CLI

Owner

Inventory synchronization.

CLI responsibilities:

- Discover tests
- Parse metadata
- Upload inventory

Nothing else.

---

## Reporter

Owner

Execution uploads.

Reporter responsibilities:

- Upload RunBatch
- Upload TestRuns
- Upload traces

Reporter never discovers inventory.

---

# 10. Test Lifecycle

Execution and inventory are separate.

Inventory has its own lifecycle.

```text
          Created
              │
              ▼
          Synced
              │
              ▼
           Active
          ╱      ╲
         ╱        ╲
    Stale      Archived
```

---

## Created

First synchronization.

Inventory enters the system.

---

## Synced

Metadata matches source code.

---

## Active

Test exists in latest synchronization.

Runnable.

Visible by default.

---

## Stale

Test no longer exists in source code.

History is preserved.

Can be restored automatically.

---

## Archived

Hidden from active inventory.

Used for long-term preservation.

Never automatically restored.

Requires explicit user action.

---

## Deleted

Deleted should almost never exist.

Assertive prefers archival over deletion.

---

# 11. Execution Lifecycle

Execution follows a different lifecycle.

```text
RunBatch Created
        │
        ▼
Reporter Upload
        │
        ▼
TestRuns Created
        │
        ▼
Trace Uploaded
        │
        ▼
Analytics Updated
        │
        ▼
History Recorded
```

Execution never affects inventory ownership.

---

# 12. Canonical Identity Model

Every TestCase has two identities.

---

## Internal Identity

```text
UUID
```

Generated by the database.

Never exposed to developers.

Never changes.

---

## External Identity

Preferred

Developer-defined identifier.

Example

AUTH-LOGIN-001

CHECKOUT-007

PAYMENTS-STRIPE-002

---

Fallback

If no explicit identifier exists

```text
relative/file/path.spec.ts::test title
```

This identifier is deterministic.

It can always be regenerated from source.

---

Sequential IDs

```text
TST-001
```

are intentionally not supported.

Sequential identifiers:

- race under concurrency
- break after deletion
- have no semantic meaning
- encourage database coupling

---

# Identity Rules

- UUID identifies database records.
- External ID identifies business objects.
- External IDs should remain human-readable.
- Inventory synchronization owns External IDs.
- Execution references External IDs but never creates them.

---

# 13. Multi-Tenancy

Tenant hierarchy

```text
Organization
      │
      ▼
 Project
      │
      ▼
Inventory
      │
      ▼
Execution
```

---

## Organization

Tenant boundary.

Everything belongs to an Organization.

---

## Project

Isolation boundary.

Every API request operates within one Project.

---

## API Keys

API Keys grant access.

API Keys do not own resources.

Ownership always belongs to Organizations.

---

## Tenant Rules

Clients may never provide:

- organizationId
- ownership information
- tenant identifiers

Tenant context always comes from authentication.

---

## Cross-Tenant Access

Cross-organization access is forbidden.

Every repository query must be scoped by:

- organization
- project

No exceptions.