import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import SqliteClient from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { env } from '../config/env';
import * as schema from './schema';

/**
 * Opens the SQLite database named by DATABASE_URL. The parent directory is created
 * when missing so a bare checkout can run migrations without a manual `mkdir`.
 * `:memory:` is passed through untouched.
 */
function createClient(filename: string) {
  if (filename !== ':memory:') {
    mkdirSync(dirname(filename), { recursive: true });
  }
  return new SqliteClient(filename);
}

function createDb() {
  return drizzle(createClient(env.DATABASE_URL), { schema });
}

export const db = createDb();

export type Database = ReturnType<typeof createDb>;
