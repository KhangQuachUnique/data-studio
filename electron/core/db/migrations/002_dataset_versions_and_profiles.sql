-- =========================================================
-- 002_dataset_versions_and_profiles.sql
-- Add dataset versioning and profiling metadata.
-- SQLite stores metadata and report summaries only.
-- Dataset files and heavy artifacts stay in the workspace folder / DuckDB.
-- =========================================================


-- =========================================================
-- Extend data_sources
-- Store import metadata and point each source to its current dataset version.
-- =========================================================

ALTER TABLE data_sources
ADD COLUMN file_size_bytes INTEGER;

ALTER TABLE data_sources
ADD COLUMN detected_encoding TEXT;

ALTER TABLE data_sources
ADD COLUMN delimiter TEXT;

ALTER TABLE data_sources
ADD COLUMN has_header INTEGER NOT NULL DEFAULT 1
CHECK (has_header IN (0, 1));

ALTER TABLE data_sources
ADD COLUMN row_count INTEGER;

ALTER TABLE data_sources
ADD COLUMN column_count INTEGER;

ALTER TABLE data_sources
ADD COLUMN profile_status TEXT NOT NULL DEFAULT 'NOT_STARTED'
CHECK (profile_status IN ('NOT_STARTED', 'PENDING', 'READY', 'FAILED'));

ALTER TABLE data_sources
ADD COLUMN profiled_at TEXT;


-- =========================================================
-- Dataset versions
-- v1 is usually the raw imported dataset.
-- Later transform/cleaning steps create v2, v3, etc.
-- =========================================================

CREATE TABLE IF NOT EXISTS dataset_versions (
  id TEXT PRIMARY KEY,

  workspace_id TEXT NOT NULL,
  data_source_id TEXT NOT NULL,

  version_number INTEGER NOT NULL,

  -- IMPORT | TRANSFORM
  source_kind TEXT NOT NULL,

  parent_version_id TEXT,

  -- DuckDB table/view name for this version
  table_name TEXT NOT NULL,

  row_count INTEGER,
  column_count INTEGER,

  -- PENDING | READY | FAILED
  status TEXT NOT NULL DEFAULT 'PENDING',

  error_message TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

  FOREIGN KEY (data_source_id)
    REFERENCES data_sources(id)
    ON DELETE CASCADE,

  FOREIGN KEY (parent_version_id)
    REFERENCES dataset_versions(id)
    ON DELETE SET NULL,

  UNIQUE (data_source_id, version_number),
  UNIQUE (workspace_id, table_name),

  CHECK (source_kind IN ('IMPORT', 'TRANSFORM')),
  CHECK (status IN ('PENDING', 'READY', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_dataset_versions_workspace_id
ON dataset_versions(workspace_id);

CREATE INDEX IF NOT EXISTS idx_dataset_versions_data_source_id
ON dataset_versions(data_source_id);

CREATE INDEX IF NOT EXISTS idx_dataset_versions_parent_version_id
ON dataset_versions(parent_version_id);

CREATE INDEX IF NOT EXISTS idx_dataset_versions_status
ON dataset_versions(status);


-- =========================================================
-- Current version pointer
-- Added after dataset_versions exists so the foreign key can reference it.
-- =========================================================

ALTER TABLE data_sources
ADD COLUMN current_version_id TEXT
REFERENCES dataset_versions(id);

CREATE INDEX IF NOT EXISTS idx_data_sources_current_version_id
ON data_sources(current_version_id);

CREATE INDEX IF NOT EXISTS idx_data_sources_profile_status
ON data_sources(profile_status);


-- =========================================================
-- Dataset profile reports
-- One summary report per dataset version.
-- =========================================================

CREATE TABLE IF NOT EXISTS dataset_profile_reports (
  id TEXT PRIMARY KEY,

  workspace_id TEXT NOT NULL,
  data_source_id TEXT NOT NULL,
  dataset_version_id TEXT NOT NULL,

  -- PENDING | READY | FAILED
  status TEXT NOT NULL DEFAULT 'PENDING',

  row_count INTEGER,
  column_count INTEGER,

  duplicate_row_count INTEGER,
  missing_cell_count INTEGER,
  missing_cell_percent REAL,

  quality_score REAL,

  -- Optional path to full JSON report inside the workspace folder
  report_path TEXT,

  error_message TEXT,

  created_at TEXT NOT NULL,
  completed_at TEXT,

  FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

  FOREIGN KEY (data_source_id)
    REFERENCES data_sources(id)
    ON DELETE CASCADE,

  FOREIGN KEY (dataset_version_id)
    REFERENCES dataset_versions(id)
    ON DELETE CASCADE,

  UNIQUE (dataset_version_id),

  CHECK (status IN ('PENDING', 'READY', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_dataset_profile_reports_workspace_id
ON dataset_profile_reports(workspace_id);

CREATE INDEX IF NOT EXISTS idx_dataset_profile_reports_data_source_id
ON dataset_profile_reports(data_source_id);

CREATE INDEX IF NOT EXISTS idx_dataset_profile_reports_status
ON dataset_profile_reports(status);


-- =========================================================
-- Column profile reports
-- Per-column statistics for a dataset profile report.
-- =========================================================

CREATE TABLE IF NOT EXISTS column_profile_reports (
  id TEXT PRIMARY KEY,

  profile_report_id TEXT NOT NULL,

  column_name TEXT NOT NULL,
  column_index INTEGER NOT NULL,

  -- STRING | INTEGER | FLOAT | BOOLEAN | DATE | DATETIME | UNKNOWN
  inferred_type TEXT NOT NULL,

  non_null_count INTEGER,
  null_count INTEGER,
  null_percent REAL,

  distinct_count INTEGER,
  unique_count INTEGER,

  min_value TEXT,
  max_value TEXT,
  mean_value REAL,
  median_value REAL,
  stddev_value REAL,

  min_length INTEGER,
  max_length INTEGER,
  avg_length REAL,

  sample_values_json TEXT,
  warnings_json TEXT,

  created_at TEXT NOT NULL,

  FOREIGN KEY (profile_report_id)
    REFERENCES dataset_profile_reports(id)
    ON DELETE CASCADE,

  UNIQUE (profile_report_id, column_name),

  CHECK (
    inferred_type IN (
      'STRING',
      'INTEGER',
      'FLOAT',
      'BOOLEAN',
      'DATE',
      'DATETIME',
      'UNKNOWN'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_column_profile_reports_profile_report_id
ON column_profile_reports(profile_report_id);

CREATE INDEX IF NOT EXISTS idx_column_profile_reports_inferred_type
ON column_profile_reports(inferred_type);
