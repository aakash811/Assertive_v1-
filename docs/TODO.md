# Deferred

# EPIC 2.6 - Team members and Roles config

- One organization can have multiple members with roles.
- ROLES : 1. Org Admin, 2. Viewer, 3. Tester. etc... (not sure need to work on it).
- Invite members backend + frontend.
- Roles based Authorization (RBAC).

## EPIC 8.4 - PGlite default mode

Current architecture uses Prisma + PostgreSQL.

To support PGlite we need:

- Database adapter abstraction
- PGlite adapter implementation
- Repository factory
- Runtime engine detection
- Migration strategy

Deferred to v2.

# Assertive MVP

## Phase 1 - CLI

- [x] init
- [x] sync
- [x] status
- [x] history

## Phase 2 - Organizations

- [x] Organizations
- [x] Projects
- [ ] Teams/Members

## Phase 3 - Test Explorer

- [x] Search
- [x] Filters
- [x] Sorting
- [x] URL persistence
- [x] Pagination

## Phase 4 - Run Batch Explorer

- [ ] Runs page
- [ ] Run detail page
- [ ] Run results

## Phase 5 - Project Switcher

- [ ] Header dropdown

## Phase 6 - Authentication

- [ ] Login
- [ ] Protected routes

## Phase 7 - Collaboration

- [ ] Teams
- [ ] Roles
