import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = path.join(root, 'backend');
const frontendDir = path.join(root, 'frontend');
const viteBin = path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js');

const children = [];

function start(name, cmd, args, cwd) {
  const child = spawn(cmd, args, {
    cwd,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env },
  });
  child.on('exit', (code) => {
    console.log(`[${name}] stopped (exit code ${code ?? 'signal'}).`);
  });
  children.push(child);
  return child;
}

start('backend', process.execPath, ['--watch', 'index.js'], backendDir);
start('frontend', process.execPath, [viteBin], frontendDir);

console.log('');
console.log('MConnect dev servers starting:');
console.log('  API    -> http://localhost:3002');
console.log('  Web    -> http://localhost:5173');
console.log('Press Ctrl+C to stop both.');
console.log('');

function shutdown() {
  for (const child of children) {
    try {
      child.kill('SIGTERM');
    } catch {
      // already exited
    }
  }
  setTimeout(() => process.exit(0), 100);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
