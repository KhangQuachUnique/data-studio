# Current Status

Last updated: 2026-06-09

## Current Phase

Phase 2 - Parquet-first CSV import and metadata foundation.

## Already In Place

- Repo Electron + React + TypeScript scaffold.
- Renderer is organized into `app`, `pages`, `features`, and `shared`.
- SQLite metadata schema has been rebuilt cleanly in `001_init.sql`.
- Metadata now follows the final MVP model: `workspaces`, `data_sources`, `datasets`, `dataset_versions`, `dataset_version_columns`, profile report tables, and `operations`.
- DuckDB is now a processing engine only. It reads CSV/Parquet and writes Parquet, but imported datasets are not stored as persistent DuckDB tables.
- CSV import copies the original file into workspace raw storage, converts it into a canonical Parquet version, stores metadata in SQLite, and records the import operation.
- Current dataset preview reads directly from `read_parquet(...)` with a bounded row limit.
- Workspace archive/unarchive flows remain available from IPC and UI.
- Windows packaging now skips `winCodeSign` executable editing for unsigned MVP builds, avoiding the symlink privilege failure.

## In Progress

- Keep deeper profiling as the next engine step.
- Keep transform/clean operations aligned with Parquet version output.
- Keep import format expansion behind future strategy implementations.

## Next

- Persist actual dataset profile reports into `dataset_profile_reports` and `column_profile_reports`.
- Add cleaning/transform services that read an input Parquet version and write a new Parquet output version.
- Add export flow that reads the selected Parquet version and writes CSV.
- Add richer dataset table interaction beyond the bounded preview.
