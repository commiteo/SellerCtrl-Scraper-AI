module.exports = {
  apps: [
    {
      name: 'asin-oracle-backend',
      script: 'backend/server.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        API_PORT: 3002,
        PORT: 3002
      }
    },
    {
      name: 'asin-oracle-scraper',
      script: 'backend/scraper-server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
}; 