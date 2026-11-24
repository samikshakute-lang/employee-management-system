import { z } from 'zod';
import { ROLES } from '../../db/schema';

/**
 * Body of PATCH /api/v1/users/:id/role (Admin only).
 * The enum is built from ROLES, so 'Manager' or 'admin' is rejected as a 400
 * VALIDATION_ERROR and nothing is written.
 */
export const assignRoleSchema = z.object({
  role: z.enum(ROLES),
});

export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
