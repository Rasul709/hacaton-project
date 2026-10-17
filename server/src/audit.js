import crypto from 'crypto';
import { db, saveLocalDb } from './db.js';

let lastBlockHash = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Initializes audit log store in db if missing
 */
function ensureAuditStore() {
  if (!db.auditLogs) {
    db.auditLogs = [];
  }
  if (db.auditLogs.length > 0) {
    const last = db.auditLogs[db.auditLogs.length - 1];
    if (last && last.hash) {
      lastBlockHash = last.hash;
    }
  }
}

/**
 * Log a high-fidelity security or personal data access event.
 * Compliant with RK Law No. 94-V (Personal Data and Protection).
 */
export function logAuditEvent({
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
  ensureAuditStore();

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

  const entry = {
    id,
    timestamp,
    userId,
    userEmail,
    userRole,
    action,
    resource,
    ipAddress,
    userAgent,
    status,
    details,
    prevHash: lastBlockHash,
    hash,
  };

  db.auditLogs.push(entry);

  // Keep last 5000 audit records in local persistence
  if (db.auditLogs.length > 5000) {
    db.auditLogs.shift();
  }

  saveLocalDb();
  return entry;
}

/**
 * Retrieve audit logs with optional filters
 */
export function getAuditLogs({ limit = 100, action, userId, status } = {}) {
  ensureAuditStore();
  let logs = [...db.auditLogs];

  if (action) {
    logs = logs.filter((l) => l.action === action);
  }
  if (userId) {
    logs = logs.filter((l) => l.userId === userId || l.userEmail === userId);
  }
  if (status) {
    logs = logs.filter((l) => l.status === status);
  }

  // Return newest first
  return logs.reverse().slice(0, limit);
}

/**
 * Verify cryptographic hash integrity of the audit trail
 */
export function verifyAuditChainIntegrity() {
  ensureAuditStore();
  if (db.auditLogs.length === 0) return { valid: true, count: 0 };

  let prev = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 0; i < db.auditLogs.length; i++) {
    const entry = db.auditLogs[i];
    const payloadToHash = JSON.stringify({
      prevHash: prev,
      id: entry.id,
      timestamp: entry.timestamp,
      userId: entry.userId,
      userEmail: entry.userEmail,
      userRole: entry.userRole,
      action: entry.action,
      resource: entry.resource,
      ipAddress: entry.ipAddress,
      status: entry.status,
      details: entry.details,
    });
    const calculatedHash = crypto.createHash('sha256').update(payloadToHash).digest('hex');
    if (calculatedHash !== entry.hash) {
      return {
        valid: false,
        compromisedIndex: i,
        compromisedEntryId: entry.id,
        expectedHash: calculatedHash,
        actualHash: entry.hash,
      };
    }
    prev = entry.hash;
  }

  return { valid: true, count: db.auditLogs.length };
}
