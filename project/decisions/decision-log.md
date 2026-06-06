# Decision Log

## 2026-06-05 - Local-first desktop app

DataPrep Studio will be built as a local-first desktop app with Electron + React + TypeScript.

Reasons:
- Fits local dataset workflows.
- Avoids cloud/backend dependency in the MVP.
- Keeps the scope small and easy to demo.

## 2026-06-05 - SQLite for metadata

Dataset, version, profile, cleaning step, and audit log metadata will be stored in SQLite.

Reasons:
- Lightweight, local, and easy to package with a desktop app.
- Enough for a single-user MVP.
- Can be migrated to PostgreSQL later if server mode is needed.

## 2026-06-05 - Immutable dataset versions

Every cleaning operation must create a new version. Old versions must not be modified or overwritten.

Reasons:
- Keeps audit/history clear.
- Allows restoring an old version by changing `current_version_id`.
- Reduces the risk of data loss when a cleaning operation fails.

## 2026-06-05 - No HTTP backend in the MVP

The renderer communicates with the Electron main process through preload APIs and IPC, without FastAPI or an HTTP server.

Reasons:
- The app is currently a local desktop app.
- Reduces operational complexity.
- Avoids adding a Python worker/backend before it is needed.

## 2026-06-05 - Feature-based frontend structure

The React renderer uses a feature-based structure with `app`, `pages`, `features`, and `shared`.

Reasons:
- Keeps page-level composition separate from workspace business UI.
- Keeps `window.api` calls inside feature API wrappers instead of React components.
- Leaves room for future features such as data sources, profiling, cleaning, and export.

## 2026-06-06 - CSV-only data source MVP

Phase 2 will support CSV import only. Other file/source types such as Excel, JSON, Parquet, SQLite, and external databases are out of scope until the CSV flow is stable.

Reasons:
- Keeps the first import/profile/version workflow small enough to finish.
- Avoids designing parser-specific edge cases too early.
- Leaves room to add more source types later through explicit migrations and services.

## 2026-06-06 - Configurable dataset versioning direction

Dataset versioning should become a workspace-level setting later. The default should be versioning enabled. If disabled, transformation steps should overwrite the current working DuckDB table/version instead of creating `v2`, `v3`, etc. The original raw file copied into `workspace/data/raw` should still be preserved.

Reasons:
- Gives users control over storage usage.
- Keeps the raw import recoverable even when working data is overwritten.
- Allows audit-friendly projects and quick scratch projects to use the same schema.

## 2026-06-06 - Studio-style workspace shell

The opened workspace view should behave like a studio/workbench for observing and interacting with data, not a debug dashboard. Primary duplicated actions should be removed, workspace actions should live in the topbar, and imported datasets should be shown in a compact table with expandable details.

Reasons:
- Keeps the workspace screen easier to scan.
- Makes imported datasets the main object of attention.
- Avoids repeating the same controls in multiple panels.
