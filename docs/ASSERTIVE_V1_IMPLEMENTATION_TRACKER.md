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