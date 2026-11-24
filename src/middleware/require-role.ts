import type { RequestHandler } from 'express';
import type { Role } from '../db/schema';
import { HttpError } from './error-handler';

/**
 * Guards a route with one of the given roles. Must run after requireAuth.
 * Answers 401 UNAUTHENTICATED when nothing has authenticated the caller and
 * 403 FORBIDDEN (without calling the route handler) when the role is not allowed.
 */
export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new HttpError(401, 'UNAUTHENTICATED', 'Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new HttpError(
          403,
          'FORBIDDEN',
          `This action requires one of the following roles: ${roles.join(', ')}`,
        ),
      );
      return;
    }

    next();
  };
}
