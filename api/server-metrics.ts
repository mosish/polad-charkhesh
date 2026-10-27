import os from 'node:os';
import path from 'node:path';
import { statfs } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { db } from './database';
import type { ServerMetrics } from '../domain/dashboard';

function cpuTotals() {
  return os.cpus().reduce(
    (result, cpu) => {
      result.idle += cpu.times.idle;
      result.total += Object.values(cpu.times).reduce(
        (sum, time) => sum + time,
        0,
      );
      return result;
    },
    { idle: 0, total: 0 },
  );
}
let previous = { ...cpuTotals(), at: performance.now() };
let cpuPercent: number | null = null;
export async function serverMetrics(): Promise<ServerMetrics> {
  db.prepare('SELECT 1').get();
  const at = performance.now();
  if (at - previous.at >= 1000) {
    const current = cpuTotals(),
      elapsed = current.total - previous.total;
    cpuPercent =
      elapsed > 0
        ? Math.max(
            0,
            Math.min(100, 100 * (1 - (current.idle - previous.idle) / elapsed)),
          )
        : null;
    previous = { ...current, at };
  }
  let disk: ServerMetrics['disk'] = null;
  try {
    const space = await statfs(
      path.dirname(
        process.env.DATABASE_PATH || path.resolve('data/platform.sqlite'),
      ),
    );
    if (space.blocks > 0 && space.bsize > 0)
      disk = {
        totalBytes: space.blocks * space.bsize,
        availableBytes: space.bavail * space.bsize,
      };
  } catch {
    /* A restricted/unsupported filesystem is unavailable, never zero usage. */
  }
  return {
    application: 'online',
    database: 'connected',
    applicationUptimeSeconds: Math.floor(process.uptime()),
    serverUptimeSeconds: Math.floor(os.uptime()),
    cpuPercent,
    cpuCores: os.cpus().length,
    memory: {
      totalBytes: os.totalmem(),
      availableBytes: os.freemem(),
      processBytes: process.memoryUsage().rss,
    },
    disk,
  };
}
