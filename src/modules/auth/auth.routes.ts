import { Router, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import type { ZodError } from 'zod';
import { HttpError } from '../../middleware/error-handler';
import { requireAuth } from '../../middleware/require-auth';
import { requireRole } from '../../middleware/require-role';
import { loginSchema, registerSchema } from './auth.schemas';
import { authenticate, registerUser } from './auth.service';

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

export const authRouter = Router();

/**
 * User provisioning. Admin-only: this is an employee system, not a public sign-up,
 * and the first Admin is created by `npm run seed`.
 */
authRouter.post(
  '/register',
  requireAuth,
  requireRole('Admin'),
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      throw validationError(parsed.error);
    }

    const user = await registerUser(parsed.data);

    res.status(201).json(user);
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      throw validationError(parsed.error);
    }

    const result = await authenticate(parsed.data);

    res.status(200).json(result);
  }),
);

/** Restores session state for a client after a reload: the caller's id, email and role. */
authRouter.get('/me', requireAuth, (req, res) => {
  res.status(200).json(req.user);
});
