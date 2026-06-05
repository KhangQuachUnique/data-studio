# Phase 1 - Project Setup

## Goal

Set up the local-first foundation for DataPrep Studio: app storage, multi-workspace project folders, SQLite metadata database, and the first migration running during Electron app startup.

## Tasks

- Install `better-sqlite3` and type definitions.
- Create app bootstrap and workspace services to resolve and create:
  - app data root
  - SQLite metadata database
  - `workspaces`
  - app-level `logs`
  - per-workspace folders for raw data, DuckDB, queries, and exports
- Create a SQLite connection helper:
  - enable foreign keys
  - enable WAL journal mode
- Create a migration runner:
  - create `schema_migrations` if missing
  - read and run unapplied migrations
  - record applied migrations
- Create migration `001_init.sql` with:
  - `schema_migrations`
  - `workspaces`
  - `data_sources`
  - `saved_queries`
  - `query_history`
  - `app_settings`
- Connect initialization to the Electron main process.
- Register the first IPC handlers: `workspace:list` and `workspace:create`.
- Replace the Vite template UI with a minimal workspace list/create screen.
- Move preload to `window.api`; do not expose raw `ipcRenderer`.

## Acceptance Criteria

- `npm run build` pass.
- When the app starts, app storage, SQLite database, `workspaces`, and `logs` are created.
- The first migration runs successfully.
- The renderer can list and create workspaces through `window.api`.
- Creating a workspace writes SQLite metadata and creates the workspace folder structure.
- The `project/` folder contains the initial project memory.
