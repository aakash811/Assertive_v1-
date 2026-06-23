# Assertive Architecture

## Monorepo

apps/

- api
- web

packages/

- cli
- database
- reporter
- shared

---

## Backend Flow

Route
↓
Validator
↓
Service
↓
Repository
↓
Prisma

---

## Frontend Flow

Page
↓
Component
↓
API Client

---

## CLI Flow

Command
↓
Discovery
↓
Parser
↓
API Client

---

## Source Of Truth

Playwright Tests
↓
Assertive CLI
↓
Sync Engine
↓
API
↓
Database
↓
Dashboard

---

## Principle

Documentation = Feature Intent

Codebase = Implementation Truth
