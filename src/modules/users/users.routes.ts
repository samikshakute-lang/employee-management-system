import { Router, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import type { ZodError } from 'zod';
import { HttpError } from '../../middleware/error-handler';
import { requireAuth } from '../../middleware/require-auth';
import { requireRole } from '../../middleware/require-role';
import { assignRoleSchema } from './users.schemas';
import { setUserRole } from './users.service';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/** Express 4 does not forward rejected promises, so async handlers are wrapped explicitly. */
function asyncHandler(handler: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

/** Maps a zod failure onto the shared 400 VALIDATION_ERROR envelope. */
function validationError(error: ZodError): HttpError {
  const message = error.issues.map((issue) => issue.message).join('; ');
  return new HttpError(400, 'VALIDATION_ERROR', message || 'Invalid request body');
}

export const usersRouter = Router();

/**
 * Role assignment. Admin-only: HR and Employee receive 403 FORBIDDEN.
 * An unknown id is a 404 NOT_FOUND; an unknown role value is a 400 VALIDATION_ERROR.
 */
usersRouter.patch(
  '/:id/role',
  requireAuth,
  requireRole('Admin'),
  asyncHandler(async (req, res) => {
    const parsed = assignRoleSchema.safeParse(req.body);

    if (!parsed.success) {
      throw validationError(parsed.error);
    }

    const user = await setUserRole(req.params.id, parsed.data.role);

    res.status(200).json(user);
  }),
);
