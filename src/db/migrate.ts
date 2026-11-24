import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db, type Database } from './index';

const MIGRATIONS_FOLDER = './drizzle';

/**
 * Applies every pending migration in ./drizzle to the given database.
 * Tests call this to prepare an in-memory database; `npm run db:migrate` runs it
 * against the database named by DATABASE_URL.
 */
export function runMigrations(database: Database): void {
  migrate(database, { migrationsFolder: MIGRATIONS_FOLDER });
}

if (require.main === module) {
  runMigrations(db);
  console.log('Migrations applied.');
}
