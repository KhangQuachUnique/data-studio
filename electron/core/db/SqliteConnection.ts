import Database from "better-sqlite3";

export type SqliteDatabase = Database.Database;

export const createSqliteConnection = (
  databasePath: string,
): SqliteDatabase => {
  const db = new Database(databasePath);

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  return db;
};
