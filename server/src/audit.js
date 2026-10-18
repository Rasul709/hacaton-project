import crypto from 'crypto';
import { prisma } from './db.js';

let lastBlockHash = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Log a high-fidelity security or personal data access event.
 * Compliant with RK Law No. 94-V (Personal Data and Protection).
 */
export async function logAuditEvent({
  userId = 'anonymous',
  userEmail = 'anonymous',
  userRole = 'NONE',
  action,
  resource,
  ipAddress = '127.0.0.1',
  userAgent = 'Unknown',
  status = 'SUCCESS',
  details = {},
}) {
  const id = `audit-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const timestamp = new Date().toISOString();

  // Create immutable payload for cryptographic hash chaining
  const payloadToHash = JSON.stringify({
    prevHash: lastBlockHash,
    id,
    timestamp,
    userId,
    userEmail,
    userRole,
    action,
    resource,
    ipAddress,
    status,
    details,
  });

  const hash = crypto.createHash('sha256').update(payloadToHash).digest('hex');
  lastBlockHash = hash;

  try {
    const entry = await prisma.auditLog.create({
      data: {
        id,
        userId,
        userEmail,
        userRole,
        action,
        resource,
        ipAddress,
        status,
        details: JSON.stringify({ ...details, userAgent, prevHash: lastBlockHash, hash }),
      },
    });
    return entry;
  } catch (err) {
    console.error('[Audit] Failed to persist audit event:', err);
    return null;
  }
}

/**
 * Retrieve audit logs with optional filters
 */
export async function getAuditLogs({ limit = 100, action, userId, status } = {}) {
  const where = {};
  if (action) where.action = action;
  if (userId) {
    where.OR = [{ userId }, { userEmail: userId }];
  }
  if (status) where.status = status;

  return prisma.auditLog.findMany({
    where,
    take: limit,
    orderBy: { timestamp: 'desc' },
  });
}
