# Original Idea - DataPrep Studio

DataPrep Studio is a local-first desktop application for dataset preparation: CSV import, profiling, cleaning, versioning, and export.

## Product Description

DataPrep Studio helps users import local datasets, inspect data quality, clean data interactively, save every transformation as an immutable version, and export cleaned datasets for downstream analysis.

Short version:

> A local-first dataset profiling, cleaning, and versioning desktop app.

## Product Flow

```text
Import dataset
-> Auto profile / inspect data
-> Show overview and column statistics
-> Let user clean/transform data interactively
-> Apply operation as a new version
-> Export cleaned dataset
```

## MVP Scope

- Desktop app with Electron + React + TypeScript.
- Local metadata storage with SQLite.
- Local workspace folder for imported datasets and generated versions.
- CSV import only.
- Dataset versioning with immutable old versions.
- Basic profiling: row count, column count, file size, column names, inferred types, null count/rate, unique count, sample values, duplicate count, quality score.
- Limited data preview, defaulting to 100 rows; the renderer must never receive the full dataset.
- Cleaning operations: rename column, drop column, trim text, fill null, remove duplicates, change type, filter rows.
- Export cleaned version as CSV.
- Audit/history for import, cleaning, and version creation.

## Out Of MVP Scope

- No FastAPI, HTTP API server, PostgreSQL server, MinIO, Spark, or Airflow.
- No cloud storage, login/auth, or multi-user system.
- No Python worker in the initial MVP.
- No Excel or database source import in the first MVP.

## Target Architecture

```text
React Renderer UI
-> Preload API / IPC
-> Electron Main Process
-> Core Services
-> SQLite metadata.db + local workspace files
```

The renderer should only call safe APIs through `window.api`. It must not directly access the filesystem, SQLite, or data processing libraries.

## Local Workspace

Application data lives under Electron `app.getPath("userData")`, inside a dedicated DataPrep Studio folder:

```text
DataPrepStudio/
  metadata.db
  workspace/
    datasets/
    tmp/
    exports/
  logs/
```

Important rules:

- Never modify the user's original file.
- Copy imported files into the workspace.
- Never overwrite old versions.
- Every cleaning operation creates a new version folder.
- Prefer storing relative paths in SQLite.
