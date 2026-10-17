import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Paths for persistence: data.json (runtime) and seeds.json (fallback/initial)
const seedsPath = path.resolve(__dirname, '../../database/seeds.json');
const dataPath = path.resolve(__dirname, '../../database/data.json');

let db = {
  departments: [],
  employees: [],
  attendance: [],
  leaveRequests: [],
  tasks: [],
  notifications: [],
};

// Atomically save DB state to database/data.json
function saveDb() {
  try {
    const tmpPath = `${dataPath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tmpPath, dataPath);
  } catch (err) {
    console.error('[Database] Failed to persist data to disk:', err);
  }
}

// Load runtime data from data.json or fallback to seeds.json
try {
  if (fs.existsSync(dataPath)) {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    db = JSON.parse(raw);
    console.log(`[Database] Loaded persistent data from data.json: ${db.employees?.length || 0} employees, ${db.departments?.length || 0} departments.`);
  } else {
    const raw = fs.readFileSync(seedsPath, 'utf-8');
    db = JSON.parse(raw);
    if (!db.notifications) db.notifications = [];
    saveDb();
    console.log(`[Database] Initialized data.json from seeds.json with ${db.employees?.length || 0} employees.`);
  }
} catch (e) {
  console.warn('[Database] Error initializing database state:', e);
}

const EMAIL_ALIASES = {
  'admin@janapost.kz': 'a.smagulova@janapost.kz',
  'hr@janapost.kz': 'z.ibrayeva@janapost.kz',
  'manager@janapost.kz': 'b.kassymov@janapost.kz',
  'employee@janapost.kz': 'a.omarov@janapost.kz',
};

function findEmployeeByEmail(email) {
  if (!email) return db.employees[0];
  const normalized = email.toLowerCase().trim();
  const target = EMAIL_ALIASES[normalized] || normalized;
  return (
    db.employees.find((e) => e.email.toLowerCase() === target || e.email.toLowerCase() === normalized) ||
    db.employees[0]
  );
}

// Helper: Extract authenticated user from Bearer token
function getUserFromAuth(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token.startsWith('jwt-jp-live-token-')) {
      const emailBase64 = token.replace('jwt-jp-live-token-', '');
      try {
        const email = Buffer.from(emailBase64, 'base64').toString('utf-8');
        const user = findEmployeeByEmail(email);
        if (user) return user;
      } catch {
        // ignore decoding errors
      }
    }
  }
  // Fallback to default admin employee
  return db.employees[0] || {
    id: 'emp-1',
    employeeId: 'JP-00101',
    firstName: 'Айгерим',
    lastName: 'Смагулова',
    email: 'admin@janapost.kz',
    role: 'ADMIN',
    departmentId: 'dept-3',
    departmentName: 'HR и корпоративная культура',
    jobTitle: 'HR Director / Super Admin',
  };
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
    version: '1.0.0',
    persistence: 'Active (database/data.json)',
    timezone: 'Asia/Almaty (UTC+5)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.post('/api/v1/system/reset-db', (req, res) => {
  try {
    const raw = fs.readFileSync(seedsPath, 'utf-8');
    db = JSON.parse(raw);
    if (!db.notifications) db.notifications = [];
    saveDb();
    res.json({ success: true, message: 'База данных успешно сброшена к исходным семенам' });
  } catch (err) {
    res.status(500).json({ error: 'Не удалось сбросить данные: ' + err.message });
  }
});

// ----------------------------------------------------
// 2. Authentication
// ----------------------------------------------------
app.post('/api/v1/auth/login', (req, res) => {
  const { email } = req.body;
  const user = findEmployeeByEmail(email);

  const role =
    user.id === 'emp-1'
      ? 'ADMIN'
      : user.id === 'emp-7'
      ? 'HR_MANAGER'
      : user.id === 'emp-2' || user.id === 'emp-3' || user.id === 'emp-4' || user.id === 'emp-5'
      ? 'DEPARTMENT_HEAD'
      : 'EMPLOYEE';

  const loginEmail = (email || '').toLowerCase().trim();
  const tokenEmail = loginEmail && EMAIL_ALIASES[loginEmail] ? loginEmail : user.email;

  res.json({
    token: 'jwt-jp-live-token-' + Buffer.from(tokenEmail).toString('base64'),
    user: {
      id: user.id,
      employeeId: user.employeeId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: tokenEmail,
      role,
      departmentId: user.departmentId,
      departmentName: user.departmentName,
      jobTitle: user.jobTitle,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
    },
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  const user = getUserFromAuth(req);
  const role =
    user.id === 'emp-1'
      ? 'ADMIN'
      : user.id === 'emp-7'
      ? 'HR_MANAGER'
      : user.id === 'emp-2' || user.id === 'emp-3' || user.id === 'emp-4' || user.id === 'emp-5'
      ? 'DEPARTMENT_HEAD'
      : 'EMPLOYEE';

  let displayEmail = user.email;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token.startsWith('jwt-jp-live-token-')) {
      try {
        const decoded = Buffer.from(token.replace('jwt-jp-live-token-', ''), 'base64').toString('utf-8');
        if (decoded.includes('@')) displayEmail = decoded;
      } catch {}
    }
  }

  res.json({
    id: user.id,
    employeeId: user.employeeId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: displayEmail,
    role,
    departmentId: user.departmentId,
    departmentName: user.departmentName,
    jobTitle: user.jobTitle,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
  });
});

app.post('/api/v1/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Сессия успешно завершена' });
});

app.post('/api/v1/auth/change-password', (req, res) => {
  res.json({ success: true, message: 'Пароль успешно обновлен' });
});

// ----------------------------------------------------
// 3. Employees CRUD
// ----------------------------------------------------
app.get('/api/v1/employees', (req, res) => {
  const q = (req.query.search || req.query.q || '').toString().toLowerCase();
  const dept = (req.query.departmentId || '').toString();
  const status = (req.query.status || '').toString();
  const page = Math.max(1, parseInt(req.query.page?.toString() || '1', 10));
  const limit = Math.max(1, parseInt(req.query.limit?.toString() || '8', 10));

  let filtered = [...db.employees];

  if (q) {
    filtered = filtered.filter(
      (e) =>
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.jobTitle.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q)
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
  const data = filtered.slice(start, start + limit);

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

app.get('/api/v1/employees/:id', (req, res) => {
  const emp = db.employees.find((e) => e.id === req.params.id);
  if (!emp) return res.status(404).json({ error: 'Сотрудник не найден' });
  res.json(emp);
});

app.post('/api/v1/employees', (req, res) => {
  const dept = db.departments.find((d) => d.id === req.body.departmentId);
  const newEmp = {
    id: `emp-${Date.now()}`,
    employeeId: `JP-${Math.floor(10000 + Math.random() * 90000)}`,
    status: 'ACTIVE',
    departmentName: dept ? dept.name : req.body.departmentName || '',
    ...req.body,
  };
  db.employees.unshift(newEmp);
  syncDepartmentCounts();
  saveDb();
  res.status(201).json(newEmp);
});

const handleUpdateEmployee = (req, res) => {
  const idx = db.employees.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Сотрудник не найден' });

  if (req.body.departmentId) {
    const dept = db.departments.find((d) => d.id === req.body.departmentId);
    if (dept) req.body.departmentName = dept.name;
  }

  db.employees[idx] = { ...db.employees[idx], ...req.body };
  syncDepartmentCounts();
  saveDb();
  res.json(db.employees[idx]);
};

app.put('/api/v1/employees/:id', handleUpdateEmployee);
app.patch('/api/v1/employees/:id', handleUpdateEmployee);

app.patch('/api/v1/employees/:id/status', (req, res) => {
  const idx = db.employees.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Сотрудник не найден' });
  db.employees[idx].status = req.body.status || 'INACTIVE';
  syncDepartmentCounts();
  saveDb();
  res.json(db.employees[idx]);
});

app.delete('/api/v1/employees/:id', (req, res) => {
  const idx = db.employees.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Сотрудник не найден' });
  db.employees[idx].status = 'INACTIVE';
  syncDepartmentCounts();
  saveDb();
  res.json({ success: true, message: 'Сотрудник переведен в статус INACTIVE' });
});

// ----------------------------------------------------
// 4. Departments CRUD
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
  saveDb();
  res.status(201).json(newDept);
});

const handleUpdateDepartment = (req, res) => {
  const idx = db.departments.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Департамент не найден' });
  db.departments[idx] = { ...db.departments[idx], ...req.body };
  saveDb();
  res.json(db.departments[idx]);
};

app.put('/api/v1/departments/:id', handleUpdateDepartment);
app.patch('/api/v1/departments/:id', handleUpdateDepartment);

// ----------------------------------------------------
// 5. Attendance (UTC+5)
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

app.post('/api/v1/attendance/clock-in', (req, res) => {
  const currentUser = getUserFromAuth(req);
  const employeeId = req.body.employeeId || currentUser.id;
  const employee = db.employees.find((e) => e.id === employeeId) || currentUser;
  const notes = req.body.notes || '';

  const now = new Date();
  const workDate = now.toISOString().split('T')[0];

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
  saveDb();
  res.status(201).json(record);
});

app.post('/api/v1/attendance/clock-out', (req, res) => {
  const currentUser = getUserFromAuth(req);
  const employeeId = req.body.employeeId || currentUser.id;
  const workDate = new Date().toISOString().split('T')[0];

  const record = db.attendance.find((r) => r.employeeId === employeeId && r.workDate === workDate);
  if (!record) return res.status(404).json({ error: 'Активная смена не найдена на сегодня' });

  const now = new Date();
  record.clockOut = now.toISOString();

  if (record.clockIn) {
    const duration = Math.max(1, Math.round((now.getTime() - new Date(record.clockIn).getTime()) / 60000));
    record.durationMinutes = duration;
  }

  saveDb();
  res.json(record);
});

// ----------------------------------------------------
// 6. Leave Requests (ТК РК)
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

  saveDb();
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

  saveDb();
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

  saveDb();
  res.json(leave);
};

app.put('/api/v1/leave/requests/:id/reject', handleRejectLeave);
app.post('/api/v1/leave-requests/:id/reject', handleRejectLeave);
app.put('/api/v1/leave-requests/:id/reject', handleRejectLeave);

const handleCancelLeave = (req, res) => {
  const leave = db.leaveRequests.find((l) => l.id === req.params.id);
  if (!leave) return res.status(404).json({ error: 'Заявка не найдена' });

  leave.status = 'CANCELLED';
  saveDb();
  res.json(leave);
};

app.post('/api/v1/leave-requests/:id/cancel', handleCancelLeave);
app.put('/api/v1/leave-requests/:id/cancel', handleCancelLeave);

// ----------------------------------------------------
// 7. Tasks
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
  saveDb();
  res.status(201).json(task);
});

const handleUpdateTask = (req, res) => {
  const task = db.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Задача не найдена' });
  Object.assign(task, req.body);
  if (req.body.status === 'DONE' && !task.completedAt) {
    task.completedAt = new Date().toISOString();
  }
  saveDb();
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
  saveDb();
  res.json(task);
});

// ----------------------------------------------------
// 8. Notifications
// ----------------------------------------------------
app.get('/api/v1/notifications', (req, res) => {
  res.json(db.notifications || []);
});

app.patch('/api/v1/notifications/:id/read', (req, res) => {
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.isRead = true;
  saveDb();
  res.json({ success: true });
});

app.patch('/api/v1/notifications/read-all', (req, res) => {
  db.notifications.forEach((n) => {
    n.isRead = true;
  });
  saveDb();
  res.json({ success: true });
});

// ----------------------------------------------------
// 9. Dashboard Overview
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

app.listen(PORT, () => {
  console.log(`🚀 [Jana Post Digital HR Backend] Live API Server listening at http://localhost:${PORT}/api/v1`);
  console.log(`   Health check endpoint: http://localhost:${PORT}/api/v1/health`);
  console.log(`   Persistent storage: ${dataPath}`);
});
