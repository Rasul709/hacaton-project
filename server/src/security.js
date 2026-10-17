import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const JWT_SECRET = process.env.JWT_SECRET || 'janapost-hackathon-2026-secret-key-almaty';
export const SALT_ROUNDS = 10;

// Warn if using default secret in non-development environment
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'janapost-hackathon-2026-secret-key-almaty') {
  console.warn('⚠️ [SECURITY CRITICAL] Server is running with default JWT_SECRET in production! Set JWT_SECRET in environment.');
}

// Pre-hashed default password for 'password123' to seed database employees
export const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', SALT_ROUNDS);

/**
 * Hash a plain password using bcrypt
 */
export function hashPassword(plainText) {
  if (!plainText || typeof plainText !== 'string') {
    throw new Error('Invalid password provided for hashing');
  }
  return bcrypt.hashSync(plainText, SALT_ROUNDS);
}

/**
 * Verify plain password strictly against bcrypt hash.
 * ZERO backdoors, zero permissive bypasses.
 */
export function verifyPassword(plainText, hash) {
  if (!plainText || !hash) return false;
  if (typeof plainText !== 'string' || typeof hash !== 'string') return false;
  try {
    return bcrypt.compareSync(plainText, hash);
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// Token Revocation & Blacklist Registry
// ----------------------------------------------------
const tokenBlacklist = new Set();

/**
 * Revoke a token so it cannot be used again
 */
export function revokeToken(token) {
  if (!token) return;
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.jti) {
      tokenBlacklist.add(decoded.jti);
    } else {
      // Fallback: hash the raw token string
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      tokenBlacklist.add(tokenHash);
    }
  } catch {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    tokenBlacklist.add(tokenHash);
  }
}

/**
 * Check if a token has been revoked
 */
export function isTokenRevoked(token) {
  if (!token) return true;
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.jti && tokenBlacklist.has(decoded.jti)) {
      return true;
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    return tokenBlacklist.has(tokenHash);
  } catch {
    return true;
  }
}

/**
 * Sign standard JWT payload with unique JTI and 7 days expiration
 */
export function signJwt(payload) {
  const jti = crypto.randomUUID();
  return jwt.sign({ ...payload, jti }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
}

/**
 * Verify and decode JWT token with strict signature & algorithm checking.
 * Rejects revoked tokens, rejects unauthenticated mock tokens.
 */
export function verifyJwt(token) {
  if (!token || typeof token !== 'string') return null;

  // 1. Check revocation registry
  if (isTokenRevoked(token)) {
    return null;
  }

  // 2. Strict cryptographic verification (only HS256)
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    return decoded;
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// Account Lockout & Brute-Force Defense Registry
// ----------------------------------------------------
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes lockout

// Map of identifier (email or IP) -> { failedAttempts: number, lockedUntil: number | null }
const loginTracker = new Map();

/**
 * Check if an account or IP is currently locked out
 */
export function isAccountLocked(identifier) {
  if (!identifier) return { locked: false, remainingMs: 0 };
  const key = identifier.toLowerCase().trim();
  const state = loginTracker.get(key);
  if (!state || !state.lockedUntil) {
    return { locked: false, remainingMs: 0 };
  }

  const now = Date.now();
  if (now >= state.lockedUntil) {
    // Lockout expired, reset counter
    loginTracker.delete(key);
    return { locked: false, remainingMs: 0 };
  }

  return {
    locked: true,
    remainingMs: state.lockedUntil - now,
    remainingMinutes: Math.ceil((state.lockedUntil - now) / 60000),
  };
}

/**
 * Record a failed login attempt and trigger lockout if limit reached
 */
export function recordFailedLogin(identifier) {
  if (!identifier) return;
  const key = identifier.toLowerCase().trim();
  const now = Date.now();
  const state = loginTracker.get(key) || { failedAttempts: 0, lockedUntil: null };

  state.failedAttempts += 1;

  if (state.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    state.lockedUntil = now + LOCKOUT_WINDOW_MS;
  }

  loginTracker.set(key, state);
  return {
    failedAttempts: state.failedAttempts,
    isLocked: state.failedAttempts >= MAX_FAILED_ATTEMPTS,
  };
}

/**
 * Record a successful login and clear failed attempts counter
 */
export function recordSuccessfulLogin(identifier) {
  if (!identifier) return;
  const key = identifier.toLowerCase().trim();
  loginTracker.delete(key);
}
