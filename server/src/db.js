import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { DEFAULT_PASSWORD_HASH } from './security.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedsPath = path.resolve(__dirname, '../../database/seeds.json');
export const dataPath = path.resolve(__dirname, '../../database/data.json');
export const sqlSchemaPath = path.resolve(__dirname, '../../database/schema.sql');

export let db = {
  departments: [],
  employees: [],
  attendance: [],
  leaveRequests: [],
  tasks: [],
  notifications: [],
};

export let isPgConnected = false;
let pgPool = null;

// Initialize in-memory and disk persistence
export function initLocalDb() {
  try {
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf-8');
      db = JSON.parse(raw);
    } else {
      const raw = fs.readFileSync(seedsPath, 'utf-8');
      db = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[DB] Failed reading disk state, using fallback:', e);
    const raw = fs.readFileSync(seedsPath, 'utf-8');
    db = JSON.parse(raw);
  }

  if (!db.notifications) db.notifications = [];

  // Ensure all employees have a valid bcrypt passwordHash
  db.employees.forEach((emp) => {
    if (!emp.passwordHash) {
      emp.passwordHash = DEFAULT_PASSWORD_HASH;
    }
  });

  saveLocalDb();
}

// Atomically save memory state to database/data.json
export function saveLocalDb() {
  try {
    const tmpPath = `${dataPath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tmpPath, dataPath);
  } catch (err) {
    console.error('[DB] Error writing data.json to disk:', err);
  }
}

// Attempt PostgreSQL connection if DATABASE_URL is provided
export async function initPostgres() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('[PostgreSQL] No DATABASE_URL set. Running in High-Speed Disk/JSON Engine Mode.');
    return false;
  }

  try {
    pgPool = new Pool({
      connectionString,
      connectionTimeoutMillis: 3000,
    });

    const client = await pgPool.connect();
    console.log('✅ [PostgreSQL] Connected successfully to database:', connectionString.split('@')[1] || 'PostgreSQL');
    isPgConnected = true;

    // Check if tables exist, or run schema.sql
    try {
      const checkRes = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'employees'
        );
      `);

      if (!checkRes.rows[0].exists && fs.existsSync(sqlSchemaPath)) {
        console.log('[PostgreSQL] Initializing tables from database/schema.sql...');
        const ddl = fs.readFileSync(sqlSchemaPath, 'utf-8');
        await client.query(ddl);
        console.log('✅ [PostgreSQL] Schema created successfully.');
      }
    } catch (schemaErr) {
      console.warn('[PostgreSQL] Schema auto-creation note:', schemaErr.message);
    } finally {
      client.release();
    }

    return true;
  } catch (err) {
    console.warn('⚠️ [PostgreSQL] Connection failed (' + err.message + '). Auto-fallback to local JSON engine.');
    isPgConnected = false;
    return false;
  }
}

export function getPgPool() {
  return pgPool;
}
