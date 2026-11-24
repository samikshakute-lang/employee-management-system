import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { env } from '../config/env';
import { db, type Database } from '../db';
import { users } from '../db/schema';

/**
 * Creates the very first Admin account from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
 *
 * Registration is Admin-only, so the first Admin cannot be created through the API —
 * this script is the bootstrap path. It is safe to run repeatedly: when a user with
 * the configured email already exists it does nothing.
 */
export async function seedAdmin(database: Database): Promise<void> {
  const email = env.SEED_ADMIN_EMAIL;
  const password = env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set to seed the first Admin',
    );
  }

  const existing = await database
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Seed skipped: a user with email ${email} already exists.`);
    return;
  }

  const passwordHash = await hash(password, env.BCRYPT_ROUNDS);

  await database.insert(users).values({ email, passwordHash, role: 'Admin' });

  console.log(`Seeded Admin user ${email}.`);
}

if (require.main === module) {
  seedAdmin(db)
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error('Failed to seed the first Admin:', error);
      process.exit(1);
    });
}
