// Price Monitor Configuration
// This file contains all configurable settings for the price monitoring service

module.exports = {
  // Timing Configuration
  timing: {
    // Interval between monitoring cycles (in milliseconds)
    monitoringInterval: 300 * 1000, // 5 minutes
    
    // Delay between processing different products (in milliseconds)
    delayBetweenProducts: 5000, // 5 seconds
    
    // Delay after processing each product (in milliseconds)
    delayAfterProduct: 3000, // 3 seconds
    
    // Delay after errors (in milliseconds)
    delayAfterError: 3000, // 3 seconds
  },

  // Browser Configuration
  browser: {
    // Browser launch options
    headless: false,
    slowMo: 50,
    defaultViewport: null,
    
    // Browser arguments
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--window-size=800,600',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
  },

  // Validation Configuration
  validation: {
    // Minimum price change percentage to trigger alerts
    minPriceChangeThreshold: 5.0, // 5%
    
    // Maximum retries for failed scraping attempts
    maxRetries: 3,
    
    // Timeout for page loading (in milliseconds)
    pageTimeout: 30000, // 30 seconds
    
    // Timeout for selector waiting (in milliseconds)
    selectorTimeout: 15000, // 15 seconds
  },

  // Logging Configuration
  logging: {
    // Enable detailed logging
    detailed: true,
    
    // Log session IDs
    sessionIds: true,
    
    // Log validation steps
    validation: true,
    
    // Log Telegram alerts
    telegramAlerts: true
  },

  // Telegram Configuration
  telegram: {
    // Enable Telegram alerts
    enabled: true,
    
    // Validate data before sending alerts
    validateBeforeSending: true,
    
    // Minimum data quality for alerts
    minDataQuality: {
      requireValidTitle: true,
      requireValidPrice: true,
      requireValidSeller: true
    }
  },

  // Database Configuration
  database: {
    // Enable upsert fallback
    enableUpsertFallback: true,
    
    // Retry failed database operations
    retryFailedOperations: true,
    
    // Maximum retries for database operations
    maxDatabaseRetries: 3
  },

  // Performance Configuration
  performance: {
    // Process products sequentially (true) or in parallel (false)
    sequentialProcessing: true,
    
    // Close browser after each product (helps prevent conflicts)
    closeBrowserAfterProduct: false,
    
    // Reinitialize browser on errors
    reinitializeOnError: true,
    
    // Memory cleanup interval (in milliseconds)
    memoryCleanupInterval: 60000 // 1 minute
  }
}; 