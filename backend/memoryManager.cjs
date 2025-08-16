/**
 * Memory Management System for Backend
 * Handles cleanup, memory monitoring, and resource management
 */

const fs = require('fs');
const path = require('path');

class MemoryManager {
  constructor() {
    this.tempFiles = new Set();
    this.browserInstances = new Set();
    this.cleanupInterval = null;
    this.maxMemoryUsage = 0.8; // 80% of available memory
  }

  /**
   * Start memory monitoring
   */
  startMonitoring() {
    // Monitor memory usage every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000);

    // Cleanup on process exit
    process.on('exit', () => this.cleanup());
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.cleanup();
      process.exit(1);
    });
  }

  /**
   * Check memory usage and trigger cleanup if needed
   */
  checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const memoryUsagePercent = memUsage.heapUsed / memUsage.heapTotal;

    console.log(`Memory Usage: ${(memoryUsagePercent * 100).toFixed(2)}%`);

    if (memoryUsagePercent > this.maxMemoryUsage) {
      console.warn('High memory usage detected, triggering cleanup...');
      this.forceCleanup();
    }
  }

  /**
   * Register a temporary file for cleanup
   */
  registerTempFile(filePath) {
    this.tempFiles.add(filePath);
    console.log(`Registered temp file: ${filePath}`);
  }

  /**
   * Register a browser instance for cleanup
   */
  registerBrowser(browser) {
    this.browserInstances.add(browser);
    console.log('Registered browser instance for cleanup');
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles() {
    const filesToDelete = Array.from(this.tempFiles);
    this.tempFiles.clear();

    for (const filePath of filesToDelete) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up temp file: ${filePath}`);
        }
      } catch (error) {
        console.error(`Failed to delete temp file ${filePath}:`, error.message);
      }
    }
  }

  /**
   * Clean up browser instances
   */
  async cleanupBrowsers() {
    const browsersToClose = Array.from(this.browserInstances);
    this.browserInstances.clear();

    for (const browser of browsersToClose) {
      try {
        if (browser && !browser.isConnected()) {
          await browser.close();
          console.log('Closed browser instance');
        }
      } catch (error) {
        console.error('Failed to close browser:', error.message);
      }
    }
  }

  /**
   * Force garbage collection if available
   */
  forceGarbageCollection() {
    if (global.gc) {
      global.gc();
      console.log('Forced garbage collection');
    }
  }

  /**
   * Perform full cleanup
   */
  async forceCleanup() {
    console.log('Starting forced cleanup...');
    
    await this.cleanupTempFiles();
    await this.cleanupBrowsers();
    this.forceGarbageCollection();
    
    console.log('Forced cleanup completed');
  }

  /**
   * Cleanup on shutdown
   */
  async cleanup() {
    console.log('Starting shutdown cleanup...');
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    await this.forceCleanup();
    console.log('Shutdown cleanup completed');
  }

  /**
   * Get memory statistics
   */
  getMemoryStats() {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
      external: Math.round(memUsage.external / 1024 / 1024) + ' MB',
      rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
      usagePercent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100) + '%'
    };
  }

  /**
   * Clean up debug files
   */
  cleanupDebugFiles() {
    const debugFiles = [
      'debug-screenshot.png',
      'debug-sidebar.html',
      'debug.html'
    ];

    debugFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          console.log(`Cleaned up debug file: ${file}`);
        }
      } catch (error) {
        console.error(`Failed to delete debug file ${file}:`, error.message);
      }
    });
  }
}

// Create singleton instance
const memoryManager = new MemoryManager();

module.exports = memoryManager; 