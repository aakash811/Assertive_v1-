# Sprint 1 — Architecture Compliance

## Epic 1 — Canonical Identity ⭐⭐⭐⭐⭐

- [ ] Decide canonical external ID
- [ ] Update Sync
- [ ] Update CLI
- [ ] Update Reporter
- [ ] Remove generateExternalId()
- [ ] Remove discover endpoint

Definition of Done

- Reporter never creates inventory
- Sync is the only inventory owner
- Every TestCase has one canonical external ID

---

## Epic 2 — Inventory Ownership ⭐⭐⭐⭐⭐

- [ ] Sync owns TestCase lifecycle
- [ ] Reporter uploads execution only
- [ ] Inventory APIs cleaned up

Definition of Done

Reporter cannot mutate inventory.

---

## Epic 3 — Tenant Security ⭐⭐⭐⭐☆

- [ ] Remove organizationId from client payloads
- [ ] Fix API key scoping
- [ ] Repository tenant audit

Definition of Done

Every repository query is tenant-safe.

---

## Epic 4 — History Model ⭐⭐⭐⭐☆

- [ ] HistoryAction enum
- [ ] Typed history events
- [ ] Centralized history service

Definition of Done

Every history event is type-safe.


# Sprint 2 — Inventory & Execution

## Epic 5 — Test Lifecycle ⭐⭐⭐⭐⭐

- [ ] Introduce Active / Archived lifecycle
- [ ] Archive instead of deleting TestCases
- [ ] Restore archived tests
- [ ] Add lifecycle validation
- [ ] Add archived filters

### Definition of Done

- TestCases are never hard deleted.
- Lifecycle matches the product model.
- Historical context is preserved.

---

## Epic 6 — Execution Engine ⭐⭐⭐⭐⭐

- [ ] Transactional RunBatch uploads
- [ ] Bulk insert TestRuns
- [ ] Bulk history creation
- [ ] Batch counter optimization
- [ ] Idempotent execution uploads
- [ ] Retry protection

### Definition of Done

- Execution uploads are atomic.
- Duplicate uploads are safely handled.
- Reporter is production-ready.

---

## Epic 7 — Repository Architecture ⭐⭐⭐⭐☆

- [ ] Remove remaining direct Prisma access from services
- [ ] Introduce missing repository methods
- [ ] Standardize repository patterns
- [ ] Move persistence behind repositories

### Definition of Done

- Services contain business logic only.
- Repositories are the only persistence layer.

---

# Sprint 3 — Sync & Reporter Hardening

## Epic 8 — Sync Engine ⭐⭐⭐⭐⭐

- [ ] Wrap Sync in database transaction
- [ ] Preload suites
- [ ] Preload tags
- [ ] Replace delete-and-recreate tags
- [ ] Continue syncing after parser failures
- [ ] Improve parser errors
- [ ] Remove stale cache entries
- [ ] API duplicate validation
- [ ] Add concurrent sync tests
- [ ] Add idempotency tests

### Definition of Done

- Sync is transactional.
- Large repositories sync efficiently.
- Sync is resilient to failures.

---

## Epic 9 — Reporter Hardening ⭐⭐⭐⭐☆

- [ ] Validate offline queue contents
- [ ] Queue locking
- [ ] Respect uploadTraces configuration
- [ ] Improve upload logging
- [ ] Remove N+1 queries
- [ ] Bulk database operations
- [ ] Queue retry improvements

### Definition of Done

- Reporter is resilient.
- Upload pipeline scales efficiently.

---

# Sprint 4 — Insights & Platform

## Epic 10 — Insights ⭐⭐⭐⭐☆

- [ ] Merge Metrics / Analytics / Status architecture
- [ ] Shared aggregation layer
- [ ] Time-window filtering
- [ ] Dashboard optimization
- [ ] Cached metrics
- [ ] Trend APIs

### Definition of Done

- Insights are consistent.
- Dashboard queries scale well.

---

## Epic 11 — Trace Management ⭐⭐⭐⭐☆

- [ ] Storage abstraction
- [ ] Signed trace URLs
- [ ] Trace expiration
- [ ] Cloud storage providers
- [ ] Trace cleanup policies

### Definition of Done

- Trace storage is provider-independent.
- Secure trace access is enforced.

---

## Epic 12 — Cleanup Policies ⭐⭐⭐☆☆

- [ ] Replace CleanupService with policy engine
- [ ] Configurable retention
- [ ] Automated cleanup jobs
- [ ] Expiration rules

### Definition of Done

- Cleanup is policy-driven.
- Retention is configurable.

---

# Sprint 5 — Production Readiness

## Epic 13 — Infrastructure ⭐⭐⭐⭐☆

- [ ] Request IDs
- [ ] Structured logging
- [ ] Health endpoint improvements
- [ ] Environment configuration cleanup
- [ ] Pagination improvements
- [ ] API consistency audit

### Definition of Done

- Infrastructure is production-ready.
- Diagnostics are standardized.

---

## Epic 14 — Security Hardening ⭐⭐⭐⭐⭐

- [ ] API key scopes
- [ ] Role-based authorization
- [ ] API key metadata
- [ ] Project ownership validation
- [ ] Audit logging

### Definition of Done

- Authorization is role-aware.
- Security follows least-privilege principles.

---

## Epic 15 — Testing & Quality ⭐⭐⭐⭐☆

- [ ] Repository integration tests
- [ ] Transaction tests
- [ ] Concurrency tests
- [ ] End-to-end Sync tests
- [ ] Reporter integration tests
- [ ] Performance benchmarks

### Definition of Done

- Critical workflows are covered by integration tests.
- Performance regressions are detectable.