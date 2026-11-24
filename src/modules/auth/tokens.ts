import { TokenExpiredError, sign, verify, type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { ROLES, type Role } from '../../db/schema';

/**
 * Claims carried by an access token. The role claim is informational only:
 * requireAuth re-reads the role from the users row so a demotion or promotion
 * takes effect on tokens that were already issued.
 */
export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: Role;
};

/** Raised when a token cannot be trusted: bad signature, malformed or expired. */
export class TokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenError';
  }
}

// jwt.sign's expiresIn only accepts seconds or a duration string literal, while
// env.JWT_EXPIRES_IN is a plain string (validated at boot), so narrow it here.
const EXPIRES_IN = env.JWT_EXPIRES_IN as SignOptions['expiresIn'];

export function signAccessToken(payload: AccessTokenPayload): string {
  return sign({ sub: payload.sub, email: payload.email, role: payload.role }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  let decoded: JwtPayload | string;

  try {
    decoded = verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new TokenError('Access token has expired');
    }
    throw new TokenError('Access token is invalid');
  }

  if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
    throw new TokenError('Access token is missing a subject');
  }

  const { email, role } = decoded as JwtPayload & { email?: unknown; role?: unknown };

  if (typeof email !== 'string' || typeof role !== 'string' || !ROLES.includes(role as Role)) {
    throw new TokenError('Access token payload is invalid');
  }

  return { sub: decoded.sub, email, role: role as Role };
}
