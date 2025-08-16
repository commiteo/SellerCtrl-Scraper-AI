// Advanced Telegram Service
// Provides intelligent notifications and message formatting

const TelegramService = require('./telegram_service.cjs');

class AdvancedTelegramService extends TelegramService {
  constructor() {
    super();
    this.notificationQueue = [];
    this.isProcessingQueue = false;
    this.messageTemplates = this.initializeMessageTemplates();
    this.userPreferences = new Map();
    this.notificationHistory = [];
  }

  // Initialize message templates
  initializeMessageTemplates() {
    return {
      priceChange: {
        increase: {
          title: '📈 Price Increased',
          template: 'The price of {product} has increased by {change}% to {newPrice}',
          emoji: '📈'
        },
        decrease: {
          title: '📉 Price Decreased',
          template: 'Great news! The price of {product} has decreased by {change}% to {newPrice}',
          emoji: '📉'
        }
      },
      buyBoxChange: {
        won: {
          title: '🎉 Buy Box Won!',
          template: 'Congratulations! You now own the Buy Box for {product}',
          emoji: '🎉'
        },
        lost: {
          title: '⚠️ Buy Box Lost',
          template: 'You lost the Buy Box for {product} to {competitor}',
          emoji: '⚠️'
        }
      },
      competitorAlert: {
        title: '🏪 New Competitor',
        template: 'New competitor detected for {product}: {competitor} at {price}',
        emoji: '🏪'
      },
      systemAlert: {
        title: '🔧 System Alert',
        template: '{message}',
        emoji: '🔧'
      }
    };
  }

  // Queue notification for processing
  async queueNotification(notification) {
    this.notificationQueue.push({
      ...notification,
      timestamp: Date.now(),
      id: this.generateNotificationId()
    });

    if (!this.isProcessingQueue) {
      this.processNotificationQueue();
    }
  }

  // Process notification queue
  async processNotificationQueue() {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      
      try {
        await this.sendAdvancedNotification(notification);
        
        // Add to history
        this.notificationHistory.push(notification);
        
        // Keep only last 100 notifications
        if (this.notificationHistory.length > 100) {
          this.notificationHistory.shift();
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error('Error processing notification:', error);
        
        // Re-queue if it's a temporary error
        if (this.isTemporaryError(error)) {
          this.notificationQueue.unshift(notification);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    this.isProcessingQueue = false;
  }

  // Send advanced notification with formatting
  async sendAdvancedNotification(notification) {
    const { type, data, priority = 'normal' } = notification;
    
    // Check user preferences
    const userPrefs = this.getUserPreferences(data.userId);
    if (userPrefs && !userPrefs.enabled) {
      return;
    }

    // Format message
    const formattedMessage = this.formatNotificationMessage(type, data);
    
    // Add priority indicators
    const priorityIndicator = this.getPriorityIndicator(priority);
    const finalMessage = `${priorityIndicator}${formattedMessage}`;

    // Send with retry logic
    await this.sendWithRetry(finalMessage, data.chatId);
  }

  // Format notification message
  formatNotificationMessage(type, data) {
    const template = this.messageTemplates[type];
    if (!template) {
      return `Unknown notification type: ${type}`;
    }

    let message = template.template;
    
    // Replace placeholders
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      if (message.includes(placeholder)) {
        message = message.replace(placeholder, data[key]);
      }
    });

    return `${template.emoji} ${template.title}\n\n${message}`;
  }

  // Get priority indicator
  getPriorityIndicator(priority) {
    const indicators = {
      low: '🔵 ',
      normal: '⚪ ',
      high: '🟡 ',
      urgent: '🔴 '
    };
    return indicators[priority] || indicators.normal;
  }

  // Send with retry logic
  async sendWithRetry(message, chatId, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.sendMessage(message, chatId);
        return;
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Check if error is temporary
  isTemporaryError(error) {
    const temporaryErrors = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'rate limit',
      'temporary'
    ];
    
    return temporaryErrors.some(tempError => 
      error.message.toLowerCase().includes(tempError.toLowerCase())
    );
  }

  // Generate unique notification ID
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Price change notification
  async sendPriceChangeNotification(productData) {
    const { asin, title, oldPrice, newPrice, region, userId, chatId } = productData;
    
    const change = ((newPrice - oldPrice) / oldPrice) * 100;
    const changeType = change > 0 ? 'increase' : 'decrease';
    
    const notification = {
      type: 'priceChange',
      data: {
        product: title || asin,
        change: Math.abs(change).toFixed(2),
        newPrice: this.formatPrice(newPrice, region),
        oldPrice: this.formatPrice(oldPrice, region),
        region,
        userId,
        chatId
      },
      priority: Math.abs(change) > 10 ? 'high' : 'normal'
    };

    await this.queueNotification(notification);
  }

  // Buy Box change notification
  async sendBuyBoxChangeNotification(buyBoxData) {
    const { asin, title, oldSeller, newSeller, hasBuyBox, userId, chatId } = buyBoxData;
    
    const changeType = hasBuyBox ? 'won' : 'lost';
    
    const notification = {
      type: 'buyBoxChange',
      data: {
        product: title || asin,
        competitor: newSeller,
        oldSeller,
        userId,
        chatId
      },
      priority: 'high'
    };

    await this.queueNotification(notification);
  }

  // Competitor alert notification
  async sendCompetitorAlertNotification(competitorData) {
    const { asin, title, competitor, price, region, userId, chatId } = competitorData;
    
    const notification = {
      type: 'competitorAlert',
      data: {
        product: title || asin,
        competitor,
        price: this.formatPrice(price, region),
        region,
        userId,
        chatId
      },
      priority: 'normal'
    };

    await this.queueNotification(notification);
  }

  // System alert notification
  async sendSystemAlertNotification(alertData) {
    const { message, priority = 'normal', userId, chatId } = alertData;
    
    const notification = {
      type: 'systemAlert',
      data: {
        message,
        userId,
        chatId
      },
      priority
    };

    await this.queueNotification(notification);
  }

  // Format price with currency
  formatPrice(price, region) {
    const currencies = {
      'eg': 'EGP',
      'sa': 'SAR',
      'ae': 'AED',
      'us': 'USD',
      'de': 'EUR'
    };
    
    const currency = currencies[region] || 'USD';
    return `${price.toFixed(2)} ${currency}`;
  }

  // User preferences management
  setUserPreferences(userId, preferences) {
    this.userPreferences.set(userId, {
      ...this.getUserPreferences(userId),
      ...preferences
    });
  }

  getUserPreferences(userId) {
    return this.userPreferences.get(userId) || {
      enabled: true,
      priceAlerts: true,
      buyBoxAlerts: true,
      competitorAlerts: true,
      systemAlerts: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };
  }

  // Check if notification should be sent based on quiet hours
  isInQuietHours(userId) {
    const prefs = this.getUserPreferences(userId);
    if (!prefs.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = prefs.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = prefs.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight quiet hours
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Get notification statistics
  getNotificationStats() {
    const stats = {
      totalSent: this.notificationHistory.length,
      byType: {},
      byPriority: {},
      recentActivity: []
    };

    this.notificationHistory.forEach(notification => {
      // Count by type
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      
      // Count by priority
      stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
      
      // Recent activity (last 24 hours)
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      if (notification.timestamp > oneDayAgo) {
        stats.recentActivity.push(notification);
      }
    });

    return stats;
  }

  // Bulk notification
  async sendBulkNotification(notifications) {
    const results = [];
    
    for (const notification of notifications) {
      try {
        await this.queueNotification(notification);
        results.push({ success: true, id: notification.id });
      } catch (error) {
        results.push({ success: false, id: notification.id, error: error.message });
      }
    }
    
    return results;
  }

  // Scheduled notifications
  async scheduleNotification(notification, delayMs) {
    setTimeout(async () => {
      await this.queueNotification(notification);
    }, delayMs);
  }

  // Cancel scheduled notification
  cancelScheduledNotification(notificationId) {
    // Implementation would depend on how you store scheduled notifications
    console.log(`Cancelled scheduled notification: ${notificationId}`);
  }

  // Export notification history
  exportNotificationHistory(format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(this.notificationHistory, null, 2);
      case 'csv':
        return this.convertToCSV(this.notificationHistory);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  // Convert to CSV
  convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }

  // Clear notification history
  clearNotificationHistory() {
    this.notificationHistory = [];
  }

  // Get queue status
  getQueueStatus() {
    return {
      queueLength: this.notificationQueue.length,
      isProcessing: this.isProcessingQueue,
      historyLength: this.notificationHistory.length
    };
  }
}

module.exports = AdvancedTelegramService;