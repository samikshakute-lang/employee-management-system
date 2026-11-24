import type { AuthUser } from './auth';

declare global {
  namespace Express {
    interface Request {
      /** Set by the requireAuth middleware once the bearer token has been verified. */
      user?: AuthUser;
    }
  }
}

export {};
