-- =========================================================
-- 001_init.sql
-- Initial SQLite schema for Data Prep App
-- SQLite is used for app metadata.
-- DuckDB is used separately for analytical data per workspace.
-- =========================================================


-- =========================================================
-- Schema migrations
-- Track which migration files have been applied.
-- =========================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);


-- =========================================================
-- Workspaces
-- A workspace is a project/container where the user imports data,
-- runs SQL queries, saves outputs, etc.
-- =========================================================

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,

  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Real folder path on local machine
  path TEXT NOT NULL UNIQUE,

  -- Path to the DuckDB database file for this workspace
  duckdb_path TEXT NOT NULL UNIQUE,

  -- ACTIVE | ARCHIVED
  status TEXT NOT NULL DEFAULT 'ACTIVE',

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  CHECK (status IN ('ACTIVE', 'ARCHIVED'))
);

CREATE INDEX IF NOT EXISTS idx_workspaces_slug
ON workspaces(slug);

CREATE INDEX IF NOT EXISTS idx_workspaces_status
ON workspaces(status);

CREATE INDEX IF NOT EXISTS idx_workspaces_updated_at
ON workspaces(updated_at);


-- =========================================================
-- Data sources
-- Files or external data sources added into a workspace.
-- This table does NOT store the actual dataset.
-- It only stores metadata about the imported source.
-- =========================================================

CREATE TABLE IF NOT EXISTS data_sources (
  id TEXT PRIMARY KEY,

  workspace_id TEXT NOT NULL,

  name TEXT NOT NULL,

  -- CSV | EXCEL | PARQUET | JSON | SQLITE | POSTGRES
  type TEXT NOT NULL,

  -- Original file path selected by the user
  original_path TEXT,

  -- Copied/internal file path inside workspace/data/raw
  stored_path TEXT,

  -- Table name created inside workspace.duckdb
  table_name TEXT,

  -- PENDING | READY | FAILED
  status TEXT NOT NULL DEFAULT 'PENDING',

  -- Optional error message if import failed
  error_message TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

  CHECK (type IN ('CSV', 'EXCEL', 'PARQUET', 'JSON', 'SQLITE', 'POSTGRES')),
  CHECK (status IN ('PENDING', 'READY', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_data_sources_workspace_id
ON data_sources(workspace_id);

CREATE INDEX IF NOT EXISTS idx_data_sources_type
ON data_sources(type);

CREATE INDEX IF NOT EXISTS idx_data_sources_status
ON data_sources(status);

CREATE INDEX IF NOT EXISTS idx_data_sources_table_name
ON data_sources(table_name);


-- =========================================================
-- Saved queries
-- SQL queries saved by the user inside a workspace.
-- =========================================================

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


-- =========================================================
-- Query history
-- History of executed SQL queries.
-- Useful for recent queries, debugging, and showing execution time.
-- =========================================================

CREATE TABLE IF NOT EXISTS query_history (
  id TEXT PRIMARY KEY,

  workspace_id TEXT NOT NULL,

  sql TEXT NOT NULL,

  -- SUCCESS | FAILED
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


-- =========================================================
-- App settings
-- Simple key-value settings for app-level config.
-- Example:
-- theme = dark
-- last_opened_workspace_id = workspace_xxx
-- =========================================================

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);