import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, '../database/data.json');

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('[Test] Spawning backend server...');
  const server = spawn('node', ['server/src/index.js'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env, PORT: '3000' },
  });

  try {
    // Wait for server to start
    await wait(1200);

    // 1. Health check
    console.log('[Test] 1. Testing GET /api/v1/health...');
    const health = await req('GET', '/api/v1/health');
    console.log('   Health response:', health.body.status, '| Persistence:', health.body.persistence);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Dashboard overview check
    console.log('[Test] 2. Testing GET /api/v1/dashboard/overview...');
    const dashboard = await req('GET', '/api/v1/dashboard/overview');
    console.log('   Total employees:', dashboard.body.totalEmployees);
    console.log('   Employees by dept length:', dashboard.body.employeesByDepartment?.length);
    console.log('   Recent activity length:', dashboard.body.recentActivity?.length);
    if (!dashboard.body.employeesByDepartment || !dashboard.body.recentActivity) {
      throw new Error('Dashboard missing required arrays');
    }

    // 3. Create employee
    console.log('[Test] 3. Testing POST /api/v1/employees (mutation)...');
    const newEmp = await req('POST', '/api/v1/employees', {
      firstName: 'Темирлан',
      lastName: 'Сейтжанов',
      email: 't.seitzhanov@janapost.kz',
      jobTitle: 'Инженер автоматизации',
      departmentId: 'dept-2',
      phone: '+7 (705) 999-1122',
      startDate: '2026-10-17',
    });
    console.log('   Created employee ID:', newEmp.body.id, newEmp.body.employeeId);
    if (newEmp.status !== 201) throw new Error('Failed to create employee');

    // 4. Verify disk persistence
    console.log('[Test] 4. Verifying atomic write to database/data.json...');
    await wait(300);
    if (!fs.existsSync(dataPath)) throw new Error('data.json was not created on disk!');
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const savedDb = JSON.parse(fileContent);
    const foundEmp = savedDb.employees.find((e) => e.email === 't.seitzhanov@janapost.kz');
    if (!foundEmp) throw new Error('New employee was NOT persisted to data.json!');
    console.log('   ✅ Successfully verified on disk: Found', foundEmp.firstName, foundEmp.lastName);

    // 5. Test clock-in
    console.log('[Test] 5. Testing POST /api/v1/attendance/clock-in...');
    const login = await req('POST', '/api/v1/auth/login', { email: 't.seitzhanov@janapost.kz' });
    const token = login.body.token;
    const clockIn = await req('POST', '/api/v1/attendance/clock-in', { notes: 'Первый рабочий день' }, {
      Authorization: `Bearer ${token}`,
    });
    console.log('   Clock-in result:', clockIn.body.status, clockIn.body.workDate);
    if (clockIn.status !== 201) throw new Error('Clock-in failed');

    console.log('\n🎉 ALL PERSISTENCE AND LIVE API VERIFICATION TESTS PASSED!\n');
  } finally {
    server.kill();
  }
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
