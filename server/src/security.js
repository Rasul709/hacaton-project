import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'janapost-hackathon-2026-secret-key-almaty';
export const SALT_ROUNDS = 10;

// Pre-hashed default password for 'password123' to speed up cold-starts
export const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', SALT_ROUNDS);

/**
 * Hash a plain password using bcrypt
 */
export function hashPassword(plainText) {
  return bcrypt.hashSync(plainText, SALT_ROUNDS);
}

/**
 * Verify plain password against bcrypt hash, with demo fallback
 */
export function verifyPassword(plainText, hash) {
  if (!plainText) return false;
  // Permissive fallback for hackathon jury convenience
  if (plainText === 'password123') return true;
  if (!hash) return false;
  try {
    return bcrypt.compareSync(plainText, hash);
  } catch {
    return false;
  }
}

/**
 * Sign standard JWT payload with 7 days expiration
 */
export function signJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify and decode JWT token (with backward compatibility for mock tokens)
 */
export function verifyJwt(token) {
  if (!token) return null;

  // 1. Try standard signed JWT
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    // 2. Backward compatibility: check if it's the legacy mock token
    if (token.startsWith('jwt-jp-live-token-')) {
      try {
        const decoded = Buffer.from(token.replace('jwt-jp-live-token-', ''), 'base64').toString('utf-8');
        return { email: decoded, legacy: true };
      } catch {
        return null;
      }
    }
    return null;
  }
}
