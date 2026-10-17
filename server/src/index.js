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

// Load seed data from database/seeds.json
const seedsPath = path.resolve(__dirname, '../../database/seeds.json');
let db = {
  departments: [],
  employees: [],
  attendance: [],
  leaveRequests: [],
  tasks: [],
};

try {
  const raw = fs.readFileSync(seedsPath, 'utf-8');
  db = JSON.parse(raw);
  console.log(`[Database] Loaded ${db.employees.length} employees, ${db.departments.length} departments, ${db.tasks.length} tasks.`);
} catch (e) {
  console.warn('[Database] Could not read seeds.json, initializing empty state.', e);
}

// ----------------------------------------------------
// 1. Health & Meta
// ----------------------------------------------------
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Digital HR by Jana Post — Live REST API',
    version: '1.0.0',
    timezone: 'Asia/Almaty (UTC+5)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ----------------------------------------------------
// 2. Authentication
// ----------------------------------------------------
app.post('/api/v1/auth/login', (req, res) => {
  const { email } = req.body;
  const user = db.employees.find((e) => e.email.toLowerCase() === (email || '').toLowerCase()) || db.employees[0];
  
  res.json({
    token: 'jwt-jp-live-token-' + Buffer.from(user.email).toString('base64'),
    user: {
      id: user.id,
      employeeId: user.employeeId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.id === 'emp-1' ? 'ADMIN' : user.id === 'emp-3' || user.id === 'emp-2' ? 'DEPARTMENT_HEAD' : 'EMPLOYEE',
      departmentId: user.departmentId,
      departmentName: user.departmentName,
      jobTitle: user.jobTitle,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
    },
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  const admin = db.employees[0];
  res.json({
    id: admin.id,
    employeeId: admin.employeeId,
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    role: 'ADMIN',
    departmentId: admin.departmentId,
    departmentName: admin.departmentName,
    jobTitle: admin.jobTitle,
    avatarUrl: admin.avatarUrl,
  });
});

// ----------------------------------------------------
// 3. Employees CRUD
// ----------------------------------------------------
app.get('/api/v1/employees', (req, res) => {
  const q = (req.query.q || '').toString().toLowerCase();
  const dept = (req.query.departmentId || '').toString();
  const status = (req.query.status || '').toString();
  const page = parseInt(req.query.page?.toString() || '1', 10);
  const limit = parseInt(req.query.limit?.toString() || '8', 10);

  let filtered = [...db.employees];

  if (q) {
    filtered = filtered.filter(
      (e) =>
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.jobTitle.toLowerCase().includes(q)
    );
  }

  if (dept && dept !== 'ALL') {
    filtered = filtered.filter((e) => e.departmentId === dept);
  }

  if (status && status !== 'ALL') {
    filtered = filtered.filter((e) => e.status === status);
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  res.json({
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

app.get('/api/v1/employees/:id', (req, res) => {
  const emp = db.employees.find((e) => e.id === req.params.id);
  if (!emp) return res.status(404).json({ error: 'Сотрудник не найден' });
  res.json(emp);
});

app.post('/api/v1/employees', (req, res) => {
  const newEmp = {
    id: `emp-${Date.now()}`,
    employeeId: `JP-${Math.floor(10000 + Math.random() * 90000)}`,
    status: 'ACTIVE',
    ...req.body,
  };
  db.employees.unshift(newEmp);
  res.status(201).json(newEmp);
});

app.put('/api/v1/employees/:id', (req, res) => {
  const idx = db.employees.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Сотрудник не найден' });
  db.employees[idx] = { ...db.employees[idx], ...req.body };
  res.json(db.employees[idx]);
});

app.delete('/api/v1/employees/:id', (req, res) => {
  const idx = db.employees.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Сотрудник не найден' });
  db.employees[idx].status = 'INACTIVE';
  res.json({ success: true, message: 'Сотрудник переведен в статус INACTIVE' });
});

// ----------------------------------------------------
// 4. Departments CRUD
// ----------------------------------------------------
app.get('/api/v1/departments', (req, res) => {
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
  res.status(201).json(newDept);
});

app.put('/api/v1/departments/:id', (req, res) => {
  const idx = db.departments.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Департамент не найден' });
  db.departments[idx] = { ...db.departments[idx], ...req.body };
  res.json(db.departments[idx]);
});

// ----------------------------------------------------
// 5. Attendance (UTC+5)
// ----------------------------------------------------
app.get('/api/v1/attendance', (req, res) => {
  const date = req.query.date?.toString();
  let records = db.attendance;
  if (date) {
    records = records.filter((r) => r.workDate === date);
  }
  res.json(records);
});

app.post('/api/v1/attendance/clock-in', (req, res) => {
  const { employeeId, employeeName, departmentName } = req.body;
  const now = new Date();
  const workDate = now.toISOString().split('T')[0];
  
  const existing = db.attendance.find((r) => r.employeeId === employeeId && r.workDate === workDate);
  if (existing) {
    return res.status(400).json({ error: 'Смена уже начата' });
  }

  const record = {
    id: `att-${Date.now()}`,
    employeeId,
    employeeName,
    departmentName,
    workDate,
    clockIn: now.toISOString(),
    status: now.getHours() >= 9 && now.getMinutes() > 15 ? 'LATE' : 'PRESENT',
  };
  db.attendance.unshift(record);
  res.status(201).json(record);
});

app.post('/api/v1/attendance/clock-out', (req, res) => {
  const { employeeId } = req.body;
  const workDate = new Date().toISOString().split('T')[0];
  const record = db.attendance.find((r) => r.employeeId === employeeId && r.workDate === workDate);
  if (!record) return res.status(404).json({ error: 'Активная смена не найдена' });

  record.clockOut = new Date().toISOString();
  res.json(record);
});

// ----------------------------------------------------
// 6. Leave Requests (ТК РК)
// ----------------------------------------------------
app.get('/api/v1/leave/requests', (req, res) => {
  res.json(db.leaveRequests);
});

app.post('/api/v1/leave/requests', (req, res) => {
  const newLeave = {
    id: `leave-${Date.now()}`,
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
    ...req.body,
  };
  db.leaveRequests.unshift(newLeave);
  res.status(201).json(newLeave);
});

app.put('/api/v1/leave/requests/:id/approve', (req, res) => {
  const leave = db.leaveRequests.find((l) => l.id === req.params.id);
  if (!leave) return res.status(404).json({ error: 'Заявка не найдена' });
  leave.status = 'APPROVED';
  leave.reviewedAt = new Date().toISOString();
  leave.reviewerName = req.body.reviewerName || 'Айгерим Смагулова';
  leave.reviewComment = req.body.comment || 'Согласовано руководителем';
  res.json(leave);
});

app.put('/api/v1/leave/requests/:id/reject', (req, res) => {
  const leave = db.leaveRequests.find((l) => l.id === req.params.id);
  if (!leave) return res.status(404).json({ error: 'Заявка не найдена' });
  leave.status = 'REJECTED';
  leave.reviewedAt = new Date().toISOString();
  leave.reviewerName = req.body.reviewerName || 'Айгерим Смагулова';
  leave.reviewComment = req.body.comment || 'Отклонено';
  res.json(leave);
});

// ----------------------------------------------------
// 7. Tasks
// ----------------------------------------------------
app.get('/api/v1/tasks', (req, res) => {
  res.json(db.tasks);
});

app.post('/api/v1/tasks', (req, res) => {
  const task = {
    id: `task-${Date.now()}`,
    status: 'TODO',
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  db.tasks.unshift(task);
  res.status(201).json(task);
});

app.patch('/api/v1/tasks/:id/status', (req, res) => {
  const task = db.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Задача не найдена' });
  task.status = req.body.status;
  if (req.body.status === 'DONE') task.completedAt = new Date().toISOString();
  res.json(task);
});

// ----------------------------------------------------
// 8. Dashboard Overview
// ----------------------------------------------------
app.get('/api/v1/dashboard/overview', (req, res) => {
  const activeCount = db.employees.filter((e) => e.status === 'ACTIVE').length;
  const pendingLeaves = db.leaveRequests.filter((l) => l.status === 'PENDING').length;
  const tasksInProg = db.tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'TODO').length;

  res.json({
    totalEmployees: db.employees.length,
    activeEmployees: activeCount,
    departmentsCount: db.departments.length,
    pendingLeavesCount: pendingLeaves,
    attendanceTodayCount: 94,
    tasksInProgressCount: tasksInProg,
    weeklyAttendance: [
      { day: 'Пн', present: 96, late: 3, absent: 2 },
      { day: 'Вт', present: 98, late: 2, absent: 1 },
      { day: 'Ср', present: 95, late: 4, absent: 2 },
      { day: 'Чт', present: 97, late: 2, absent: 2 },
      { day: 'Пт', present: 94, late: 5, absent: 2 },
    ],
    leaveDistribution: [
      { status: 'PENDING', count: pendingLeaves, color: '#F59E0B' },
      { status: 'APPROVED', count: 14, color: '#16A34A' },
      { status: 'REJECTED', count: 3, color: '#DC2626' },
    ],
    tasksByPriority: [
      { priority: 'URGENT', count: 2 },
      { priority: 'HIGH', count: 4 },
      { priority: 'MEDIUM', count: 7 },
      { priority: 'LOW', count: 3 },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 [Jana Post Digital HR Backend] Live API Server listening at http://localhost:${PORT}/api/v1`);
  console.log(`   Health check endpoint: http://localhost:${PORT}/api/v1/health`);
});
