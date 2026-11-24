import { compare, hash } from 'bcryptjs';
import { env } from '../../config/env';

/**
 * Hashes a plaintext password with bcryptjs. The cost factor comes from
 * BCRYPT_ROUNDS so the test suite can drop to 4 and stay fast.
 */
export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, env.BCRYPT_ROUNDS);
}

/**
 * Compares a plaintext password against a stored bcrypt hash.
 * Returns false (rather than throwing) when the stored hash is malformed, so a
 * corrupted row can never turn a login attempt into a 500.
 */
export async function verifyPassword(plain: string, passwordHash: string): Promise<boolean> {
  try {
    return await compare(plain, passwordHash);
  } catch {
    return false;
  }
}
