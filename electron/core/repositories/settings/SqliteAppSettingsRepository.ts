import type { SqliteDatabase } from "@core/db/SqliteConnection";
import { nowIso } from "@core/utils/date";
import type { AppSettingsRepository } from "./AppSettingsRepository";

interface AppSettingRow {
  value: string;
}

export class SqliteAppSettingsRepository implements AppSettingsRepository {
  constructor(private readonly db: SqliteDatabase) {}

  async get(key: string): Promise<string | null> {
    const row = this.db
      .prepare("SELECT value FROM app_settings WHERE key = ?")
      .get(key) as AppSettingRow | undefined;

    return row?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    this.db
      .prepare(
        `
        INSERT INTO app_settings (key, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
        `,
      )
      .run(key, value, nowIso());
  }
}
