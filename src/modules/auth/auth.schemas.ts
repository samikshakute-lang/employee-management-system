import { z } from 'zod';
import { ROLES } from '../../db/schema';

/**
 * Body of POST /api/v1/auth/register (Admin only).
 * `role` is optional so the common case (provisioning an Employee) needs no role field.
 */
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(ROLES).optional(),
});

/** Body of POST /api/v1/auth/login. */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
