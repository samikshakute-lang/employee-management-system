import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users, type PublicUser, type Role } from '../../db/schema';
import { HttpError } from '../../middleware/error-handler';
import { toPublicUser } from '../auth/auth.service';

/**
 * Assigns a role to an existing user and returns the updated row as a PublicUser.
 *
 * Because requireAuth reads the role from the users row on every request, the
 * change applies immediately to tokens that were already issued.
 * Throws 404 NOT_FOUND when no user matches the given id.
 */
export async function setUserRole(userId: string, role: Role): Promise<PublicUser> {
  const [updated] = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) {
    throw new HttpError(404, 'NOT_FOUND', `No user found with id ${userId}`);
  }

  return toPublicUser(updated);
}
