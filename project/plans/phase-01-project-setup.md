# Phase 1 - Project Setup

## Goal

Set up the local-first foundation for DataPrep Studio: local workspace, SQLite metadata database, and the first migration running during Electron app startup.

## Tasks

- Install `better-sqlite3` and type definitions.
- Create `WorkspaceService` to resolve and create:
  - app data root
  - `metadata.db`
  - `workspace/datasets`
  - `workspace/tmp`
  - `workspace/exports`
  - `logs`
- Create a SQLite connection helper:
  - enable foreign keys
  - enable WAL journal mode
- Create a migration runner:
  - create `schema_migrations` if missing
  - read and run unapplied migrations
  - record applied migrations
- Create migration `001_init.sql` with:
  - `schema_migrations`
  - `datasets`
  - `dataset_versions`
  - `dataset_profiles`
  - `cleaning_steps`
  - `audit_logs`
- Connect initialization to the Electron main process.
- Replace the Vite template UI with a minimal app/workspace status screen.
- Move preload toward `window.api`; do not expose raw `ipcRenderer`.

## Acceptance Criteria

- `npm run build` pass.
- When the app starts, the workspace folder and `metadata.db` are created.
- The first migration runs successfully.
- The renderer can display startup status through `window.api.getAppStatus()`.
- The `project/` folder contains the initial project memory.
