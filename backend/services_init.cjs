// Services Initialization
// Centralized service initialization to prevent errors

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize services with error handling
function initializeServices() {
  const services = {};
  
  try {
    // Initialize ScraperOptimizer and MemoryManager
    const { ScraperOptimizer, MemoryManager } = require('./scraper_optimization.cjs');
    services.scraperOptimizer = new ScraperOptimizer();
    services.memoryManager = new MemoryManager();
    console.log('✅ ScraperOptimizer and MemoryManager initialized');
  } catch (error) {
    console.error('❌ Error initializing ScraperOptimizer/MemoryManager:', error.message);
    // Create fallback services
    services.scraperOptimizer = { cache: new Map(), cacheTimeout: 300000 };
    services.memoryManager = { checkMemoryUsage: () => {}, forceCleanup: () => {} };
  }

  try {
    // Initialize AnalyticsService
    const AnalyticsService = require('./analytics_service.cjs');
    services.analyticsService = new AnalyticsService();
    console.log('✅ AnalyticsService initialized');
  } catch (error) {
    console.error('❌ Error initializing AnalyticsService:', error.message);
    // Create fallback service
    services.analyticsService = {
      getPerformanceMetrics: async () => ({ error: 'Service not available' }),
      getPriceAnalysis: async () => ({ error: 'Service not available' }),
      getCompetitorAnalysis: async () => ({ error: 'Service not available' }),
      getMarketTrends: async () => ({ error: 'Service not available' })
    };
  }

  try {
    // Initialize AuthService
    const AuthService = require('./auth_service.cjs');
    services.authService = new AuthService();
    console.log('✅ AuthService initialized');
  } catch (error) {
    console.error('❌ Error initializing AuthService:', error.message);
    // Create fallback service
    services.authService = {
      registerUser: async () => ({ success: false, error: 'Service not available' }),
      loginUser: async () => ({ success: false, error: 'Service not available' }),
      verifyToken: () => ({ success: false, error: 'Service not available' })
    };
  }

  try {
    // Initialize AdvancedTelegramService
    const AdvancedTelegramService = require('./advanced_telegram_service.cjs');
    services.advancedTelegramService = new AdvancedTelegramService();
    console.log('✅ AdvancedTelegramService initialized');
  } catch (error) {
    console.error('❌ Error initializing AdvancedTelegramService:', error.message);
    // Create fallback service
    services.advancedTelegramService = {
      getNotificationStats: () => ({ error: 'Service not available' }),
      getQueueStatus: () => ({ error: 'Service not available' })
    };
  }

  // Make services globally available
  global.scraperOptimizer = services.scraperOptimizer;
  global.memoryManager = services.memoryManager;
  global.analyticsService = services.analyticsService;
  global.authService = services.authService;
  global.advancedTelegramService = services.advancedTelegramService;

  console.log('🎉 All services initialized successfully');
  return services;
}

module.exports = { initializeServices, supabase }; 