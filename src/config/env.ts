import 'dotenv/config';
import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  SEED_ADMIN_EMAIL: z.string().email('SEED_ADMIN_EMAIL must be a valid email').optional(),
  SEED_ADMIN_PASSWORD: z
    .string()
    .min(8, 'SEED_ADMIN_PASSWORD must be at least 8 characters')
    .optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues
        .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join('; ');
      throw new Error(`Invalid environment configuration -> ${details}`);
    }
    throw error;
  }
})();
