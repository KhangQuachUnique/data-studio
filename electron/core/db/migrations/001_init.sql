-- =========================================================
-- 001_init.sql
-- Clean SQLite metadata schema for Data Prep App.
-- DuckDB is used as a parquet processing engine, not as dataset storage.
-- =========================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,

  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  root_path TEXT NOT NULL UNIQUE,

  status TEXT NOT NULL DEFAULT 'ACTIVE',

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_opened_at TEXT,

  CHECK (status IN ('ACTIVE', 'ARCHIVED'))
);

CREATE INDEX IF NOT EXISTS idx_workspaces_slug
ON workspaces(slug);

CREATE INDEX IF NOT EXISTS idx_workspaces_status
ON workspaces(status);

CREATE INDEX IF NOT EXISTS idx_workspaces_updated_at
ON workspaces(updated_at);

CREATE TABLE IF NOT EXISTS data_sources (
  id TEXT PRIMARY KEY,

  workspace_id TEXT NOT NULL,

  name TEXT NOT NULL,

  source_type TEXT NOT NULL,
  source_uri TEXT,
  provider TEXT,
  config_json TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

  CHECK (source_type IN ('file', 'folder', 'database', 'api', 'manual'))
);

CREATE INDEX IF NOT EXISTS idx_data_sources_workspace_id
ON data_sources(workspace_id);

CREATE TABLE IF NOT EXISTS datasets (
  id TEXT PRIMARY KEY,

  workspace_id TEXT NOT NULL,
  source_id TEXT,

  name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,

  dataset_kind TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'active',

  current_version_id TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

  FOREIGN KEY (source_id)
    REFERENCES data_sources(id)
    ON DELETE CASCADE,

  FOREIGN KEY (current_version_id)
    REFERENCES dataset_versions(id)
    ON DELETE SET NULL,

  UNIQUE (workspace_id, name),

  CHECK (dataset_kind IN ('raw', 'derived', 'cleaned', 'joined', 'aggregated')),
  CHECK (status IN ('active', 'archived', 'deleted'))
);

CREATE INDEX IF NOT EXISTS idx_datasets_workspace_id
ON datasets(workspace_id);

CREATE INDEX IF NOT EXISTS idx_datasets_source_id
ON datasets(source_id);

CREATE TABLE IF NOT EXISTS dataset_versions (
  id TEXT PRIMARY KEY,

  workspace_id TEXT NOT NULL,
  dataset_id TEXT NOT NULL,

  version_number INTEGER NOT NULL,

  version_name TEXT,
  description TEXT,

  storage_format TEXT NOT NULL,
  storage_uri TEXT NOT NULL,

  row_count INTEGER,
  column_count INTEGER,
  size_bytes INTEGER,

  schema_json TEXT,

  created_by_operation_id TEXT,

  created_at TEXT NOT NULL,

  FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

  FOREIGN KEY (dataset_id)
    REFERENCES datasets(id)
    ON DELETE CASCADE,

  FOREIGN KEY (created_by_operation_id)
    REFERENCES operations(id)
    ON DELETE SET NULL,

  UNIQUE (dataset_id, version_number),

  CHECK (storage_format IN ('parquet', 'csv', 'duckdb_table'))
);

CREATE INDEX IF NOT EXISTS idx_dataset_versions_workspace_id
ON dataset_versions(workspace_id);

CREATE INDEX IF NOT EXISTS idx_dataset_versions_dataset_id
ON dataset_versions(dataset_id);

CREATE TABLE IF NOT EXISTS dataset_version_columns (
  id TEXT PRIMARY KEY,

  dataset_version_id TEXT NOT NULL,

  column_name TEXT NOT NULL,
  ordinal_position INTEGER NOT NULL,

  data_type TEXT NOT NULL,
  nullable INTEGER,

  original_column_name TEXT,

  created_at TEXT NOT NULL,

  FOREIGN KEY (dataset_version_id)
    REFERENCES dataset_versions(id)
    ON DELETE CASCADE,

  UNIQUE (dataset_version_id, column_name),

  CHECK (nullable IN (0, 1) OR nullable IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_dataset_version_columns_dataset_version_id
ON dataset_version_columns(dataset_version_id);

CREATE TABLE IF NOT EXISTS dataset_profile_reports (
  id TEXT PRIMARY KEY,

  workspace_id TEXT NOT NULL,
  dataset_id TEXT NOT NULL,
  dataset_version_id TEXT NOT NULL,

  row_count INTEGER,
  column_count INTEGER,
  size_bytes INTEGER,

  duplicate_row_count INTEGER,
  duplicate_row_ratio REAL,

  missing_cell_count INTEGER,
  missing_cell_ratio REAL,

  empty_row_count INTEGER,
  empty_row_ratio REAL,
  empty_column_count INTEGER,

  quality_score REAL,

  schema_summary_json TEXT,
  quality_issues_json TEXT,
  suggested_actions_json TEXT,
  summary_json TEXT,

  status TEXT NOT NULL,
  error_message TEXT,

  created_at TEXT NOT NULL,
  finished_at TEXT,

  FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

  FOREIGN KEY (dataset_id)
    REFERENCES datasets(id)
    ON DELETE CASCADE,

  FOREIGN KEY (dataset_version_id)
    REFERENCES dataset_versions(id)
    ON DELETE CASCADE,

  CHECK (status IN ('pending', 'running', 'success', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_dataset_profile_reports_workspace_id
ON dataset_profile_reports(workspace_id);

CREATE INDEX IF NOT EXISTS idx_dataset_profile_reports_dataset_id
ON dataset_profile_reports(dataset_id);

CREATE INDEX IF NOT EXISTS idx_dataset_profile_reports_dataset_version_id
ON dataset_profile_reports(dataset_version_id);

CREATE INDEX IF NOT EXISTS idx_dataset_profile_reports_status
ON dataset_profile_reports(status);

CREATE TABLE IF NOT EXISTS column_profile_reports (
  id TEXT PRIMARY KEY,

  profile_report_id TEXT NOT NULL,
  dataset_version_id TEXT NOT NULL,
  dataset_version_column_id TEXT NOT NULL,

  column_name TEXT NOT NULL,
  ordinal_position INTEGER NOT NULL,

  declared_type TEXT,
  inferred_type TEXT,

  row_count INTEGER,
  non_null_count INTEGER,
  null_count INTEGER,
  null_ratio REAL,

  empty_string_count INTEGER,
  empty_string_ratio REAL,

  unique_count INTEGER,
  unique_ratio REAL,

  min_value TEXT,
  max_value TEXT,

  mean_value REAL,
  median_value REAL,
  std_value REAL,

  q1_value REAL,
  q3_value REAL,

  min_length INTEGER,
  max_length INTEGER,
  avg_length REAL,

  top_values_json TEXT,
  sample_values_json TEXT,
  issues_json TEXT,
  stats_json TEXT,

  created_at TEXT NOT NULL,

  FOREIGN KEY (profile_report_id)
    REFERENCES dataset_profile_reports(id)
    ON DELETE CASCADE,

  FOREIGN KEY (dataset_version_id)
    REFERENCES dataset_versions(id)
    ON DELETE CASCADE,

  FOREIGN KEY (dataset_version_column_id)
    REFERENCES dataset_version_columns(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_column_profile_reports_profile_report_id
ON column_profile_reports(profile_report_id);

CREATE INDEX IF NOT EXISTS idx_column_profile_reports_dataset_version_id
ON column_profile_reports(dataset_version_id);

CREATE INDEX IF NOT EXISTS idx_column_profile_reports_dataset_version_column_id
ON column_profile_reports(dataset_version_column_id);

CREATE INDEX IF NOT EXISTS idx_column_profile_reports_version_column_name
ON column_profile_reports(dataset_version_id, column_name);

CREATE TABLE IF NOT EXISTS operations (
  id TEXT PRIMARY KEY,

  workspace_id TEXT NOT NULL,

  operation_type TEXT NOT NULL,
  status TEXT NOT NULL,

  source_id TEXT,

  input_version_id TEXT,
  output_version_id TEXT,
  output_profile_report_id TEXT,

  engine_type TEXT,

  name TEXT,
  description TEXT,

  config_json TEXT,
  result_json TEXT,
  error_message TEXT,

  started_at TEXT,
  finished_at TEXT,
  created_at TEXT NOT NULL,

  FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

  FOREIGN KEY (source_id)
    REFERENCES data_sources(id)
    ON DELETE SET NULL,

  FOREIGN KEY (input_version_id)
    REFERENCES dataset_versions(id)
    ON DELETE SET NULL,

  FOREIGN KEY (output_version_id)
    REFERENCES dataset_versions(id)
    ON DELETE SET NULL,

  FOREIGN KEY (output_profile_report_id)
    REFERENCES dataset_profile_reports(id)
    ON DELETE SET NULL,

  CHECK (operation_type IN ('import', 'profile', 'clean', 'export', 'transform')),
  CHECK (status IN ('pending', 'running', 'success', 'failed', 'canceled'))
);

CREATE INDEX IF NOT EXISTS idx_operations_workspace_id
ON operations(workspace_id);

CREATE INDEX IF NOT EXISTS idx_operations_operation_type
ON operations(operation_type);

CREATE INDEX IF NOT EXISTS idx_operations_status
ON operations(status);

CREATE INDEX IF NOT EXISTS idx_operations_source_id
ON operations(source_id);

CREATE INDEX IF NOT EXISTS idx_operations_input_version_id
ON operations(input_version_id);

CREATE INDEX IF NOT EXISTS idx_operations_output_version_id
ON operations(output_version_id);

CREATE INDEX IF NOT EXISTS idx_operations_output_profile_report_id
ON operations(output_profile_report_id);

CREATE INDEX IF NOT EXISTS idx_operations_workspace_created_at
ON operations(workspace_id, created_at);

CREATE TABLE IF NOT EXISTS saved_queries (
  id TEXT PRIMARY KEY,

  workspace_id TEXT NOT NULL,

  name TEXT NOT NULL,
  sql TEXT NOT NULL,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saved_queries_workspace_id
ON saved_queries(workspace_id);

CREATE INDEX IF NOT EXISTS idx_saved_queries_updated_at
ON saved_queries(updated_at);

CREATE TABLE IF NOT EXISTS query_history (
  id TEXT PRIMARY KEY,

  workspace_id TEXT NOT NULL,

  sql TEXT NOT NULL,

  status TEXT NOT NULL,
  duration_ms INTEGER,
  error_message TEXT,

  executed_at TEXT NOT NULL,

  FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

  CHECK (status IN ('SUCCESS', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_query_history_workspace_id
ON query_history(workspace_id);

CREATE INDEX IF NOT EXISTS idx_query_history_executed_at
ON query_history(executed_at);

CREATE INDEX IF NOT EXISTS idx_query_history_status
ON query_history(status);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
