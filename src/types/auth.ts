import type { Role } from '../db/schema';

/** The authenticated caller attached to the request by the requireAuth middleware. */
export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};
