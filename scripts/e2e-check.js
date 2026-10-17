import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, '../database/data.json');

const results = [];

function record(name, status, details = '') {
  results.push({ name, status, details });
  const icon = status ? '✅' : '❌';
  console.log(`${icon} [${name}]: ${details}`);
}

function req(method, pathName, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: pathName,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...headers,
      },
    };

    const request = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    request.on('error', reject);
    if (body) request.write(postData);
    request.end();
  });
}

function checkFrontend() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:5173/', (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('\n======================================================');
  console.log('🔍 FULL-STACK LIVE AUDIT: DIGITAL HR BY JANA POST');
  console.log('======================================================\n');

  // 1. Health check
  try {
    const res = await req('GET', '/api/v1/health');
    if (res.status === 200 && res.body.status === 'online') {
      record('Backend Health', true, `Status: online, TZ: ${res.body.timezone}, Persistence: ${res.body.persistence}`);
    } else {
      record('Backend Health', false, `Status ${res.status}`);
    }
  } catch (e) {
    record('Backend Health', false, e.message);
  }

  // 2. Frontend HTTP
  try {
    const fe = await checkFrontend();
    if (fe.status === 200 && fe.body.includes('<div id="root">')) {
      record('Frontend Web Server', true, 'HTTP 200 OK, root container present, Vite dev server live');
    } else {
      record('Frontend Web Server', false, `Status ${fe.status}`);
    }
  } catch (e) {
    record('Frontend Web Server', false, e.message);
  }

  // 3. Auth Login
  let adminToken = '';
  try {
    const res = await req('POST', '/api/v1/auth/login', { email: 'admin@janapost.kz', password: 'password123' });
    if (res.status === 200 && res.body.token && res.body.user.role === 'ADMIN') {
      adminToken = res.body.token;
      record('Auth Login (Admin)', true, `User: ${res.body.user.firstName} ${res.body.user.lastName}, Role: ${res.body.user.role}`);
    } else {
      record('Auth Login (Admin)', false, `Invalid response: ${res.status}`);
    }
  } catch (e) {
    record('Auth Login (Admin)', false, e.message);
  }

  // 4. Auth Me
  try {
    const res = await req('GET', '/api/v1/auth/me', null, { Authorization: `Bearer ${adminToken}` });
    if (res.status === 200 && res.body.email === 'admin@janapost.kz') {
      record('Auth Me (Session check)', true, `Authorized as ${res.body.email}`);
    } else {
      record('Auth Me (Session check)', false, `Status ${res.status}`);
    }
  } catch (e) {
    record('Auth Me (Session check)', false, e.message);
  }

  // 5. Employees list & search
  try {
    const res = await req('GET', '/api/v1/employees?limit=5');
    if (res.status === 200 && res.body.data && typeof res.body.total === 'number') {
      record('Employees List & Pagination', true, `Total in DB: ${res.body.total}, Page size: ${res.body.data.length}`);
    } else {
      record('Employees List & Pagination', false, `Status ${res.status}`);
    }
  } catch (e) {
    record('Employees List & Pagination', false, e.message);
  }

  // 6. Employee CRUD & Disk Persistence
  let createdEmpId = '';
  try {
    const newEmp = await req('POST', '/api/v1/employees', {
      firstName: 'Ерлан',
      lastName: 'Оспанов',
      email: 'e.ospanov@janapost.kz',
      jobTitle: 'Инженер логистических систем',
      departmentId: 'dept-1',
      phone: '+7 (702) 111-2233',
      startDate: '2026-10-17',
    }, { Authorization: `Bearer ${adminToken}` });

    if (newEmp.status === 201 && newEmp.body.id) {
      createdEmpId = newEmp.body.id;
      // Check disk
      const diskContent = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      const found = diskContent.employees.find(e => e.id === createdEmpId);
      if (found) {
        record('Employee Create & Disk Persistence', true, `Created ${found.firstName} ${found.lastName} (Табельный: ${found.employeeId}), saved in data.json`);
      } else {
        record('Employee Create & Disk Persistence', false, 'Created in memory but not found in data.json');
      }
    } else {
      record('Employee Create & Disk Persistence', false, `Status ${newEmp.status}`);
    }
  } catch (e) {
    record('Employee Create & Disk Persistence', false, e.message);
  }

  // 7. Departments & dynamic counts
  try {
    const res = await req('GET', '/api/v1/departments');
    if (res.status === 200 && Array.isArray(res.body) && res.body.length > 0) {
      record('Departments API', true, `Found ${res.body.length} departments. Logistics count: ${res.body[0].employeeCount}`);
    } else {
      record('Departments API', false, `Status ${res.status}`);
    }
  } catch (e) {
    record('Departments API', false, e.message);
  }

  // 8. Attendance Clock-in & Clock-out
  try {
    const clockInRes = await req('POST', '/api/v1/attendance/clock-in', {
      employeeId: createdEmpId,
      notes: 'Тестовый приход через аудит',
    }, { Authorization: `Bearer ${adminToken}` });

    if (clockInRes.status === 201 && clockInRes.body.clockIn) {
      const clockOutRes = await req('POST', '/api/v1/attendance/clock-out', {
        employeeId: createdEmpId,
      }, { Authorization: `Bearer ${adminToken}` });

      if (clockOutRes.status === 200 && clockOutRes.body.clockOut) {
        record('Attendance (Clock-In / Clock-Out)', true, `Status: ${clockInRes.body.status}, Duration: ${clockOutRes.body.durationMinutes || 1} мин`);
      } else {
        record('Attendance (Clock-In / Clock-Out)', false, `Clock-out status ${clockOutRes.status}`);
      }
    } else {
      record('Attendance (Clock-In / Clock-Out)', false, `Clock-in status ${clockInRes.status}: ${JSON.stringify(clockInRes.body)}`);
    }
  } catch (e) {
    record('Attendance (Clock-In / Clock-Out)', false, e.message);
  }

  // 9. Leave Requests (Submit, Approve)
  try {
    const leaveRes = await req('POST', '/api/v1/leave-requests', {
      employeeId: createdEmpId,
      leaveType: 'ANNUAL',
      startDate: '2026-11-01',
      endDate: '2026-11-07',
      daysCount: 7,
      reason: 'Очередной трудовой отпуск',
    }, { Authorization: `Bearer ${adminToken}` });

    if (leaveRes.status === 201 && leaveRes.body.id) {
      const leaveId = leaveRes.body.id;
      const approveRes = await req('POST', `/api/v1/leave-requests/${leaveId}/approve`, {
        comment: 'Согласовано HR Директором',
      }, { Authorization: `Bearer ${adminToken}` });

      if (approveRes.status === 200 && approveRes.body.status === 'APPROVED') {
        record('Leave Management (Submit & Approve)', true, `Leave #${leaveId} approved by ${approveRes.body.reviewerName}`);
      } else {
        record('Leave Management (Submit & Approve)', false, `Approval failed: ${approveRes.status}`);
      }
    } else {
      record('Leave Management (Submit & Approve)', false, `Leave submit failed: ${leaveRes.status}`);
    }
  } catch (e) {
    record('Leave Management (Submit & Approve)', false, e.message);
  }

  // 10. Tasks Kanban & Status change
  try {
    const taskRes = await req('POST', '/api/v1/tasks', {
      title: 'Проверить исправность весов в терминале 2',
      description: 'Калибровка оборудования Jana Post',
      priority: 'HIGH',
      assignedToId: createdEmpId,
      assignedToName: 'Ерлан Оспанов',
      dueDate: '2026-10-22',
    }, { Authorization: `Bearer ${adminToken}` });

    if (taskRes.status === 201 && taskRes.body.id) {
      const taskId = taskRes.body.id;
      const patchRes = await req('PATCH', `/api/v1/tasks/${taskId}/status`, { status: 'DONE' });
      if (patchRes.status === 200 && patchRes.body.status === 'DONE' && patchRes.body.completedAt) {
        record('Tasks & Kanban Workflow', true, `Task #${taskId} transitioned to DONE with completedAt timestamp`);
      } else {
        record('Tasks & Kanban Workflow', false, `Status transition failed: ${patchRes.status}`);
      }
    } else {
      record('Tasks & Kanban Workflow', false, `Task creation failed: ${taskRes.status}`);
    }
  } catch (e) {
    record('Tasks & Kanban Workflow', false, e.message);
  }

  // 11. Dashboard Overview Completeness
  try {
    const dashRes = await req('GET', '/api/v1/dashboard/overview');
    if (dashRes.status === 200) {
      const d = dashRes.body;
      const hasDepts = Array.isArray(d.employeesByDepartment) && d.employeesByDepartment.length > 0;
      const hasWeekly = Array.isArray(d.weeklyAttendance) && d.weeklyAttendance.length > 0;
      const hasLeaves = Array.isArray(d.leaveDistribution) && d.leaveDistribution.length > 0;
      const hasPriority = Array.isArray(d.tasksByPriority) && d.tasksByPriority.length > 0;
      const hasActivity = Array.isArray(d.recentActivity) && d.recentActivity.length > 0;

      if (hasDepts && hasWeekly && hasLeaves && hasPriority && hasActivity) {
        record('Dashboard Analytics Aggregations', true, `All charts populated: ${d.employeesByDepartment.length} depts, ${d.weeklyAttendance.length} attendance days, ${d.recentActivity.length} activities`);
      } else {
        record('Dashboard Analytics Aggregations', false, 'Missing one or more required metric chart arrays');
      }
    } else {
      record('Dashboard Analytics Aggregations', false, `Status ${dashRes.status}`);
    }
  } catch (e) {
    record('Dashboard Analytics Aggregations', false, e.message);
  }

  // 12. Notifications
  try {
    const notifs = await req('GET', '/api/v1/notifications');
    if (notifs.status === 200 && Array.isArray(notifs.body) && notifs.body.length > 0) {
      const markAll = await req('PATCH', '/api/v1/notifications/read-all');
      record('Notifications Center', true, `Fetched ${notifs.body.length} notifications, mark-all-read returned ${markAll.body.success}`);
    } else {
      record('Notifications Center', false, `Status ${notifs.status}`);
    }
  } catch (e) {
    record('Notifications Center', false, e.message);
  }

  // Reset database back to clean state
  try {
    await req('POST', '/api/v1/system/reset-db');
    console.log('\n[System] Database state reset to clean seed baseline.\n');
  } catch (e) {
    console.warn('[System] Reset failed:', e.message);
  }

  const passedCount = results.filter(r => r.status).length;
  const totalCount = results.length;
  console.log('======================================================');
  console.log(`ИТОГ ПРОВЕРКИ: ${passedCount} ИЗ ${totalCount} ТЕСТОВ ПРОЙДЕНО (${passedCount === totalCount ? '100% SUCCESS' : 'HAS FAILURES'})`);
  console.log('======================================================\n');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Audit exception:', err);
  process.exit(1);
});
