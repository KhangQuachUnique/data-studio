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
