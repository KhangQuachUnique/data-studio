# Phase 2 - CSV Data Source Import

## Goal

Build the first dataset workflow inside an opened workspace: import a CSV file, copy it into workspace raw storage, save metadata in SQLite, create dataset version `v1`, and show the imported datasets in a clean studio-style workspace UI.

## Current Scope

- CSV only.
- Local Electron IPC only through `window.api`.
- SQLite stores metadata and version/profile summary fields.
- Workspace folder stores copied raw files.
- DuckDB table creation is planned next but not implemented yet.

## Completed

- Added migration `002_dataset_versions_and_profiles.sql`.
- Added shared `DataSource`, `DatasetVersion`, profile report, and import result types.
- Added SQLite repositories for `data_sources` and `dataset_versions`.
- Added `DataSourceService.importCsv()`:
  - validates CSV path
  - copies the file into `workspace/data/raw`
  - counts rows and columns at a basic CSV level
  - creates `data_sources`
  - creates `dataset_versions` version `1`
  - updates `current_version_id`
- Added IPC/preload APIs:
  - `dialog:select-csv-file`
  - `dataSource:list`
  - `dataSource:importCsv`
- Added renderer data-source feature:
  - `dataSourceApi`
  - `useDataSources`
  - `DataSourcePanel`
- Updated workspace shell UI into a cleaner studio layout:
  - topbar owns workspace actions
  - workspace health is compact
  - data sources show as a table with expandable metadata
- Added workspace unarchive flow:
  - `workspace:unarchive`
  - `window.api.unarchiveWorkspace`
  - renderer buttons for archived workspaces

## Next

- Manually verify CSV import in the running Electron app.
- Add DuckDB integration so imported CSV files become queryable tables.
- Persist actual dataset profile reports in `dataset_profile_reports` and `column_profile_reports`.
- Add dataset preview/table view after DuckDB exists.

## Known Notes

- `npm run lint` passes.
- `npm run build` passes TypeScript and Vite renderer/main/preload builds.
- `electron-builder` can fail on Windows when `better_sqlite3.node` is locked by a running Electron/dev process, or when Windows lacks symlink privileges for `winCodeSign`.
