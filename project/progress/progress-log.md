# Progress Log

## 2026-06-05 - Initialize project memory and Phase 1

- Created the `project/` structure to manage context, plans, status, decisions, and progress.
- Saved the original DataPrep Studio idea in `project/context/master-idea.md`.
- Started Phase 1 - Project setup.
- Phase goal: local workspace, SQLite connection, migration runner, first migration, and minimal status UI.

## 2026-06-05 - Runtime bootstrap and workspace IPC

- Wired Electron startup toward app bootstrap, SQLite migration, workspace repository, and workspace service.
- Added the first safe renderer API shape through `window.api`.
- Scoped the first IPC workflow to `workspace:list` and `workspace:create`.
- Updated the Phase 1 plan to reflect the multi-workspace model.

## 2026-06-05 - Frontend structure refactor

- Refactored the renderer from flat Vite files into `app`, `pages`, `features`, and `shared`.
- Moved workspace list/create behavior into a Workspaces page and workspace feature module.
- Added a workspace API wrapper and hook so components do not call `window.api` directly.

## 2026-06-05 - Workspace management completion

- Added current workspace selection and persisted the last-opened workspace through `app_settings`.
- Added workspace detail integrity checks for folder and manifest existence.
- Added renderer actions for select, open folder, and archive workspace.

## 2026-06-06 - Phase 2 data model start

- Added migration `002_dataset_versions_and_profiles.sql`.
- Extended the data-source model with import/profile metadata.
- Added metadata tables for dataset versions, dataset profile reports, and column profile reports.

## 2026-06-06 - CSV data-source import flow

- Added shared data-source and dataset-version contracts.
- Added SQLite repositories for data sources and dataset versions.
- Added `DataSourceService` for CSV import into workspace raw storage with version `v1` metadata.
- Wired CSV file picker, import/list IPC, preload APIs, and renderer data-source UI.

## 2026-06-06 - Workspace studio cleanup

- Added workspace unarchive API and UI actions.
- Allowed archived workspaces to remain readable while blocking new CSV imports.
- Simplified the workspace shell into a cleaner studio-style layout.
- Removed duplicated quick actions and made the data-source table the main observation surface.

## 2026-06-06 - DuckDB-backed CSV import and preview

- Added `@duckdb/node-api` and a `DuckDbService` for workspace DuckDB table operations.
- Updated CSV import so copied raw files are materialized into `workspace.duckdb` tables.
- Switched import row/column counts from the basic line parser to DuckDB table queries.
- Added a bounded `dataSource:preview` IPC/preload flow.
- Added on-demand 100-row preview tables inside the data-source details UI.

## 2026-06-09 - Parquet-first schema rebuild

- Rebuilt `001_init.sql` around the final MVP schema from the report: sources, datasets, versions, version columns, profile reports, column profile reports, and operations.
- Removed the old Phase 2 migration because the MVP metadata model is now rebuilt cleanly from the start.
- Added legacy schema reset logic for early dev databases that still had the old `workspaces.path` and DuckDB-table metadata model.
- Updated shared types and SQLite repositories for the new source/dataset/version/operation split.

## 2026-06-09 - CSV import now produces Parquet versions

- Updated CSV import so a successful import creates `data/datasets/{datasetId}/versions/v1/data.parquet`.
- Added operation tracking for import start, success, failure, result stats, and error messages.
- Added dataset version column persistence from Parquet schema inspection.
- Updated preview to query `read_parquet(...)` directly instead of reading a persistent DuckDB table.
- Resolved the DuckDB `bad_weak_ptr` import failure by avoiding native logical type wrappers and using SQL `DESCRIBE` for schema inspection.

## 2026-06-09 - Build stabilization

- Disabled Windows executable signing/editing for unsigned MVP builds to avoid `winCodeSign` symlink extraction failures.
- Verified `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
