// API Configuration for SellerCtrl Scraper
export const API_CONFIG = {
  // Dynamic API base URL based on environment
  BASE_URL: import.meta.env.VITE_API_URL || 
           import.meta.env.VITE_BACKEND_URL || 
           (import.meta.env.PROD ? 'http://91.108.112.75:3002' : 'http://localhost:3002'),
  
  // API Endpoints
  ENDPOINTS: {
    // Price Monitor
    PRICE_MONITOR_STATUS: '/api/price-monitor/status',
    PRICE_MONITOR_START: '/api/price-monitor/start',
    PRICE_MONITOR_STOP: '/api/price-monitor/stop',
    PRICE_MONITOR_RUN_CYCLE: '/api/price-monitor/run-cycle',
    
    // Scraping
    SCRAPE_PRODUCT: '/api/scrape-product',
    ADD_PRODUCT_IMMEDIATELY: '/api/add-product-immediately',
    AMAZON_SCRAPE: '/api/scrape',
    NOON_SCRAPE: '/api/noon-scrape',
    MULTI_DOMAIN_SCRAPE: '/api/multi-domain-scrape',
    PARALLEL_MULTI_DOMAIN_SCRAPE: '/api/parallel-multi-domain-scrape',
    CREW_PARALLEL_SCRAPE: '/api/crew-parallel-scrape',
    CRAWL: '/api/crawl',
    
    // Analytics
    ANALYTICS_PERFORMANCE: '/api/analytics/performance',
    ANALYTICS_PRICE_ANALYSIS: '/api/analytics/price-analysis',
    ANALYTICS_COMPETITOR_ANALYSIS: '/api/analytics/competitor-analysis',
    
    // Seller Info
    SELLER_INFO_ALL: '/api/seller-info/all',
    
    // Sync
    SYNC_COMPETITORS: '/api/sync-competitors'
  },
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Default timeout
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  
  // Scraping timeout (longer for complex operations)
  SCRAPING_TIMEOUT: 120000, // 2 minutes
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function for API calls
export const apiCall = async (
  endpoint: string, 
  options: RequestInit = {}, 
  timeout: number = API_CONFIG.DEFAULT_TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(buildApiUrl(endpoint), {
      ...options,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Export for backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;
