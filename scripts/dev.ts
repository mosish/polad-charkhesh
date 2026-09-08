import { spawn } from 'node:child_process';
const children = [
  spawn(
    process.execPath,
    ['node_modules/tsx/dist/cli.mjs', 'watch', 'api/index.ts'],
    { stdio: 'inherit' },
  ),
  spawn(
    process.execPath,
    ['node_modules/vite/bin/vite.js', '--config', 'vite.vps.config.ts'],
    { stdio: 'inherit' },
  ),
];
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.on(signal, () => {
    children.forEach((c) => c.kill());
    process.exit();
  });
