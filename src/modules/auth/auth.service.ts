import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users, type PublicUser, type User } from '../../db/schema';
import { HttpError } from '../../middleware/error-handler';
import { hashPassword, verifyPassword } from './password';
import { signAccessToken } from './tokens';
import type { LoginInput, RegisterInput } from './auth.schemas';

/** Drops the password hash so a user row can safely be serialised into a response. */
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

/**
 * Creates a user. This is the Admin-only provisioning path, so it is not public
 * sign-up; the first Admin comes from `npm run seed`.
 * `role` defaults to 'Employee' and a duplicate email is a 409 EMAIL_TAKEN.
 */
export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existing.length > 0) {
    throw new HttpError(409, 'EMAIL_TAKEN', `A user with email ${input.email} already exists`);
  }

  const passwordHash = await hashPassword(input.password);

  const [created] = await db
    .insert(users)
    .values({
      email: input.email,
      passwordHash,
      role: input.role ?? 'Employee',
    })
    .returning();

  if (!created) {
    throw new HttpError(500, 'INTERNAL_ERROR', 'Failed to create user');
  }

  return toPublicUser(created);
}

/**
 * Verifies credentials and issues an access token.
 * An unknown email and a wrong password produce the identical 401 INVALID_CREDENTIALS
 * body so the endpoint does not disclose which emails exist.
 */
export async function authenticate(
  input: LoginInput,
): Promise<{ token: string; user: PublicUser }> {
  const rows = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  const user = rows[0];

  const invalidCredentials = (): HttpError =>
    new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

  if (!user) {
    throw invalidCredentials();
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw invalidCredentials();
  }

  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });

  return { token, user: toPublicUser(user) };
}

/** Reads a single user as a PublicUser, or null when no row matches. */
export async function getUserById(id: string): Promise<PublicUser | null> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  const user = rows[0];

  return user ? toPublicUser(user) : null;
}
