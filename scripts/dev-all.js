#!/usr/bin/env node
import { spawn } from 'child_process';
import process from 'process';

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('----------------------------------------------------');
console.log('🚀 Digital HR by Jana Post — Starting Full Stack Dev');
console.log('   • Backend API:  http://localhost:3000/api/v1');
console.log('   • Frontend Web: http://localhost:5173');
console.log('   • Mode:         LIVE REST API with Disk Persistence');
console.log('----------------------------------------------------\n');

// 1. Launch Backend Server
const server = spawn(npmCmd, ['run', 'server'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: isWindows,
  env: { ...process.env, FORCE_COLOR: '1' },
});

server.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.log(`\x1b[36m[Backend]\x1b[0m ${line}`);
  });
});

server.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.error(`\x1b[31m[Backend Error]\x1b[0m ${line}`);
  });
});

// 2. Launch Vite Frontend Dev Server
const vite = spawn(npmCmd, ['run', 'dev'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: isWindows,
  env: { ...process.env, FORCE_COLOR: '1' },
});

vite.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.log(`\x1b[32m[Frontend]\x1b[0m ${line}`);
  });
});

vite.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.error(`\x1b[33m[Frontend Warn]\x1b[0m ${line}`);
  });
});

// Clean shutdown handler
const cleanShutdown = () => {
  console.log('\n🛑 Stopping Jana Post Full-Stack services...');
  try {
    if (isWindows) {
      if (server.pid) spawn('taskkill', ['/pid', server.pid.toString(), '/f', '/t']);
      if (vite.pid) spawn('taskkill', ['/pid', vite.pid.toString(), '/f', '/t']);
    } else {
      server.kill('SIGINT');
      vite.kill('SIGINT');
    }
  } catch {
    // ignore
  }
  process.exit(0);
};

process.on('SIGINT', cleanShutdown);
process.on('SIGTERM', cleanShutdown);
