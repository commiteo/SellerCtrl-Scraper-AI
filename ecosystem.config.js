module.exports = {
  apps: [
    {
      name: 'sellerctrl-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/var/www/sellerctrl',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    },
    {
      name: 'sellerctrl-backend',
      script: 'backend/server.cjs',
      cwd: '/var/www/sellerctrl',
      env: {
        NODE_ENV: 'production',
        API_PORT: 3002,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        SUPABASE_URL: 'https://aqkaxcwdcqnwzgvaqtne.supabase.co',
        SUPABASE_KEY: process.env.SUPABASE_KEY
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'sellerctrl-scraper',
      script: 'backend/scraper-server.js',
      cwd: '/var/www/sellerctrl',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        REDIS_HOST: process.env.REDIS_HOST || 'localhost',
        REDIS_PORT: process.env.REDIS_PORT || 6379,
        PUPPETEER_EXECUTABLE_PATH: '/usr/bin/chromium-browser'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      error_file: './logs/scraper-error.log',
      out_file: './logs/scraper-out.log',
      log_file: './logs/scraper-combined.log',
      time: true
    }
  ]
}; 