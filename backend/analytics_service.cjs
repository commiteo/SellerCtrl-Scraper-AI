// Advanced Analytics Service
// Provides comprehensive analytics and insights for the scraping system

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8';
const supabase = createClient(supabaseUrl, supabaseKey);

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  // Performance Analytics
  async getPerformanceMetrics(days = 7) {
    const cacheKey = `performance_${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get scraping statistics
      const { data: amazonScraping, error: amazonError } = await supabase
        .from('amazon_scraping_history')
        .select('*')
        .gte('scraped_at', startDate.toISOString());

      const { data: noonScraping, error: noonError } = await supabase
        .from('noon_scraping_history')
        .select('*')
        .gte('scraped_at', startDate.toISOString());

      if (amazonError || noonError) {
        throw new Error('Failed to fetch scraping data');
      }

      const allScraping = [...(amazonScraping || []), ...(noonScraping || [])];

      // Calculate metrics
      const totalScrapes = allScraping.length;
      const successfulScrapes = allScraping.filter(s => s.status === 'success').length;
      const successRate = totalScrapes > 0 ? (successfulScrapes / totalScrapes) * 100 : 0;

      // Daily breakdown
      const dailyStats = this.calculateDailyStats(allScraping, days);

      // Data source analysis
      const dataSourceStats = this.analyzeDataSources(allScraping);

      // Error analysis
      const errorAnalysis = this.analyzeErrors(allScraping);

      const metrics = {
        totalScrapes,
        successfulScrapes,
        successRate: Math.round(successRate * 100) / 100,
        dailyStats,
        dataSourceStats,
        errorAnalysis,
        period: `${days} days`
      };

      this.setCache(cacheKey, metrics);
      return metrics;

    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  }

  // Price Analysis
  async getPriceAnalysis(days = 30) {
    const cacheKey = `price_analysis_${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get price history
      const { data: priceHistory, error: priceError } = await supabase
        .from('price_history')
        .select('*')
        .gte('scraped_at', startDate.toISOString());

      if (priceError) {
        throw new Error('Failed to fetch price history');
      }

      // Analyze price changes
      const priceChanges = this.analyzePriceChanges(priceHistory || []);
      
      // Price volatility analysis
      const volatility = this.calculatePriceVolatility(priceHistory || []);
      
      // Best/worst performing products
      const topPerformers = this.getTopPerformers(priceHistory || []);

      const analysis = {
        totalPriceRecords: priceHistory?.length || 0,
        priceChanges,
        volatility,
        topPerformers,
        period: `${days} days`
      };

      this.setCache(cacheKey, analysis);
      return analysis;

    } catch (error) {
      console.error('Error getting price analysis:', error);
      throw error;
    }
  }

  // Competitor Analysis
  async getCompetitorAnalysis(days = 7) {
    const cacheKey = `competitor_analysis_${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get seller information
      const { data: sellerInfo, error: sellerError } = await supabase
        .from('seller_info')
        .select('*')
        .gte('scraped_at', startDate.toISOString());

      if (sellerError) {
        throw new Error('Failed to fetch seller data');
      }

      // Analyze competitors
      const competitorStats = this.analyzeCompetitors(sellerInfo || []);
      
      // Buy Box analysis
      const buyBoxAnalysis = this.analyzeBuyBox(sellerInfo || []);
      
      // Top competitors
      const topCompetitors = this.getTopCompetitors(sellerInfo || []);

      const analysis = {
        totalSellerRecords: sellerInfo?.length || 0,
        competitorStats,
        buyBoxAnalysis,
        topCompetitors,
        period: `${days} days`
      };

      this.setCache(cacheKey, analysis);
      return analysis;

    } catch (error) {
      console.error('Error getting competitor analysis:', error);
      throw error;
    }
  }

  // Market Trends
  async getMarketTrends(days = 30) {
    const cacheKey = `market_trends_${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get all relevant data
      const [amazonData, noonData, priceData, sellerData] = await Promise.all([
        supabase.from('amazon_scraping_history').select('*').gte('scraped_at', startDate.toISOString()),
        supabase.from('noon_scraping_history').select('*').gte('scraped_at', startDate.toISOString()),
        supabase.from('price_history').select('*').gte('scraped_at', startDate.toISOString()),
        supabase.from('seller_info').select('*').gte('scraped_at', startDate.toISOString())
      ]);

      // Analyze trends
      const priceTrends = this.analyzePriceTrends(priceData.data || []);
      const marketActivity = this.analyzeMarketActivity([
        ...(amazonData.data || []),
        ...(noonData.data || [])
      ]);
      const sellerTrends = this.analyzeSellerTrends(sellerData.data || []);

      const trends = {
        priceTrends,
        marketActivity,
        sellerTrends,
        period: `${days} days`
      };

      this.setCache(cacheKey, trends);
      return trends;

    } catch (error) {
      console.error('Error getting market trends:', error);
      throw error;
    }
  }

  // Helper Methods
  calculateDailyStats(scrapingData, days) {
    const dailyStats = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayData = scrapingData.filter(s => 
        s.scraped_at.startsWith(dateKey)
      );
      
      dailyStats[dateKey] = {
        total: dayData.length,
        successful: dayData.filter(s => s.status === 'success').length,
        failed: dayData.filter(s => s.status !== 'success').length
      };
    }
    
    return dailyStats;
  }

  analyzeDataSources(scrapingData) {
    const sources = {};
    
    scrapingData.forEach(item => {
      const source = item.data_source || 'unknown';
      if (!sources[source]) {
        sources[source] = { total: 0, successful: 0 };
      }
      sources[source].total++;
      if (item.status === 'success') {
        sources[source].successful++;
      }
    });
    
    // Calculate success rates
    Object.keys(sources).forEach(source => {
      sources[source].successRate = 
        (sources[source].successful / sources[source].total) * 100;
    });
    
    return sources;
  }

  analyzeErrors(scrapingData) {
    const errors = {};
    
    scrapingData.forEach(item => {
      if (item.status !== 'success') {
        const errorType = item.error_message || 'unknown_error';
        errors[errorType] = (errors[errorType] || 0) + 1;
      }
    });
    
    return errors;
  }

  analyzePriceChanges(priceHistory) {
    const changes = {
      increases: 0,
      decreases: 0,
      noChange: 0,
      averageChange: 0
    };
    
    let totalChange = 0;
    let changeCount = 0;
    
    // Group by product and analyze changes
    const productGroups = {};
    priceHistory.forEach(record => {
      if (!productGroups[record.asin]) {
        productGroups[record.asin] = [];
      }
      productGroups[record.asin].push(record);
    });
    
    Object.values(productGroups).forEach(productRecords => {
      productRecords.sort((a, b) => new Date(a.scraped_at) - new Date(b.scraped_at));
      
      for (let i = 1; i < productRecords.length; i++) {
        const change = productRecords[i].price - productRecords[i-1].price;
        totalChange += change;
        changeCount++;
        
        if (change > 0) changes.increases++;
        else if (change < 0) changes.decreases++;
        else changes.noChange++;
      }
    });
    
    changes.averageChange = changeCount > 0 ? totalChange / changeCount : 0;
    return changes;
  }

  calculatePriceVolatility(priceHistory) {
    const productVolatility = {};
    
    // Group by product
    const productGroups = {};
    priceHistory.forEach(record => {
      if (!productGroups[record.asin]) {
        productGroups[record.asin] = [];
      }
      productGroups[record.asin].push(record.price);
    });
    
    Object.entries(productGroups).forEach(([asin, prices]) => {
      if (prices.length > 1) {
        const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
        const volatility = Math.sqrt(variance);
        
        productVolatility[asin] = {
          volatility,
          priceRange: Math.max(...prices) - Math.min(...prices),
          priceCount: prices.length
        };
      }
    });
    
    return productVolatility;
  }

  getTopPerformers(priceHistory) {
    const productPerformance = {};
    
    // Group by product
    const productGroups = {};
    priceHistory.forEach(record => {
      if (!productGroups[record.asin]) {
        productGroups[record.asin] = [];
      }
      productGroups[record.asin].push(record);
    });
    
    Object.entries(productGroups).forEach(([asin, records]) => {
      if (records.length > 1) {
        records.sort((a, b) => new Date(a.scraped_at) - new Date(b.scraped_at));
        const firstPrice = records[0].price;
        const lastPrice = records[records.length - 1].price;
        const change = ((lastPrice - firstPrice) / firstPrice) * 100;
        
        productPerformance[asin] = {
          change,
          firstPrice,
          lastPrice,
          records: records.length
        };
      }
    });
    
    // Sort by performance
    const sorted = Object.entries(productPerformance)
      .sort(([,a], [,b]) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 10);
    
    return sorted.map(([asin, data]) => ({ asin, ...data }));
  }

  analyzeCompetitors(sellerInfo) {
    const competitors = {};
    
    sellerInfo.forEach(record => {
      if (record.seller_name) {
        if (!competitors[record.seller_name]) {
          competitors[record.seller_name] = {
            appearances: 0,
            buyBoxWins: 0,
            products: new Set()
          };
        }
        
        competitors[record.seller_name].appearances++;
        competitors[record.seller_name].products.add(record.asin);
        
        if (record.has_buybox) {
          competitors[record.seller_name].buyBoxWins++;
        }
      }
    });
    
    // Convert to array and calculate metrics
    return Object.entries(competitors).map(([name, data]) => ({
      name,
      appearances: data.appearances,
      buyBoxWins: data.buyBoxWins,
      buyBoxRate: (data.buyBoxWins / data.appearances) * 100,
      uniqueProducts: data.products.size
    }));
  }

  analyzeBuyBox(sellerInfo) {
    const buyBoxStats = {
      totalRecords: sellerInfo.length,
      buyBoxWins: sellerInfo.filter(s => s.has_buybox).length,
      buyBoxRate: 0,
      topBuyBoxSellers: []
    };
    
    buyBoxStats.buyBoxRate = (buyBoxStats.buyBoxWins / buyBoxStats.totalRecords) * 100;
    
    // Find top Buy Box sellers
    const sellerBuyBoxCounts = {};
    sellerInfo.forEach(record => {
      if (record.has_buybox && record.seller_name) {
        sellerBuyBoxCounts[record.seller_name] = (sellerBuyBoxCounts[record.seller_name] || 0) + 1;
      }
    });
    
    buyBoxStats.topBuyBoxSellers = Object.entries(sellerBuyBoxCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    
    return buyBoxStats;
  }

  getTopCompetitors(sellerInfo) {
    const competitorCounts = {};
    
    sellerInfo.forEach(record => {
      if (record.seller_name) {
        competitorCounts[record.seller_name] = (competitorCounts[record.seller_name] || 0) + 1;
      }
    });
    
    return Object.entries(competitorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }

  analyzePriceTrends(priceHistory) {
    // Group by date and calculate average prices
    const dailyPrices = {};
    
    priceHistory.forEach(record => {
      const date = record.scraped_at.split('T')[0];
      if (!dailyPrices[date]) {
        dailyPrices[date] = [];
      }
      dailyPrices[date].push(record.price);
    });
    
    // Calculate daily averages
    const trends = Object.entries(dailyPrices).map(([date, prices]) => ({
      date,
      averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      priceCount: prices.length
    }));
    
    return trends.sort((a, b) => a.date.localeCompare(b.date));
  }

  analyzeMarketActivity(scrapingData) {
    const activity = {
      totalScrapes: scrapingData.length,
      uniqueProducts: new Set(scrapingData.map(s => s.asin)).size,
      dataSources: {},
      regions: {}
    };
    
    // Analyze data sources
    scrapingData.forEach(item => {
      const source = item.data_source || 'unknown';
      activity.dataSources[source] = (activity.dataSources[source] || 0) + 1;
      
      const region = item.region || 'unknown';
      activity.regions[region] = (activity.regions[region] || 0) + 1;
    });
    
    return activity;
  }

  analyzeSellerTrends(sellerInfo) {
    const trends = {
      totalSellers: new Set(sellerInfo.map(s => s.seller_name).filter(Boolean)).size,
      buyBoxChanges: 0,
      newSellers: 0
    };
    
    // Group by product and analyze changes
    const productGroups = {};
    sellerInfo.forEach(record => {
      if (!productGroups[record.asin]) {
        productGroups[record.asin] = [];
      }
      productGroups[record.asin].push(record);
    });
    
    Object.values(productGroups).forEach(productRecords => {
      productRecords.sort((a, b) => new Date(a.scraped_at) - new Date(b.scraped_at));
      
      for (let i = 1; i < productRecords.length; i++) {
        const prev = productRecords[i-1];
        const curr = productRecords[i];
        
        if (prev.has_buybox !== curr.has_buybox) {
          trends.buyBoxChanges++;
        }
      }
    });
    
    return trends;
  }

  // Cache Management
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = AnalyticsService;