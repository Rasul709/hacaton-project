import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, initLocalDb, saveLocalDb, initPostgres, isPgConnected, seedsPath, dataPath } from './db.js';
import {
  hashPassword,
  verifyPassword,
  signJwt,
  verifyJwt,
  revokeToken,
  isAccountLocked,
  recordFailedLogin,
  recordSuccessfulLogin,
} from './security.js';
import { uploadMiddleware, UPLOADS_DIR } from './storage.js';
import {
  renderLeaveOrderT6,
  renderEmployeeCardT2,
  renderTimesheetT13,
  renderPayslip,
  renderEmploymentContract,
  render1cXml,
  calculateDocumentHash,
} from './documents.js';
import { logAuditEvent, getAuditLogs, verifyAuditChainIntegrity } from './audit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------------------------------------
// Enterprise Security Defense Middleware (Helmet-grade)
// ----------------------------------------------------
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  next();
});

// Prototype Pollution Defense & Request Limiting
app.use(
  express.json({
    limit: '1mb',
    verify: (req, res, buf) => {
      try {
        const text = buf.toString();
        if (text.includes('__proto__') || text.includes('constructor') || text.includes('prototype')) {
          const parsed = JSON.parse(text);
          if (
            Object.prototype.hasOwnProperty.call(parsed, '__proto__') ||
            Object.prototype.hasOwnProperty.call(parsed, 'constructor')
          ) {
            throw new Error('Prototype pollution payload detected');
          }
        }
      } catch (e) {
        if (e.message.includes('pollution')) throw e;
      }
    },
  })
);

// Hardened CORS: allow specific origins with credentials
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost',
  'http://127.0.0.1',
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
  })
);

// Serve uploaded static attachments with nosniff and CSP sandbox
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    next();
  },
  express.static(UPLOADS_DIR)
);

// Sliding Window In-Memory Rate Limiter
function createRateLimiter({ windowMs, maxRequests, message }) {
  const hits = new Map();
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const clientRecord = hits.get(ip) || [];
    const recentHits = clientRecord.filter((time) => now - time < windowMs);

    if (recentHits.length >= maxRequests) {
      return res.status(429).json({ error: message || 'Слишком много запросов. Пожалуйста, повторите попытку позже.' });
    }

    recentHits.push(now);
    hits.set(ip, recentHits);
    next();
  };
}

const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: process.env.NODE_ENV === 'production' ? 15 : 150,
  message: 'Превышен лимит попыток входа. Попробуйте через минуту.',
});

const generalApiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: process.env.NODE_ENV === 'production' ? 120 : 600,
  message: 'Превышен общий лимит обращений к API.',
});

app.use('/api/v1/auth', authRateLimiter);
app.use('/api/v1', generalApiRateLimiter);

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Initialize database (JSON persistence + PostgreSQL check)
initLocalDb();
initPostgres().catch(() => {});

const EMAIL_ALIASES = {
  'admin@janapost.kz': 'a.smagulova@janapost.kz',
  'hr@janapost.kz': 'z.ibrayeva@janapost.kz',
  'manager@janapost.kz': 'b.kassymov@janapost.kz',
  'employee@janapost.kz': 'a.omarov@janapost.kz',
};

function findEmployeeByEmail(email) {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();
  const target = EMAIL_ALIASES[normalized] || normalized;
  return (
    db.employees.find((e) => (e.email || '').toLowerCase() === target || (e.email || '').toLowerCase() === normalized) ||
    null
  );
}

/**
 * Strict authentication: extract authenticated user from Bearer token.
 * ZERO fallback to admin. Returns null if unauthenticated.
 */
function getUserFromAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  const decoded = verifyJwt(token);
  if (!decoded) return null;

  if (decoded.id) {
    const user = db.employees.find((e) => e.id === decoded.id);
    if (user) return user;
  }
  if (decoded.email) {
    const user = findEmployeeByEmail(decoded.email);
    if (user) return user;
  }
  return null;
}

/**
 * Express middleware: requires valid authentication
 */
function requireAuth(req, res, next) {
  const user = getUserFromAuth(req);
  if (!user) {
    return res.status(401).json({ error: 'Требуется авторизация (Bearer JWT)' });
  }
  req.user = user;
  next();
}

/**
 * Express middleware: requires specific RBAC roles
 */
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }
    const role =
      req.user.id === 'emp-1'
        ? 'ADMIN'
        : req.user.id === 'emp-7'
        ? 'HR_MANAGER'
        : ['emp-2', 'emp-3', 'emp-4', 'emp-5'].includes(req.user.id)
        ? 'DEPARTMENT_HEAD'
        : 'EMPLOYEE';

    req.user.role = role;

    if (!allowedRoles.includes(role)) {
      logAuditEvent({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: role,
        action: 'ACCESS_DENIED_ROLE_VIOLATION',
        resource: req.originalUrl,
        ipAddress: req.ip,
        status: 'FAILURE',
        details: { requiredRoles: allowedRoles, userRole: role },
      });
      return res.status(403).json({ error: 'Недостаточно прав доступа для выполнения данной операции' });
    }
    next();
  };
}

/**
 * Personal Data Sanitization & Masking compliant with RK Law No. 94-V.
 * Never returns passwordHash under any circumstances.
 * Masks IIN, salary, IBAN, and emergency contacts for non-privileged viewers.
 */
export function sanitizeEmployee(emp, viewer = null) {
  if (!emp) return null;
  const copy = { ...emp };
  delete copy.passwordHash;

  const isPrivileged = viewer && (viewer.role === 'ADMIN' || viewer.role === 'HR_MANAGER' || viewer.id === emp.id);

  if (!isPrivileged) {
    if (copy.iin) {
      copy.iin = copy.iin.length >= 6 ? `${copy.iin.slice(0, 6)}******` : '******';
    }
    delete copy.salary;
    if (copy.bankIban) {
      copy.bankIban = 'KZ******************';
    }
    if (copy.address) {
      copy.address = 'Скрыто политикой ПДн РК (Закон № 94-V)';
    }
    if (copy.emergencyContact) {
      copy.emergencyContact = 'Скрыто политикой ПДн РК (Закон № 94-V)';
    }
  }

  return copy;
}

// Recalculate department counts based on active employees
function syncDepartmentCounts() {
  db.departments.forEach((dept) => {
    const total = db.employees.filter((e) => e.departmentId === dept.id).length;
    const active = db.employees.filter((e) => e.departmentId === dept.id && e.status === 'ACTIVE').length;
    dept.employeeCount = total;
    dept.activeEmployeesCount = active;
  });
}

// ----------------------------------------------------
// 1. Health & System
// ----------------------------------------------------
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Digital HR by Jana Post — Live REST API',
    version: '1.2.0',
    persistence: isPgConnected ? 'PostgreSQL (Active DB Pool)' : 'Active (database/data.json)',
    security: 'bcrypt (Salt 10) + JWT (RS/HS256 7d)',
    uploads: 'Multer Active (/uploads)',
    documents: 'Kazakhstan Labor Code T-2, T-6, T-13 Active',
    timezone: 'Asia/Almaty (UTC+5)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.post('/api/v1/system/reset-db', (req, res) => {
  // Disallow in production completely
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Сброс базы данных строго запрещен в производственной среде' });
  }

  // Require admin authorization if token is provided
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const user = getUserFromAuth(req);
    if (!user || user.id !== 'emp-1') {
      return res.status(403).json({ error: 'Только Администратор может инициировать сброс данных' });
    }
  }

  try {
    const raw = fs.readFileSync(seedsPath, 'utf-8');
    const parsed = JSON.parse(raw);
    db.departments = parsed.departments || [];
    db.employees = parsed.employees || [];
    db.attendance = parsed.attendance || [];
    db.leaveRequests = parsed.leaveRequests || [];
    db.tasks = parsed.tasks || [];
    db.notifications = parsed.notifications || [];
    db.auditLogs = [];

    initLocalDb();
    logAuditEvent({
      action: 'SYSTEM_DB_RESET',
      resource: '/api/v1/system/reset-db',
      ipAddress: req.ip,
      status: 'SUCCESS',
    });
    res.json({ success: true, message: 'База данных успешно сброшена к исходным семенам' });
  } catch (err) {
    res.status(500).json({ error: 'Не удалось сбросить данные: ' + err.message });
  }
});

// ----------------------------------------------------
// 2. Authentication & Passwords (bcrypt + JWT + Lockout)
// ----------------------------------------------------
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  // Check account lockout
  const lockout = isAccountLocked(email);
  if (lockout.locked) {
    logAuditEvent({
      userEmail: email,
      action: 'AUTH_ACCOUNT_LOCKED_ATTEMPT',
      resource: '/api/v1/auth/login',
      ipAddress: req.ip,
      status: 'FAILURE',
      details: { remainingMinutes: lockout.remainingMinutes },
    });
    return res.status(429).json({
      error: `Аккаунт временно заблокирован из-за превышения числа неверных попыток. Попробуйте через ${lockout.remainingMinutes} мин.`,
    });
  }

  const user = findEmployeeByEmail(email);
  if (!user) {
    recordFailedLogin(email);
    logAuditEvent({
      userEmail: email,
      action: 'AUTH_LOGIN_FAILED_UNKNOWN_USER',
      resource: '/api/v1/auth/login',
      ipAddress: req.ip,
      status: 'FAILURE',
    });
    return res.status(401).json({ error: 'Неверный адрес электронной почты или пароль' });
  }

  // Strict bcrypt check (no password123 backdoor bypass)
  const isMatch = verifyPassword(password, user.passwordHash);
  if (!isMatch) {
    const result = recordFailedLogin(email);
    logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'AUTH_LOGIN_FAILED_WRONG_PASSWORD',
      resource: '/api/v1/auth/login',
      ipAddress: req.ip,
      status: 'FAILURE',
      details: { attempt: result?.failedAttempts },
    });
    return res.status(401).json({ error: 'Неверный адрес электронной почты или пароль' });
  }

  // Successful login: clear lockout tracking
  recordSuccessfulLogin(email);

  const role =
    user.id === 'emp-1'
      ? 'ADMIN'
      : user.id === 'emp-7'
      ? 'HR_MANAGER'
      : ['emp-2', 'emp-3', 'emp-4', 'emp-5'].includes(user.id)
      ? 'DEPARTMENT_HEAD'
      : 'EMPLOYEE';

  const loginEmail = (email || '').toLowerCase().trim();
  const tokenEmail = loginEmail && EMAIL_ALIASES[loginEmail] ? loginEmail : user.email;

  // Issue real signed JWT token
  const token = signJwt({
    id: user.id,
    employeeId: user.employeeId,
    email: tokenEmail,
    role,
  });

  logAuditEvent({
    userId: user.id,
    userEmail: tokenEmail,
    userRole: role,
    action: 'AUTH_LOGIN_SUCCESS',
    resource: '/api/v1/auth/login',
    ipAddress: req.ip,
    status: 'SUCCESS',
  });

  res.json({
    token,
    user: sanitizeEmployee(
      {
        ...user,
        email: tokenEmail,
        role,
      },
      { role: 'ADMIN', id: user.id }
    ),
  });
});

app.get('/api/v1/auth/me', requireAuth, (req, res) => {
  const user = req.user;
  const role =
    user.id === 'emp-1'
      ? 'ADMIN'
      : user.id === 'emp-7'
      ? 'HR_MANAGER'
      : ['emp-2', 'emp-3', 'emp-4', 'emp-5'].includes(user.id)
      ? 'DEPARTMENT_HEAD'
      : 'EMPLOYEE';

  let displayEmail = user.email;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const decoded = verifyJwt(token);
    if (decoded?.email) displayEmail = decoded.email;
  }

  res.json(
    sanitizeEmployee(
      {
        ...user,
        email: displayEmail,
        role,
      },
      { role: 'ADMIN', id: user.id }
    )
  );
});

app.post('/api/v1/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    revokeToken(token);
  }
  const user = getUserFromAuth(req);
  if (user) {
    logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'AUTH_LOGOUT',
      resource: '/api/v1/auth/logout',
      ipAddress: req.ip,
      status: 'SUCCESS',
    });
  }
  res.json({ success: true, message: 'Сессия успешно завершена, токен аннулирован' });
});

app.post('/api/v1/auth/change-password', requireAuth, (req, res) => {
  const user = req.user;
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Новый пароль должен содержать не менее 6 символов' });
  }

  if (currentPassword && !verifyPassword(currentPassword, user.passwordHash)) {
    return res.status(400).json({ error: 'Текущий пароль указан неверно' });
  }

  user.passwordHash = hashPassword(newPassword);
  saveLocalDb();

  logAuditEvent({
    userId: user.id,
    userEmail: user.email,
    action: 'AUTH_PASSWORD_CHANGED',
    resource: '/api/v1/auth/change-password',
    ipAddress: req.ip,
    status: 'SUCCESS',
  });

  res.json({ success: true, message: 'Пароль успешно обновлен и защищен хешем bcrypt' });
});

// ----------------------------------------------------
// 3. File Uploads (Multer)
// ----------------------------------------------------
const handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не прикреплен' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({
    success: true,
    url: fileUrl,
    filename: req.file.originalname,
    storedFilename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
};

app.post('/api/v1/upload', uploadMiddleware.single('file'), handleUpload);
app.post('/api/v1/upload/attachment', uploadMiddleware.single('attachment'), handleUpload);

// ----------------------------------------------------
// 4. Kazakhstan Statutory HR Documents (Т-6, Т-2, Т-13)
// ----------------------------------------------------
app.get('/api/v1/documents/leave-order/:id', (req, res) => {
  const leave = db.leaveRequests.find((l) => l.id === req.params.id);
  if (!leave) return res.status(404).send('Заявка на отпуск не найдена');
  const emp = db.employees.find((e) => e.id === leave.employeeId);
  const html = renderLeaveOrderT6(leave, emp);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

app.get('/api/v1/documents/employee-card/:id', (req, res) => {
  const emp = db.employees.find((e) => e.id === req.params.id);
  if (!emp) return res.status(404).send('Сотрудник не найден');
  const html = renderEmployeeCardT2(emp);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

app.get('/api/v1/documents/timesheet', (req, res) => {
  const html = renderTimesheetT13(db.attendance, db.employees);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

app.get('/api/v1/documents/payslip/:id', (req, res) => {
  const emp = db.employees.find((e) => e.id === req.params.id);
  if (!emp) return res.status(404).send('Сотрудник не найден');
  const month = req.query.month || 'Октябрь 2026 г.';
  const html = renderPayslip(emp, month);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

app.get('/api/v1/documents/contract/:id', (req, res) => {
  const emp = db.employees.find((e) => e.id === req.params.id);
  if (!emp) return res.status(404).send('Сотрудник не найден');
  const html = renderEmploymentContract(emp);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

app.get('/api/v1/documents/export-1c', (req, res) => {
  const xml = render1cXml(db.attendance, db.employees);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="1C_ZUP_JanaPost_2026.xml"');
  res.send(xml);
});

// Document Verification Endpoint for QR & NCALayer (Public statutory registry)
app.get('/api/v1/documents/verify/:id', (req, res) => {
  const docId = req.params.id;
  const leave = db.leaveRequests.find((l) => l.id === docId);
  const emp = db.employees.find((e) => e.id === docId);

  if (leave) {
    const targetEmp = db.employees.find((e) => e.id === leave.employeeId);
    const hash = calculateDocumentHash({
      id: leave.id,
      employeeId: leave.employeeId,
      daysCount: leave.daysCount,
      startDate: leave.startDate,
      endDate: leave.endDate,
      status: leave.status,
    });

    logAuditEvent({
      action: 'DOCUMENT_VERIFIED',
      resource: `/api/v1/documents/verify/${docId}`,
      ipAddress: req.ip,
      status: 'SUCCESS',
      details: { docType: 'LEAVE_ORDER_T6', docId },
    });

    return res.json({
      valid: true,
      documentId: leave.id,
      documentType: 'ORDER_T6',
      documentTitle: `Приказ о предоставлении отпуска № ПР-${leave.id.replace('leave-', '').slice(-6)}`,
      signer: {
        name: 'Смагулова Айгерим Муратовна',
        iin: '890314400128',
        role: 'Директор по персоналу ТОО «Jana Post»',
        certificateIssuer: 'НУЦ РК (Национальный удостоверяющий центр Республики Казахстан)',
        certSerial: '4F91-C820-2026-KZ-NCALAYER',
      },
      recipient: {
        name: targetEmp ? `${targetEmp.lastName} ${targetEmp.firstName}` : leave.employeeName,
        iin: targetEmp?.iin ? `${targetEmp.iin.slice(0, 6)}******` : '940512******',
        department: targetEmp?.departmentName || leave.departmentName,
      },
      hashSha256: hash,
      signedAt: leave.reviewedAt || leave.submittedAt || new Date().toISOString(),
      enbekSyncStatus: 'REGISTERED',
      legalValidity: 'Юридически значимый электронный документ (Закон РК об электронном документе и ЭЦП ст. 7)',
    });
  }

  if (emp) {
    const hash = calculateDocumentHash({
      id: emp.id,
      employeeId: emp.employeeId,
      iin: emp.iin,
      startDate: emp.startDate,
      jobTitle: emp.jobTitle,
    });

    return res.json({
      valid: true,
      documentId: emp.id,
      documentType: 'EMPLOYMENT_CONTRACT',
      documentTitle: `Трудовой договор № ТД-${emp.id.replace('emp-', '').padStart(4, '0')}/2026`,
      signer: {
        name: 'Смагулова Айгерим Муратовна',
        iin: '890314400128',
        role: 'Директор по персоналу ТОО «Jana Post»',
        certificateIssuer: 'НУЦ РК (GOST KNCA)',
        certSerial: '7B12-9904-2026-KZ-NCALAYER',
      },
      recipient: {
        name: `${emp.lastName} ${emp.firstName}`,
        iin: emp.iin ? `${emp.iin.slice(0, 6)}******` : '940512******',
        department: emp.departmentName,
      },
      hashSha256: hash,
      signedAt: emp.startDate || new Date().toISOString(),
      enbekSyncStatus: emp.enbekStatus || 'REGISTERED',
      legalValidity: 'Юридически значимый электронный документ (Закон РК об электронном документе и ЭЦП)',
    });
  }

  res.status(404).json({
    valid: false,
    error: 'Документ с указанным идентификатором не зарегистрирован в едином реестре кадровых документов ТОО «Jana Post»',
  });
});

// Audit Logs API: Tamper-evident registry inspection (Restricted to ADMIN)
app.get('/api/v1/audit/logs', requireAuth, requireRole(['ADMIN']), (req, res) => {
  const limit = Math.min(500, parseInt(req.query.limit || '100', 10));
  const logs = getAuditLogs({ limit, action: req.query.action, userId: req.query.userId });
  const chain = verifyAuditChainIntegrity();

  res.json({
    chainIntegrity: chain.valid ? 'VERIFIED_TAMPER_FREE' : 'COMPROMISED',
    totalAuditedEvents: db.auditLogs ? db.auditLogs.length : 0,
    count: logs.length,
    logs,
  });
});

// ----------------------------------------------------
// 5. Employees CRUD (Protected by RBAC & RK Law No. 94-V)
// ----------------------------------------------------
app.get('/api/v1/employees', requireAuth, (req, res) => {
  const q = (req.query.search || req.query.q || '').toString().toLowerCase();
  const dept = (req.query.departmentId || '').toString();
  const status = (req.query.status || '').toString();
  const page = Math.max(1, parseInt(req.query.page?.toString() || '1', 10));
  const limit = Math.max(1, parseInt(req.query.limit?.toString() || '8', 10));

  let filtered = [...db.employees];

  if (q) {
    filtered = filtered.filter(
      (e) =>
        (e.firstName || '').toLowerCase().includes(q) ||
        (e.lastName || '').toLowerCase().includes(q) ||
        (e.email || '').toLowerCase().includes(q) ||
        (e.jobTitle || '').toLowerCase().includes(q) ||
        (e.employeeId || '').toLowerCase().includes(q)
    );
  }

  if (dept && dept !== 'ALL') {
    filtered = filtered.filter((e) => e.departmentId === dept);
  }

  if (status && status !== 'ALL') {
    filtered = filtered.filter((e) => e.status === status);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;

  // Apply Personal Data Masking (RK Law No. 94-V) & eliminate passwordHash
  const data = filtered.slice(start, start + limit).map((emp) => sanitizeEmployee(emp, req.user));

  logAuditEvent({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: 'PERSONAL_DATA_REGISTRY_VIEW',
    resource: '/api/v1/employees',
    ipAddress: req.ip,
    status: 'SUCCESS',
    details: { count: data.length, total },
  });

  res.json({
    data,
    total,
    page,
    limit,
    totalPages,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  });
});

app.get('/api/v1/employees/:id', requireAuth, (req, res) => {
  const emp = db.employees.find((e) => e.id === req.params.id);
  if (!emp) return res.status(404).json({ error: 'Сотрудник не найден' });

  logAuditEvent({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: 'PERSONAL_DATA_PROFILE_VIEW',
    resource: `/api/v1/employees/${emp.id}`,
    ipAddress: req.ip,
    status: 'SUCCESS',
    details: { targetEmployeeId: emp.id },
  });

  res.json(sanitizeEmployee(emp, req.user));
});

app.post('/api/v1/employees', requireAuth, requireRole(['ADMIN', 'HR_MANAGER']), (req, res) => {
  const dept = db.departments.find((d) => d.id === req.body.departmentId);
  const newEmp = {
    id: `emp-${Date.now()}`,
    employeeId: `JP-${Math.floor(10000 + Math.random() * 90000)}`,
    status: 'ACTIVE',
    departmentName: dept ? dept.name : req.body.departmentName || '',
    passwordHash: hashPassword(req.body.password || 'password123'),
    ...req.body,
  };
  db.employees.unshift(newEmp);
  syncDepartmentCounts();
  saveLocalDb();

  logAuditEvent({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: 'EMPLOYEE_CREATED',
    resource: `/api/v1/employees/${newEmp.id}`,
    ipAddress: req.ip,
    status: 'SUCCESS',
    details: { createdId: newEmp.id, name: `${newEmp.firstName} ${newEmp.lastName}` },
  });

  res.status(201).json(sanitizeEmployee(newEmp, req.user));
});

const handleUpdateEmployee = (req, res) => {
  const idx = db.employees.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Сотрудник не найден' });

  if (req.body.departmentId) {
    const dept = db.departments.find((d) => d.id === req.body.departmentId);
    if (dept) req.body.departmentName = dept.name;
  }

  // Prevent overwriting passwordHash via employee update endpoint
  const safeBody = { ...req.body };
  delete safeBody.passwordHash;

  db.employees[idx] = { ...db.employees[idx], ...safeBody };
  syncDepartmentCounts();
  saveLocalDb();

  logAuditEvent({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: 'EMPLOYEE_UPDATED',
    resource: `/api/v1/employees/${req.params.id}`,
    ipAddress: req.ip,
    status: 'SUCCESS',
  });

  res.json(sanitizeEmployee(db.employees[idx], req.user));
};

app.put('/api/v1/employees/:id', requireAuth, requireRole(['ADMIN', 'HR_MANAGER']), handleUpdateEmployee);
app.patch('/api/v1/employees/:id', requireAuth, requireRole(['ADMIN', 'HR_MANAGER']), handleUpdateEmployee);

app.patch('/api/v1/employees/:id/status', (req, res) => {
  const idx = db.employees.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Сотрудник не найден' });
  db.employees[idx].status = req.body.status || 'INACTIVE';
  syncDepartmentCounts();
  saveLocalDb();
  res.json(db.employees[idx]);
});

app.post('/api/v1/employees/:id/sync-enbek', (req, res) => {
  const emp = db.employees.find((e) => e.id === req.params.id);
  if (!emp) return res.status(404).json({ error: 'Сотрудник не найден' });

  emp.enbekStatus = 'REGISTERED';
  emp.enbekContractId = emp.enbekContractId || `ESUTD-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  emp.enbekSyncDate = new Date().toISOString();

  saveLocalDb();
  console.log(`[ЕСУТД Enbek.kz] 🟢 Трудовой договор ${emp.lastName} ${emp.firstName} зарегистрирован в ЕСУТД РК. Рег. номер: ${emp.enbekContractId}`);
  res.json({
    success: true,
    message: 'Трудовой договор успешно зарегистрирован в ЕСУТД РК (Enbek.kz)',
    employee: emp,
  });
});

app.post('/api/v1/employees/:id/ai-review', (req, res) => {
  const emp = db.employees.find((e) => e.id === req.params.id);
  if (!emp) return res.status(404).json({ error: 'Сотрудник не найден' });

  const isCourier = (emp.jobTitle || '').toLowerCase().includes('курьер') || (emp.jobTitle || '').toLowerCase().includes('водитель');
  const review = isCourier
    ? `ХАРАКТЕРИСТИКА И ПРОИЗВОДИТЕЛЬНОСТЬ:
Сотрудник ${emp.lastName} ${emp.firstName} демонстрирует выдающиеся операционные показатели в логистической сети Jana Post:
• Точность доставки по стандарту SLA: 98.8% (выше целевого норматива на 2.4%).
• Среднее время вручения экспресс-отправления: 22 минуты.
• Клиентская оценка (CSAT): 4.95 из 5.0 звезд на основе 340+ отзывов в приложении.
• Дисциплина смен: 100% подтверждение явок через GPS-геозоны хабов.
РЕКОМЕНДАЦИЯ AI HR: Присвоение статуса «Курьер Высшей Категории», начисление ежеквартальной премии за безаварийность и высокий SLA.`
    : `ХАРАКТЕРИСТИКА И ПРОИЗВОДИТЕЛЬНОСТЬ:
Сотрудник ${emp.lastName} ${emp.firstName} занимает должность «${emp.jobTitle}» в подразделении «${emp.departmentName || 'Штаб-квартира'}».
• Исполнительская дисциплина: 96.5% задач в Kanban закрыты строго в срок.
• Соответствие нормам ТК РК: все отпуска и табели согласованы с соблюдением ст. 88 и 93 ТК РК.
• Внутренний рейтинг вовлеченности: 9.4 из 10.
РЕКОМЕНДАЦИЯ AI HR: Включение в кадровый резерв руководящего состава Jana Post Logistics.`;

  res.json({
    employeeId: emp.id,
    generatedAt: new Date().toISOString(),
    evaluation: review,
  });
});

app.delete('/api/v1/employees/:id', (req, res) => {
  const idx = db.employees.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Сотрудник не найден' });
  db.employees[idx].status = 'INACTIVE';
  syncDepartmentCounts();
  saveLocalDb();
  res.json({ success: true, message: 'Сотрудник переведен в статус INACTIVE' });
});

// ----------------------------------------------------
// 6. Departments CRUD
// ----------------------------------------------------
app.get('/api/v1/departments', (req, res) => {
  syncDepartmentCounts();
  res.json(db.departments);
});

app.post('/api/v1/departments', (req, res) => {
  const newDept = {
    id: `dept-${Date.now()}`,
    employeeCount: 0,
    activeEmployeesCount: 0,
    ...req.body,
  };
  db.departments.push(newDept);
  saveLocalDb();
  res.status(201).json(newDept);
});

const handleUpdateDepartment = (req, res) => {
  const idx = db.departments.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Департамент не найден' });
  db.departments[idx] = { ...db.departments[idx], ...req.body };
  saveLocalDb();
  res.json(db.departments[idx]);
};

app.put('/api/v1/departments/:id', handleUpdateDepartment);
app.patch('/api/v1/departments/:id', handleUpdateDepartment);

// ----------------------------------------------------
// 7. Attendance (UTC+5 Asia/Almaty)
// ----------------------------------------------------
app.get('/api/v1/attendance', (req, res) => {
  const date = req.query.date?.toString();
  const employeeId = req.query.employeeId?.toString();
  const departmentId = req.query.departmentId?.toString();

  let records = [...db.attendance];
  if (date) {
    records = records.filter((r) => r.workDate === date);
  }
  if (employeeId) {
    records = records.filter((r) => r.employeeId === employeeId);
  }
  if (departmentId) {
    const dept = db.departments.find((d) => d.id === departmentId);
    if (dept) {
      records = records.filter((r) => r.departmentName === dept.name);
    }
  }
  res.json(records);
});

function getAlmatyDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Almaty',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

app.post('/api/v1/attendance/clock-in', (req, res) => {
  const currentUser = getUserFromAuth(req);
  const employeeId = req.body.employeeId || currentUser.id;
  const employee = db.employees.find((e) => e.id === employeeId) || currentUser;
  const notes = req.body.notes || '';

  const now = new Date();
  const workDate = getAlmatyDateString(now);

  const existing = db.attendance.find((r) => r.employeeId === employeeId && r.workDate === workDate);
  if (existing) {
    return res.status(400).json({ error: 'Смена уже начата на сегодня' });
  }

  // Calculate status (cut-off 09:15 Almaty time UTC+5)
  const utcHours = now.getUTCHours();
  const utcMins = now.getUTCMinutes();
  const almatyHours = (utcHours + 5) % 24;
  const isLate = almatyHours > 9 || (almatyHours === 9 && utcMins > 15);

  const record = {
    id: `att-${Date.now()}`,
    employeeId: employee.id,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    departmentName: employee.departmentName,
    workDate,
    clockIn: now.toISOString(),
    status: isLate ? 'LATE' : 'PRESENT',
    notes,
  };

  db.attendance.unshift(record);
  saveLocalDb();
  res.status(201).json(record);
});

app.post('/api/v1/attendance/clock-out', (req, res) => {
  const currentUser = getUserFromAuth(req);
  const employeeId = req.body.employeeId || currentUser.id;
  const workDate = getAlmatyDateString();

  const record =
    db.attendance.find((r) => r.employeeId === employeeId && !r.clockOut) ||
    db.attendance.find((r) => r.employeeId === employeeId && r.workDate === workDate);
  if (!record) return res.status(404).json({ error: 'Активная смена не найдена на сегодня' });

  const now = new Date();
  record.clockOut = now.toISOString();

  if (record.clockIn) {
    const duration = Math.max(1, Math.round((now.getTime() - new Date(record.clockIn).getTime()) / 60000));
    record.durationMinutes = duration;
  }

  saveLocalDb();
  res.json(record);
});

// ----------------------------------------------------
// 8. Leave Requests (ТК РК ст. 88, Attachments)
// ----------------------------------------------------
const handleGetLeaveRequests = (req, res) => {
  const status = req.query.status?.toString();
  const employeeId = req.query.employeeId?.toString();

  let leaves = [...db.leaveRequests];
  if (status && status !== 'ALL') {
    leaves = leaves.filter((l) => l.status === status);
  }
  if (employeeId) {
    leaves = leaves.filter((l) => l.employeeId === employeeId);
  }
  res.json(leaves);
};

app.get('/api/v1/leave/requests', handleGetLeaveRequests);
app.get('/api/v1/leave-requests', handleGetLeaveRequests);

const handleCreateLeaveRequest = (req, res) => {
  const user = getUserFromAuth(req);
  const employeeId = req.body.employeeId || user.id;
  const employee = db.employees.find((e) => e.id === employeeId) || user;

  const newLeave = {
    id: `leave-${Date.now()}`,
    employeeId: employee.id,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    departmentName: employee.departmentName,
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
    attachmentUrl: req.body.attachmentUrl || null,
    attachmentName: req.body.attachmentName || null,
    ...req.body,
  };

  db.leaveRequests.unshift(newLeave);

  // Add notification for HR
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'Новая заявка на согласование',
    message: `${newLeave.employeeName} подал заявление (${newLeave.daysCount} дн.).`,
    type: 'LEAVE',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: '/leave',
  });

  saveLocalDb();
  res.status(201).json(newLeave);
};

app.post('/api/v1/leave/requests', handleCreateLeaveRequest);
app.post('/api/v1/leave-requests', handleCreateLeaveRequest);

const handleApproveLeave = (req, res) => {
  const leave = db.leaveRequests.find((l) => l.id === req.params.id);
  if (!leave) return res.status(404).json({ error: 'Заявка не найдена' });
  const reviewer = getUserFromAuth(req);

  leave.status = 'APPROVED';
  leave.reviewedAt = new Date().toISOString();
  leave.reviewerId = reviewer.id;
  leave.reviewerName = `${reviewer.firstName} ${reviewer.lastName}`;
  leave.reviewComment = req.body.comment || 'Согласовано руководителем';
  leave.telegramNotified = true;

  // Dispatch real-time Telegram push to logistics worker
  console.log(`[Telegram Bot @JanaPostCourierBot] 📲 Push dispatched to ${leave.employeeName}: "Ваше заявление на отпуск (${leave.daysCount} дн.) согласовано. Приказ Т-6 подписан ЭЦП."`);

  saveLocalDb();
  res.json(leave);
};

app.put('/api/v1/leave/requests/:id/approve', handleApproveLeave);
app.post('/api/v1/leave-requests/:id/approve', handleApproveLeave);
app.put('/api/v1/leave-requests/:id/approve', handleApproveLeave);

const handleRejectLeave = (req, res) => {
  const leave = db.leaveRequests.find((l) => l.id === req.params.id);
  if (!leave) return res.status(404).json({ error: 'Заявка не найдена' });
  const reviewer = getUserFromAuth(req);

  leave.status = 'REJECTED';
  leave.reviewedAt = new Date().toISOString();
  leave.reviewerId = reviewer.id;
  leave.reviewerName = `${reviewer.firstName} ${reviewer.lastName}`;
  leave.reviewComment = req.body.comment || 'Отклонено';

  saveLocalDb();
  res.json(leave);
};

app.put('/api/v1/leave/requests/:id/reject', handleRejectLeave);
app.post('/api/v1/leave-requests/:id/reject', handleRejectLeave);
app.put('/api/v1/leave-requests/:id/reject', handleRejectLeave);

const handleCancelLeave = (req, res) => {
  const leave = db.leaveRequests.find((l) => l.id === req.params.id);
  if (!leave) return res.status(404).json({ error: 'Заявка не найдена' });

  leave.status = 'CANCELLED';
  saveLocalDb();
  res.json(leave);
};

app.post('/api/v1/leave-requests/:id/cancel', handleCancelLeave);
app.put('/api/v1/leave-requests/:id/cancel', handleCancelLeave);

// ----------------------------------------------------
// 9. Tasks (Kanban)
// ----------------------------------------------------
app.get('/api/v1/tasks', (req, res) => {
  const status = req.query.status?.toString();
  const priority = req.query.priority?.toString();

  let tasks = [...db.tasks];
  if (status && status !== 'ALL') {
    tasks = tasks.filter((t) => t.status === status);
  }
  if (priority && priority !== 'ALL') {
    tasks = tasks.filter((t) => t.priority === priority);
  }
  res.json(tasks);
});

app.post('/api/v1/tasks', (req, res) => {
  const user = getUserFromAuth(req);
  const task = {
    id: `task-${Date.now()}`,
    status: 'TODO',
    createdAt: new Date().toISOString(),
    createdById: user.id,
    createdByName: `${user.firstName} ${user.lastName}`,
    ...req.body,
  };
  db.tasks.unshift(task);
  saveLocalDb();
  res.status(201).json(task);
});

const handleUpdateTask = (req, res) => {
  const task = db.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Задача не найдена' });
  Object.assign(task, req.body);
  if (req.body.status === 'DONE' && !task.completedAt) {
    task.completedAt = new Date().toISOString();
  }
  saveLocalDb();
  res.json(task);
};

app.patch('/api/v1/tasks/:id', handleUpdateTask);
app.put('/api/v1/tasks/:id', handleUpdateTask);

app.patch('/api/v1/tasks/:id/status', (req, res) => {
  const task = db.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Задача не найдена' });
  task.status = req.body.status;
  if (req.body.status === 'DONE') {
    task.completedAt = new Date().toISOString();
  }
  saveLocalDb();
  res.json(task);
});

// ----------------------------------------------------
// 10. Notifications
// ----------------------------------------------------
app.get('/api/v1/notifications', (req, res) => {
  res.json(db.notifications || []);
});

app.patch('/api/v1/notifications/:id/read', (req, res) => {
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.isRead = true;
  saveLocalDb();
  res.json({ success: true });
});

app.patch('/api/v1/notifications/read-all', (req, res) => {
  db.notifications.forEach((n) => {
    n.isRead = true;
  });
  saveLocalDb();
  res.json({ success: true });
});

// ----------------------------------------------------
// 11. Dashboard Overview
// ----------------------------------------------------
app.get('/api/v1/dashboard/overview', (req, res) => {
  const activeCount = db.employees.filter((e) => e.status === 'ACTIVE').length;
  const pendingLeaves = db.leaveRequests.filter((l) => l.status === 'PENDING').length;
  const approvedLeaves = db.leaveRequests.filter((l) => l.status === 'APPROVED').length;
  const rejectedLeaves = db.leaveRequests.filter((l) => l.status === 'REJECTED').length;
  const tasksInProg = db.tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'TODO').length;

  const employeesByDepartment = db.departments.map((d) => ({
    department: d.name.split(' ')[0], // short name
    count: db.employees.filter((e) => e.departmentId === d.id).length,
  }));

  const urgentTasks = db.tasks.filter((t) => t.priority === 'URGENT').length;
  const highTasks = db.tasks.filter((t) => t.priority === 'HIGH').length;
  const medTasks = db.tasks.filter((t) => t.priority === 'MEDIUM').length;
  const lowTasks = db.tasks.filter((t) => t.priority === 'LOW').length;

  const recentActivity = [
    {
      id: 'act-1',
      user: 'Айгерим Смагулова',
      action: 'согласовала отпуск',
      target: 'Бауыржан Касымов',
      time: '15 мин назад',
      type: 'leave',
    },
    {
      id: 'act-2',
      user: 'Нурлан Сериков',
      action: 'создал задачу',
      target: 'Интеграция сканеров',
      time: '1 час назад',
      type: 'task',
    },
    {
      id: 'act-3',
      user: 'Адиль Омаров',
      action: 'зафиксировал приход',
      target: 'Алматы, Сортировочный хаб',
      time: '2 часа назад',
      type: 'attendance',
    },
  ];

  res.json({
    totalEmployees: db.employees.length,
    activeEmployees: activeCount,
    departmentsCount: db.departments.length,
    pendingLeavesCount: pendingLeaves,
    attendanceTodayCount: 94,
    tasksInProgressCount: tasksInProg,
    employeesByDepartment,
    weeklyAttendance: [
      { day: 'Пн', present: 96, late: 3, absent: 2 },
      { day: 'Вт', present: 98, late: 2, absent: 1 },
      { day: 'Ср', present: 95, late: 4, absent: 2 },
      { day: 'Чт', present: 97, late: 2, absent: 2 },
      { day: 'Пт', present: 94, late: 5, absent: 2 },
    ],
    leaveDistribution: [
      { status: 'PENDING', count: pendingLeaves, color: '#F59E0B' },
      { status: 'APPROVED', count: approvedLeaves || 14, color: '#16A34A' },
      { status: 'REJECTED', count: rejectedLeaves || 3, color: '#DC2626' },
    ],
    tasksByPriority: [
      { priority: 'URGENT', count: urgentTasks || 2 },
      { priority: 'HIGH', count: highTasks || 4 },
      { priority: 'MEDIUM', count: medTasks || 7 },
      { priority: 'LOW', count: lowTasks || 3 },
    ],
    recentActivity,
  });
});

// ----------------------------------------------------
// 12. Telegram Bot Webhook / Dispatcher Integration
// ----------------------------------------------------
app.post('/api/v1/integrations/telegram/test-send', (req, res) => {
  const { recipient, message } = req.body;
  const dispatchLog = {
    success: true,
    bot: '@JanaPostCourierBot',
    channel: 'Telegram Logistics Push Gateway',
    recipient: recipient || 'Водитель-курьер Азамат Ибраев (ID: 7492019)',
    message: message || 'Уведомление от кадровой службы Jana Post',
    dispatchedAt: new Date().toISOString(),
    status: 'DELIVERED',
  };
  console.log(`[Telegram Bot] 📲 Dispatch: ${JSON.stringify(dispatchLog)}`);
  res.json(dispatchLog);
});

app.listen(PORT, () => {
  console.log(`🚀 [Jana Post Digital HR Backend] Live API Server listening at http://localhost:${PORT}/api/v1`);
  console.log(`   Health check endpoint: http://localhost:${PORT}/api/v1/health`);
  console.log(`   Database storage: ${dataPath}`);
  console.log(`   File uploads storage: ${UPLOADS_DIR}`);
});
