import type { RequestHandler } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { HttpError } from './error-handler';
import { TokenError, verifyAccessToken, type AccessTokenPayload } from '../modules/auth/tokens';

function unauthenticated(message: string): HttpError {
  return new HttpError(401, 'UNAUTHENTICATED', message);
}

/** Pulls the token out of `Authorization: Bearer <token>`, or null when it is absent/malformed. */
function extractBearerToken(header: string | undefined): string | null {
  if (!header) {
    return null;
  }

  const [scheme, token, ...rest] = header.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== 'bearer' || !token || rest.length > 0) {
    return null;
  }

  return token;
}

/**
 * Guards a route with a valid access token.
 *
 * The caller's id, email and role are read from the users row on every request
 * rather than trusted from the token claims, so a role change applies immediately
 * to tokens that were already issued. Answers 401 UNAUTHENTICATED for a missing or
 * malformed header, a bad signature, an expired token, or a subject that no longer
 * exists in the users table.
 */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    next(unauthenticated('Missing or malformed Authorization header'));
    return;
  }

  let payload: AccessTokenPayload;

  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    next(unauthenticated(error instanceof TokenError ? error.message : 'Access token is invalid'));
    return;
  }

  void db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1)
    .then((rows) => {
      const user = rows[0];

      if (!user) {
        next(unauthenticated('Access token subject no longer exists'));
        return;
      }

      req.user = user;
      next();
    })
    .catch(next);
};
