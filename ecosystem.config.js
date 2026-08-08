module.exports = {
  apps: [
    {
      name: 'gov-schemes-backend',
      script: './backend/src/index.js',
      cwd: '/Users/chetanya/Documents/college_final_project',
      instances: 1,
      exec_mode: 'fork',

      // Auto restart on crash
      autorestart: true,
      watch: ['backend/src'],
      ignore_watch: ['backend/node_modules', 'backend/.env'],

      // Auto restart on file change
      max_memory_restart: '500M',

      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 5001,
        HOST: '127.0.0.1'
      },

      // Error & output logs
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,

      // Auto increment port if 5001 is in use
      port: 5001,

      // Restart strategies
      max_restarts: 10,
      min_uptime: '10s',
    },
    {
      name: 'gov-schemes-frontend',
      script: 'vite',
      cwd: '/Users/chetanya/Documents/college_final_project/frontend',
      instances: 1,

      // Auto restart on crash
      autorestart: true,
      watch: ['src', 'public'],
      ignore_watch: ['node_modules', 'dist'],

      // Environment
      env: {
        NODE_ENV: 'development'
      },

      // Logs
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Graceful shutdown
      kill_timeout: 5000,

      // Restart strategies
      max_restarts: 10,
      min_uptime: '10s',
    }
  ],

  // Cluster mode config
  deploy: {
    production: {
      user: 'node',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/college_final_project.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
