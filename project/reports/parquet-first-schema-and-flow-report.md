# Parquet-First Schema And Flow Report

Date: 2026-06-09

## 1. Summary

The data app has moved from a DuckDB-table-centered import model to a Parquet-first model.

The current rule is:

- SQLite stores metadata only.
- Workspace folders store raw copied files and immutable dataset version artifacts.
- Parquet is the canonical storage format for successful dataset versions.
- DuckDB is a processing/query engine over files. It reads CSV/Parquet and writes Parquet, but imported datasets are not represented as persistent DuckDB tables.

Current implemented flow:

```text
CSV file selected
-> copy original CSV into workspace/data/raw
-> create import operation metadata
-> DuckDB reads copied CSV and writes Parquet v1
-> inspect Parquet schema and counts
-> create data source, dataset, dataset version, version columns
-> point dataset.current_version_id to v1
-> preview reads current Parquet with read_parquet(...)
```

## 2. SQLite Schema

Main migration: `electron/core/db/migrations/001_init.sql`

The schema was rebuilt cleanly from the final MVP model. The old table-centric migration was removed.

### `schema_migrations`

Tracks which SQL migration versions have been applied.

Important fields:

- `version`
- `name`
- `applied_at`

### `workspaces`

Top-level local project container.

Important fields:

- `id`
- `name`
- `slug`
- `description`
- `root_path`
- `status`: `ACTIVE` or `ARCHIVED`
- `created_at`
- `updated_at`
- `last_opened_at`

Implementation note:

- The app domain type still exposes `workspace.path`.
- `WorkspaceRepositoryImpl` maps `root_path` from SQLite to `workspace.path`.
- `duckdbPath` is derived as `root_path/duckdb/workspace.duckdb` for compatibility, but DuckDB no longer stores dataset tables.

### `data_sources`

Represents where data came from. It does not store physical dataset stats.

Important fields:

- `id`
- `workspace_id`
- `name`
- `source_type`: `file`, `folder`, `database`, `api`, `manual`
- `source_uri`: original file path or future external source URI
- `provider`: currently `local`
- `config_json`: import config such as delimiter/header/original path/copied raw path
- `created_at`
- `updated_at`

Current CSV example:

```json
{
  "sourceFormat": "csv",
  "originalPath": "C:/path/input.csv",
  "copiedRawPath": "data/raw/input.csv",
  "delimiter": ",",
  "hasHeader": true
}
```

### `datasets`

Logical dataset shown to users. A dataset is separate from the source and from physical files.

Important fields:

- `id`
- `workspace_id`
- `source_id`
- `name`
- `display_name`
- `description`
- `dataset_kind`: `raw`, `derived`, `cleaned`, `joined`, `aggregated`
- `status`: `active`, `archived`, `deleted`
- `current_version_id`
- `created_at`
- `updated_at`

Current import behavior:

- Creates one `raw` dataset per imported CSV.
- Sets `current_version_id` after Parquet v1 is created.

### `dataset_versions`

Physical immutable snapshot of a dataset.

Important fields:

- `id`
- `workspace_id`
- `dataset_id`
- `version_number`
- `version_name`
- `description`
- `storage_format`: currently `parquet`
- `storage_uri`: workspace-relative path to the Parquet file
- `row_count`
- `column_count`
- `size_bytes`
- `schema_json`
- `created_by_operation_id`
- `created_at`

Current storage URI pattern:

```text
data/datasets/{datasetId}/versions/v1/data.parquet
```

Future transform behavior should create:

```text
data/datasets/{datasetId}/versions/v2/data.parquet
data/datasets/{datasetId}/versions/v3/data.parquet
```

### `dataset_version_columns`

Column schema metadata for a specific dataset version.

Important fields:

- `id`
- `dataset_version_id`
- `column_name`
- `ordinal_position`
- `data_type`
- `nullable`
- `original_column_name`
- `created_at`

Current import behavior:

- Generated from DuckDB `DESCRIBE SELECT * FROM read_parquet(...)`.
- `nullable` is currently set to `true`.
- `original_column_name` is the imported column name.

### `dataset_profile_reports`

Dataset-level quality/profile report for one dataset version.

Important fields:

- `workspace_id`
- `dataset_id`
- `dataset_version_id`
- row/column/size fields
- duplicate/missing/empty metrics
- quality score
- summary JSON fields
- `status`: `pending`, `running`, `success`, `failed`
- `error_message`
- `created_at`
- `finished_at`

Current status:

- Schema exists.
- Profile generation service is not implemented yet.

### `column_profile_reports`

Column-level profiling report linked to both a report and a version column.

Important fields:

- `profile_report_id`
- `dataset_version_id`
- `dataset_version_column_id`
- `column_name`
- `ordinal_position`
- declared/inferred type
- null/empty/unique stats
- numeric/string stats
- top/sample values JSON
- issues/stats JSON

Current status:

- Schema exists.
- Profile generation service is not implemented yet.

### `operations`

Processing action history.

Important fields:

- `id`
- `workspace_id`
- `operation_type`: `import`, `profile`, `clean`, `export`, `transform`
- `status`: `pending`, `running`, `success`, `failed`, `canceled`
- `source_id`
- `input_version_id`
- `output_version_id`
- `output_profile_report_id`
- `engine_type`: currently `duckdb`
- `name`
- `description`
- `config_json`
- `result_json`
- `error_message`
- `started_at`
- `finished_at`
- `created_at`

Current import behavior:

- Creates operation with `status = running`.
- Updates operation to `success` with `output_version_id` and result stats.
- Updates operation to `failed` with `error_message` if conversion fails.

## 3. Shared Types

Main file: `shared/types/DataSource.ts`

Important domain types:

- `DataSource`
- `Dataset`
- `DatasetVersion`
- `DatasetVersionColumn`
- `DatasetProfileReport`
- `ColumnProfileReport`
- `Operation`
- `DataSourceListItem`
- `ImportCsvInput`
- `ImportCsvResult`
- `DataSourcePreview`

Important type changes:

- Removed table-centric fields such as `tableName`.
- Removed source-level stats such as `rowCount`, `columnCount`, `profileStatus`.
- Stats now belong to `DatasetVersion`.
- Source metadata belongs to `DataSource`.
- Logical display/status belongs to `Dataset`.
- Processing lifecycle belongs to `Operation`.

## 4. Repositories

Repositories live under `electron/core/repositories`.

### `SqliteWorkspaceRepository`

Files:

- `electron/core/repositories/workspace/WorkspaceRepository.ts`
- `electron/core/repositories/workspace/WorkspaceRepositoryImpl.ts`

Responsibilities:

- List workspaces.
- Find workspace by ID or slug.
- Create/update workspace metadata.
- Map SQLite `root_path` to domain `workspace.path`.
- Derive `duckdbPath` for service compatibility.

### `SqliteDataSourceRepository`

Files:

- `electron/core/repositories/data-source/DataSourceRepository.ts`
- `electron/core/repositories/data-source/DataSourceRepositoryImpl.ts`

Responsibilities:

- Create/update/delete data source metadata.
- Find data source by ID.
- List data sources for a workspace.
- Join data sources to datasets and current versions for UI list/detail views.

List output shape:

```ts
{
  dataSource,
  dataset,
  currentVersion,
  versionCount
}
```

### `SqliteDatasetRepository`

Files:

- `electron/core/repositories/dataset/DatasetRepository.ts`
- `electron/core/repositories/dataset/DatasetRepositoryImpl.ts`

Responsibilities:

- Create logical datasets.
- Update current version pointer.
- Find dataset by ID.
- Find dataset by source ID.

Current import uses it to:

- Create a `raw` dataset.
- Later update `currentVersionId` after version v1 exists.

### `SqliteDatasetVersionRepository`

Files:

- `electron/core/repositories/dataset-version/DatasetVersionRepository.ts`
- `electron/core/repositories/dataset-version/DatasetVersionRepositoryImpl.ts`

Responsibilities:

- Create dataset version metadata.
- Find version by ID.
- Find all versions for a dataset.

Current import uses it to create v1 with:

- `storageFormat = parquet`
- `storageUri = data/datasets/{datasetId}/versions/v1/data.parquet`
- row/column counts
- file size
- schema snapshot
- creating operation ID

### `SqliteDatasetVersionColumnRepository`

Files:

- `electron/core/repositories/dataset-version-column/DatasetVersionColumnRepository.ts`
- `electron/core/repositories/dataset-version-column/DatasetVersionColumnRepositoryImpl.ts`

Responsibilities:

- Bulk insert column metadata for a dataset version.

Current import uses it after Parquet inspection.

### `SqliteOperationRepository`

Files:

- `electron/core/repositories/operation/OperationRepository.ts`
- `electron/core/repositories/operation/OperationRepositoryImpl.ts`

Responsibilities:

- Create operation rows.
- Update operation rows.

Current import uses it to track:

- import started
- import success
- import failure

## 5. Services

### `AppBootstrapService`

File: `electron/core/services/AppBootstrapService.ts`

Responsibilities:

- Resolve Electron `userData` path.
- Create app-level directories.
- Provide `databasePath` and `workspacesPath`.

The SQLite database path remains:

```text
{userData}/app.sqlite
```

### `WorkspaceService`

File: `electron/core/services/WorkspaceService.ts`

Responsibilities:

- List workspaces.
- Create workspace.
- Set/get last opened workspace.
- Archive/unarchive workspace.
- Return workspace integrity checks.

Workspace creation now ensures:

```text
workspace/
  data/
    raw/
    datasets/
  duckdb/
  queries/
  exports/
  manifest.json
```

Important note:

- `duckdb/` exists for engine compatibility and future scratch use.
- Dataset storage is under `data/datasets`.

### `DuckDbService`

File: `electron/core/services/DuckDbService.ts`

Responsibilities:

- Convert CSV to Parquet.
- Inspect Parquet row count, schema, column count, and size.
- Preview Parquet rows.

Current methods:

- `convertCsvToParquet(input)`
- `inspectParquet(duckdbPath, parquetPath)`
- `previewParquet(duckdbPath, parquetPath, rowLimit)`

Implementation details:

- Uses `DuckDBInstance.create(":memory:")` per operation.
- Does not use `DuckDBInstance.fromCache(...)`.
- Closes connection and instance after use.
- Normalizes Windows paths to `/` before injecting into DuckDB SQL.
- Wraps stages with clearer errors:
  - `open in-memory engine`
  - `connect engine`
  - `convert CSV to Parquet`
  - `inspect Parquet`
  - `preview Parquet`

CSV conversion SQL:

```sql
COPY (
  SELECT *
  FROM read_csv(
    'copied.csv',
    delim = ',',
    header = true,
    quote = '"',
    escape = '"',
    strict_mode = false,
    null_padding = true,
    ignore_errors = true,
    all_varchar = true,
    sample_size = -1,
    max_line_size = 10000000
  )
)
TO 'data.parquet'
(FORMAT PARQUET)
```

Schema inspection SQL:

```sql
DESCRIBE SELECT *
FROM read_parquet('data.parquet')
```

Preview SQL:

```sql
SELECT *
FROM read_parquet('data.parquet')
LIMIT 100
```

Important bug fix:

- Avoided `reader.columnType()` and `reader.columnTypesJson()` because native logical type wrappers triggered `Invalid Error: bad_weak_ptr` in Electron.
- SQL `DESCRIBE` is now used instead.

### `DataSourceService`

File: `electron/core/services/DataSourceService.ts`

Responsibilities:

- List data sources.
- Import CSV.
- Preview current dataset version.
- Delete data source and workspace-owned artifacts.

#### `listDataSources(workspaceId)`

Flow:

1. Validates workspace exists.
2. Delegates to `DataSourceRepository.findByWorkspaceId`.
3. Returns data source list items with source, dataset, current version, and version count.

#### `previewDataSource(workspaceId, dataSourceId, rowLimit)`

Flow:

1. Loads workspace.
2. Loads source.
3. Finds dataset by source ID.
4. Loads `dataset.currentVersionId`.
5. Verifies current version is Parquet.
6. Resolves `storage_uri` to an absolute workspace path.
7. Calls `DuckDbService.previewParquet`.

Renderer receives:

```ts
{
  columns: string[];
  rows: Record<string, unknown>[];
  rowLimit: number;
}
```

#### `importCsv(input)`

Public method that delegates to internal `importFile(input)`. This keeps current IPC stable while leaving room for future file strategies.

#### `importFile(input)`

Full import flow:

1. Load active workspace.
2. Resolve and validate selected CSV path.
3. Generate IDs:
   - data source ID
   - dataset ID
   - dataset version ID
   - operation ID
4. Copy original CSV into:

   ```text
   workspace/data/raw/{safe-file-name}.csv
   ```

5. Build target Parquet path:

   ```text
   workspace/data/datasets/{datasetId}/versions/v1/data.parquet
   ```

6. Create import `Operation`:

   ```text
   operation_type = import
   status = running
   engine_type = duckdb
   ```

7. Call `DuckDbService.convertCsvToParquet`.
8. Build `DataSource`:
   - source type: `file`
   - provider: `local`
   - source URI: original path
   - config JSON: original path, copied raw path, delimiter, header, source format
9. Build `Dataset`:
   - kind: `raw`
   - status: `active`
10. Build `DatasetVersion`:
    - version number: `1`
    - storage format: `parquet`
    - storage URI: workspace-relative Parquet path
    - counts and schema from DuckDB inspection
11. Build `DatasetVersionColumn[]`.
12. Persist source, dataset, version, and columns.
13. Update `datasets.current_version_id`.
14. Mark operation `success`.
15. Return source, dataset, and current version.

Failure flow:

1. Delete partial Parquet artifact if it was created.
2. Mark operation `failed`.
3. Save error message.
4. Re-throw the error to IPC/UI.

#### `deleteDataSource(workspaceId, dataSourceId)`

Flow:

1. Load active workspace.
2. Load data source.
3. Find dataset by source ID.
4. Load all dataset versions.
5. Delete workspace-owned Parquet files for those versions.
6. Delete copied raw file from `config_json.copiedRawPath`.
7. Delete data source row.
8. SQLite cascade removes linked dataset/version/column metadata.

Safety rule:

- Deletes only paths inside the workspace.
- Never deletes the user's original source file.

## 6. IPC And Renderer Flow

Main process: `electron/main.ts`

Registered IPC:

- `dialog:select-csv-file`
- `dataSource:list`
- `dataSource:importCsv`
- `dataSource:preview`
- `dataSource:delete`

Preload: `electron/preload.ts`

Exposes safe `window.api` methods:

- `selectCsvFile`
- `listDataSources`
- `importCsv`
- `previewDataSource`
- `deleteDataSource`

Renderer:

- `src/features/data-sources/api/dataSourceApi.ts`
- `src/features/data-sources/hooks/useDataSources.ts`
- `src/features/data-sources/components/DataSourcePanel.tsx`

Renderer responsibilities:

- Let user select CSV.
- Call import API with delimiter/header defaults.
- Refresh source list after import.
- Show source metadata, dataset version metadata, Parquet path, row/column counts, and size.
- Load preview on demand.
- Delete a source through the service.

## 7. Workspace File Layout

Current workspace layout:

```text
workspace-root/
  data/
    raw/
      copied-original.csv
    datasets/
      dataset_xxx/
        versions/
          v1/
            data.parquet
  duckdb/
    workspace.duckdb
  queries/
  exports/
  manifest.json
```

Canonical data lives under:

```text
data/datasets/{datasetId}/versions/{version}/data.parquet
```

The raw copied CSV is kept for traceability and possible re-import/debugging.

## 8. Migration Behavior

The migration runner now detects old early-development metadata schemas.

If it finds:

- `workspaces` exists but does not have `root_path`, or
- old `data_sources.table_name` exists

then it resets metadata tables and re-applies the clean `001_init.sql`.

This is intentional because the project is still pre-release and the schema was rebuilt from scratch.

## 9. Build And Verification

Verified commands:

```text
npx tsc --noEmit
npm run lint
npm run build
```

Build note:

- Windows unsigned MVP builds set `win.signAndEditExecutable = false`.
- This avoids `winCodeSign` symlink extraction failures on Windows without Developer Mode/admin symlink privileges.

## 10. Current Limitations

- CSV is the only import format currently implemented.
- Profile report persistence tables exist, but profile generation service is not implemented.
- Cleaning/transform/export services are not implemented yet.
- `nullable` in `dataset_version_columns` is currently set to `true` by default.
- Import config is stored as JSON text; validation is service-level for now.

## 11. Recommended Next Steps

1. Add `ProfileService`:
   - input: dataset version ID
   - reads Parquet with DuckDB
   - writes `dataset_profile_reports` and `column_profile_reports`

2. Add transform operation framework:
   - input version
   - transform config
   - DuckDB SQL over input Parquet
   - output Parquet version
   - operation result metadata

3. Add export service:
   - selected dataset version
   - output format CSV first
   - write into `workspace/exports`

4. Add import strategies:
   - keep `importCsv` as stable IPC for now
   - introduce strategy interface when Excel/JSON/Parquet imports are added

5. Add stronger artifact cleanup:
   - remove empty version directories after failed import/delete
   - optionally clean empty dataset directories after deleting all versions
