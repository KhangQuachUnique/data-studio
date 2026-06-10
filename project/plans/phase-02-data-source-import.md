# Phase 2 - Parquet-First CSV Data Source Import

## Goal

Build the first dataset workflow inside an opened workspace: import a CSV file, copy it into workspace raw storage, convert it into a canonical Parquet dataset version, save metadata in SQLite, and preview the current version through DuckDB without using persistent DuckDB tables.

## Current Scope

- CSV only.
- Local Electron IPC only through `window.api`.
- SQLite stores metadata, operation history, schema snapshots, and profile report summaries.
- Workspace folder stores copied raw files and immutable Parquet version artifacts.
- DuckDB is only a processing/query engine over files.

## Completed

- Rebuilt `001_init.sql` around the final MVP schema:
  `workspaces`, `data_sources`, `datasets`, `dataset_versions`, `dataset_version_columns`, `dataset_profile_reports`, `column_profile_reports`, and `operations`.
- Removed the old `002_dataset_versions_and_profiles.sql` migration because this phase intentionally rebuilds the schema from scratch.
- Added legacy schema reset logic in the SQLite migration runner for early dev databases that had already applied the old `001` migration.
- Updated shared data contracts for source, dataset, version, column metadata, profile report, operation, import result, and preview result.
- Added SQLite repositories for:
  `data_sources`, `datasets`, `dataset_versions`, `dataset_version_columns`, and `operations`.
- Updated `DataSourceService.importCsv()`:
  - validates the selected CSV path
  - copies the original CSV into `workspace/data/raw`
  - creates an `operations` row with status `running`
  - converts copied CSV into `workspace/data/datasets/{datasetId}/versions/v1/data.parquet`
  - creates `data_sources`, `datasets`, `dataset_versions`, and `dataset_version_columns`
  - points `datasets.current_version_id` at the Parquet version
  - marks the operation `success` or `failed`
- Updated `DuckDbService`:
  - uses in-memory DuckDB engine instances
  - converts CSV to Parquet with `COPY (SELECT * FROM read_csv(...)) TO ... (FORMAT PARQUET)`
  - previews current versions with `read_parquet(...)`
  - inspects schema with `DESCRIBE SELECT * FROM read_parquet(...)`
  - avoids native logical type wrappers that caused `bad_weak_ptr`
- Updated IPC/preload and renderer data-source UI for list, import, preview, and delete flows.
- Updated packaging config so Windows unsigned builds do not fail on `winCodeSign` symlink privileges.

## Next

- Add profile-generation service that reads a Parquet version and writes `dataset_profile_reports` plus `column_profile_reports`.
- Add transform/clean operation services that always create new Parquet versions.
- Add export service that reads a selected Parquet version and writes a CSV file into `workspace/exports`.
- Expand import through strategy classes when supporting Excel, JSON, or existing Parquet files.

## Known Notes

- `npm run lint` passes.
- `npx tsc --noEmit` passes.
- `npm run build` passes after disabling Windows executable sign/edit for unsigned MVP packaging.
- Existing dev metadata DBs from the old schema are reset automatically on app startup because this phase intentionally rebuilt migrations from the beginning.
