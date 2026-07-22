import * as SQLite from 'expo-sqlite';

const DB_NAME = 'plantpals.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Opens (once) and returns the on-device SQLite database. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}

/** Creates the schema if needed. Safe to call on every launch. */
export async function initDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS plants (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT    NOT NULL,
      species         TEXT,
      photo_url       TEXT,
      interval_days   INTEGER NOT NULL,
      water_amount_ml INTEGER,
      location        TEXT,
      care_notes      TEXT,
      created_at      TEXT    NOT NULL,
      last_watered_at TEXT,
      next_due_at     TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS watering_logs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id   INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
      watered_at TEXT    NOT NULL
    );

    CREATE INDEX IF NOT EXISTS ix_plants_due ON plants (next_due_at);
    CREATE INDEX IF NOT EXISTS ix_logs_plant ON watering_logs (plant_id);
    CREATE INDEX IF NOT EXISTS ix_logs_time ON watering_logs (watered_at);
  `);
}

/** Deletes all user data (plants + logs). Used by "Reset all data". */
export async function clearDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`DELETE FROM watering_logs; DELETE FROM plants;`);
}
