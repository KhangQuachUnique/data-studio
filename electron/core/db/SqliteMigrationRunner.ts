import type { SqliteDatabase } from "./SqliteConnection";
import fs from "fs";
import path from "path";

interface MigrationFile {
  version: number;
  name: string;
  filename: string;
  filePath: string;
  sql: string;
}

export class SqliteMigrationRunner {
  constructor(
    private readonly db: SqliteDatabase,
    private readonly migrationsDir: string,
  ) {}

  run(): void {
    this.createMigrationsTableIfNotExists();
    this.resetLegacySchemaIfNeeded();

    const migrations = this.loadMigrationsFromDirectory();

    for (const migration of migrations) {
      if (this.isApplied(migration.version)) {
        continue;
      }

      const transaction = this.db.transaction(() => {
        this.db.exec(migration.sql);
        this.db
          .prepare(
            `
            INSERT INTO schema_migrations (version, name, applied_at)
            VALUES (?, ?, ?)
            `,
          )
          .run(migration.version, migration.name, new Date().toISOString());
      });

      transaction();
    }
  }

  private createMigrationsTableIfNotExists(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );
    `);
  }

  private resetLegacySchemaIfNeeded(): void {
    if (!this.tableExists("workspaces")) {
      return;
    }

    const hasNewWorkspacePath = this.columnExists("workspaces", "root_path");
    const hasLegacyDataSourceTableName =
      this.tableExists("data_sources") &&
      this.columnExists("data_sources", "table_name");

    if (hasNewWorkspacePath && !hasLegacyDataSourceTableName) {
      return;
    }

    const tableRows = this.db
      .prepare(
        `
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
        `,
      )
      .all() as Array<{ name: string }>;

    this.db.pragma("foreign_keys = OFF");
    try {
      for (const row of tableRows) {
        this.db.exec(`DROP TABLE IF EXISTS ${this.escapeIdentifier(row.name)}`);
      }
    } finally {
      this.db.pragma("foreign_keys = ON");
    }

    this.createMigrationsTableIfNotExists();
  }

  private tableExists(tableName: string): boolean {
    const row = this.db
      .prepare(
        `
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name = ?
        `,
      )
      .get(tableName);

    return !!row;
  }

  private columnExists(tableName: string, columnName: string): boolean {
    const rows = this.db
      .prepare(`PRAGMA table_info(${this.escapeIdentifier(tableName)})`)
      .all() as Array<{ name: string }>;

    return rows.some((row) => row.name === columnName);
  }

  private escapeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  private isApplied(version: number): boolean {
    const row = this.db
      .prepare(
        `
        SELECT version 
        FROM schema_migrations
        WHERE version = ?
        `,
      )
      .get(version);

    return !!row;
  }

  private loadMigrationsFromDirectory(): MigrationFile[] {
    const filenames = fs
      .readdirSync(this.migrationsDir)
      .filter((fileName: string) => fileName.endsWith(".sql"))
      .sort();

    return filenames.map((filename: string) => {
      const versionMatch = filename.match(/^(\d+)_(.+)\.sql$/);

      if (!versionMatch) {
        throw new Error(
          `Invalid migration filename: ${filename}. Expected format: 001_init.sql`,
        );
      }

      const version = parseInt(versionMatch[1], 10);
      const name = versionMatch[2];
      const filePath = path.join(this.migrationsDir, filename);
      const sql = fs.readFileSync(filePath, "utf-8");

      return { version, name, filename, filePath, sql };
    });
  }
}
