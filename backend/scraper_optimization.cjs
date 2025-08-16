// Scraper Optimization System
// This module provides advanced optimization techniques for web scraping

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { createClient } = require('@supabase/supabase-js');

puppeteer.use(StealthPlugin());

class ScraperOptimizer {
  constructor() {
    this.browserPool = [];
    this.maxPoolSize = 3;
    this.requestQueue = [];
    this.isProcessing = false;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Browser Pool Management
  async getBrowser() {
    if (this.browserPool.length > 0) {
      return this.browserPool.pop();
    }
    
    if (this.browserPool.length < this.maxPoolSize) {
      const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
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
      });
      return browser;
    }
    
    // Wait for a browser to become available
    return new Promise((resolve) => {
      this.requestQueue.push(resolve);
    });
  }

  async releaseBrowser(browser) {
    if (this.requestQueue.length > 0) {
      const resolve = this.requestQueue.shift();
      resolve(browser);
    } else {
      this.browserPool.push(browser);
    }
  }

  // Intelligent Caching System
  getCacheKey(asin, region) {
    return `${asin}_${region}`;
  }

  getFromCache(asin, region) {
    const key = this.getCacheKey(asin, region);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`📦 Cache hit for ${asin} (${region})`);
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  setCache(asin, region, data) {
    const key = this.getCacheKey(asin, region);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`💾 Cached data for ${asin} (${region})`);
  }

  // Smart Retry Logic
  async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries} in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Resource Management
  async cleanup() {
    console.log('🧹 Cleaning up scraper resources...');
    
    // Close all browsers in pool
    for (const browser of this.browserPool) {
      try {
        await browser.close();
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
    
    this.browserPool = [];
    this.cache.clear();
    
    console.log('✅ Cleanup completed');
  }

  // Performance Monitoring
  startPerformanceTimer() {
    return {
      startTime: Date.now(),
      checkpoints: []
    };
  }

  addCheckpoint(timer, label) {
    const elapsed = Date.now() - timer.startTime;
    timer.checkpoints.push({ label, elapsed });
    console.log(`⏱️ ${label}: ${elapsed}ms`);
  }

  getPerformanceReport(timer) {
    const totalTime = Date.now() - timer.startTime;
    console.log(`📊 Performance Report - Total: ${totalTime}ms`);
    timer.checkpoints.forEach(checkpoint => {
      console.log(`  - ${checkpoint.label}: ${checkpoint.elapsed}ms`);
    });
    return { totalTime, checkpoints: timer.checkpoints };
  }
}

// Memory Management
class MemoryManager {
  constructor() {
    this.memoryThreshold = 500 * 1024 * 1024; // 500MB
    this.lastCleanup = Date.now();
    this.cleanupInterval = 5 * 60 * 1000; // 5 minutes
  }

  async checkMemoryUsage() {
    const usage = process.memoryUsage();
    const heapUsed = usage.heapUsed;
    
    console.log(`🧠 Memory Usage: ${Math.round(heapUsed / 1024 / 1024)}MB`);
    
    if (heapUsed > this.memoryThreshold) {
      console.log('⚠️ High memory usage detected, triggering cleanup...');
      await this.forceCleanup();
    }
    
    // Periodic cleanup
    if (Date.now() - this.lastCleanup > this.cleanupInterval) {
      await this.periodicCleanup();
      this.lastCleanup = Date.now();
    }
  }

  async forceCleanup() {
    console.log('🧹 Force cleanup initiated...');
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('🗑️ Garbage collection completed');
    }
    
    // Clear any caches
    if (global.scraperOptimizer) {
      global.scraperOptimizer.cache.clear();
    }
  }

  async periodicCleanup() {
    console.log('🔄 Periodic cleanup...');
    
    // Clear old cache entries
    if (global.scraperOptimizer) {
      const now = Date.now();
      for (const [key, value] of global.scraperOptimizer.cache.entries()) {
        if (now - value.timestamp > global.scraperOptimizer.cacheTimeout) {
          global.scraperOptimizer.cache.delete(key);
        }
      }
    }
  }
}

// Export the optimizer and memory manager
module.exports = {
  ScraperOptimizer,
  MemoryManager
};