// PM2 process manager config — keeps OpenWA + text-back alive & auto-restarting.
// Usage:  pm2 start demo/missed-call-textback/ecosystem.config.js
//         pm2 save && pm2 startup     (survive server reboots)
const path = require('path');
const REPO = path.resolve(__dirname, '..', '..'); // repo root

module.exports = {
  apps: [
    {
      name: 'openwa-api',
      cwd: path.join(REPO, 'openwa'),
      script: 'npm',
      args: 'run start:prod',
      max_restarts: 20,
      restart_delay: 5000,
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'missed-call-textback',
      cwd: __dirname,
      script: 'server.js',
      max_restarts: 20,
      restart_delay: 3000,
      // env comes from ./.env (loaded by server.js)
    },
  ],
};
