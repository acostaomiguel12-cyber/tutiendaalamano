// Libera un puerto matando el proceso que lo escucha (dev local).
// Uso: node scripts/free-port.mjs 4001
import { execSync } from 'node:child_process';

const port = Number(process.argv[2] || 4001);

function windowsKill() {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split('\n')) {
      if (!line.includes('LISTENING')) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') pids.add(pid);
    }
    for (const pid of pids) {
      if (Number(pid) === process.pid) continue;
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`[free-port] PID ${pid} liberado del puerto ${port}`);
      } catch {
        // ya murió o sin permiso
      }
    }
  } catch {
    // sin coincidencias: puerto libre
  }
}

function posixKill() {
  try {
    const out = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' });
    for (const pid of out.split('\n')) {
      const p = pid.trim();
      if (p && Number(p) !== process.pid) {
        try {
          execSync(`kill -9 ${p}`, { stdio: 'ignore' });
          console.log(`[free-port] PID ${p} liberado del puerto ${port}`);
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // puerto libre
  }
}

if (process.platform === 'win32') windowsKill();
else posixKill();
