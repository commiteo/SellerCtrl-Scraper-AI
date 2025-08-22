/**
 * Enhanced Rate Limiting Middleware
 * Protects against abuse and ensures fair usage with Redis support
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Redis configuration for distributed rate limiting
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});

// Fallback to memory store if Redis is not available
const createStore = () => {
  try {
    return new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    });
  } catch (error) {
    console.warn('Redis not available, using memory store for rate limiting');
    return undefined; // Use default memory store
  }
};

// Enhanced General API rate limiter
const generalLimiter = rateLimit({
  store: createStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Dynamic limits based on user authentication
    if (req.user && req.user.role === 'premium') return 500;
    if (req.user && req.user.role === 'admin') return 1000;
    return 100; // Default for unauthenticated users
  },
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
    limit: 'Rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    if (req.user && req.user.id) {
      return `user:${req.user.id}`;
    }
    return req.headers['x-forwarded-for'] || req.ip;
  },
  handler: (req, res) => {
    const resetTime = new Date(req.rateLimit.resetTime);
    res.status(429).json({
      error: 'Too many requests, please try again later.',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      resetTime: resetTime.toISOString()
    });
  }
});

// Enhanced Scraping-specific rate limiter
const scrapingLimiter = rateLimit({
  store: createStore(),
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: (req) => {
    // Dynamic limits based on user tier and time of day
    const hour = new Date().getHours();
    const isPeakHours = hour >= 9 && hour <= 17; // 9 AM to 5 PM
    
    if (req.user && req.user.role === 'premium') {
      return isPeakHours ? 30 : 50;
    }
    if (req.user && req.user.role === 'admin') {
      return 100;
    }
    return isPeakHours ? 10 : 20; // Reduced during peak hours
  },
  message: {
    error: 'Scraping rate limit exceeded. Please wait before trying again.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user.id) {
      return `scraping:user:${req.user.id}`;
    }
    return `scraping:${req.headers['x-forwarded-for'] || req.ip}`;
  },
  handler: (req, res) => {
    const resetTime = new Date(req.rateLimit.resetTime);
    res.status(429).json({
      error: 'Scraping rate limit exceeded. Please wait before trying again.',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      resetTime: resetTime.toISOString(),
      suggestion: 'Consider upgrading to premium for higher limits'
    });
  }
});

// Enhanced Amazon scraping rate limiter (very restrictive)
const amazonScrapingLimiter = rateLimit({
  store: createStore(),
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: (req) => {
    // Amazon has strict anti-bot measures
    if (req.user && req.user.role === 'premium') return 20;
    if (req.user && req.user.role === 'admin') return 50;
    return 5; // Very conservative for free users
  },
  message: {
    error: 'Amazon scraping limit reached. Please wait before trying again.',
    retryAfter: '10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user.id) {
      return `amazon:user:${req.user.id}`;
    }
    return `amazon:${req.headers['x-forwarded-for'] || req.ip}`;
  },
  handler: (req, res) => {
    const resetTime = new Date(req.rateLimit.resetTime);
    res.status(429).json({
      error: 'Amazon scraping limit reached. Please wait before trying again.',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      resetTime: resetTime.toISOString(),
      warning: 'Amazon has strict rate limits to prevent blocking'
    });
  }
});

// Enhanced Noon scraping rate limiter
const noonScrapingLimiter = rateLimit({
  store: createStore(),
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: (req) => {
    // Noon is more lenient than Amazon
    if (req.user && req.user.role === 'premium') return 40;
    if (req.user && req.user.role === 'admin') return 80;
    return 15; // Default for free users
  },
  message: {
    error: 'Noon scraping limit reached. Please wait before trying again.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user.id) {
      return `noon:user:${req.user.id}`;
    }
    return `noon:${req.headers['x-forwarded-for'] || req.ip}`;
  },
  handler: (req, res) => {
    const resetTime = new Date(req.rateLimit.resetTime);
    res.status(429).json({
      error: 'Noon scraping limit reached. Please wait before trying again.',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      resetTime: resetTime.toISOString()
    });
  }
});



// Enhanced Admin/management endpoints rate limiter
const adminLimiter = rateLimit({
  store: createStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Only authenticated admin users should access these endpoints
    if (req.user && req.user.role === 'admin') return 1000;
    if (req.user && req.user.role === 'premium') return 100;
    return 10; // Very limited for non-admin users
  },
  message: {
    error: 'Admin endpoint access limit reached.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user.id) {
      return `admin:user:${req.user.id}`;
    }
    return `admin:${req.headers['x-forwarded-for'] || req.ip}`;
  },
  handler: (req, res) => {
    const resetTime = new Date(req.rateLimit.resetTime);
    res.status(429).json({
      error: 'Admin endpoint access limit reached.',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      resetTime: resetTime.toISOString(),
      note: 'Admin access required for higher limits'
    });
  }
});

// Authentication rate limiter (for login attempts)
const authLimiter = rateLimit({
  store: createStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    error: 'Too many login attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use email from request body if available, otherwise IP
    const email = req.body?.email;
    if (email) {
      return `auth:email:${email}`;
    }
    return `auth:${req.headers['x-forwarded-for'] || req.ip}`;
  },
  handler: (req, res) => {
    const resetTime = new Date(req.rateLimit.resetTime);
    res.status(429).json({
      error: 'Too many login attempts. Please try again later.',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      resetTime: resetTime.toISOString(),
      suggestion: 'Use password reset if you forgot your password'
    });
  }
});

// API key rate limiter (for API access)
const apiKeyLimiter = rateLimit({
  store: createStore(),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    // Different limits based on API key tier
    const apiKeyTier = req.headers['x-api-tier'] || 'free';
    switch (apiKeyTier) {
      case 'enterprise': return 10000;
      case 'premium': return 5000;
      case 'standard': return 1000;
      default: return 100; // free tier
    }
  },
  keyGenerator: (req) => {
    const apiKey = req.headers['x-api-key'];
    return apiKey ? `api:${apiKey}` : `api:${req.ip}`;
  },
  handler: (req, res) => {
    const resetTime = new Date(req.rateLimit.resetTime);
    res.status(429).json({
      error: 'API rate limit exceeded.',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      resetTime: resetTime.toISOString(),
      upgrade: 'Consider upgrading your API plan for higher limits'
    });
  }
});

// Whitelist for trusted IPs (optional)
const whitelist = [
  '127.0.0.1', // localhost
  '::1', // localhost IPv6
  // Add your trusted IPs here
  // '192.168.1.100', // Example trusted IP
];

// Function to check if IP is whitelisted
const isWhitelisted = (ip) => {
  return whitelist.includes(ip);
};

// Create rate limiters with whitelist support
const createRateLimiter = (baseLimiter) => {
  return rateLimit({
    ...baseLimiter,
    skip: (req) => isWhitelisted(req.ip),
    keyGenerator: (req) => {
      // Use X-Forwarded-For header if available (for proxy support)
      return req.headers['x-forwarded-for'] || req.ip;
    }
  });
};

// Rate limiter statistics and monitoring
const getRateLimitStats = async () => {
  try {
    const stats = {};
    const keys = await redis.keys('rl:*');
    
    for (const key of keys.slice(0, 100)) { // Limit to prevent performance issues
      const ttl = await redis.ttl(key);
      const value = await redis.get(key);
      stats[key] = { value: parseInt(value) || 0, ttl };
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting rate limit stats:', error);
    return {};
  }
};

// Clear rate limit for specific key (admin function)
const clearRateLimit = async (key) => {
  try {
    await redis.del(`rl:${key}`);
    return true;
  } catch (error) {
    console.error('Error clearing rate limit:', error);
    return false;
  }
};

// Export rate limiters and utilities
module.exports = {
  // Rate limiters
  generalLimiter: createRateLimiter(generalLimiter),
  scrapingLimiter: createRateLimiter(scrapingLimiter),
  amazonScrapingLimiter: createRateLimiter(amazonScrapingLimiter),
  noonScrapingLimiter: createRateLimiter(noonScrapingLimiter),

  adminLimiter: createRateLimiter(adminLimiter),
  authLimiter: createRateLimiter(authLimiter),
  apiKeyLimiter: createRateLimiter(apiKeyLimiter),
  
  // Utilities
  isWhitelisted,
  getRateLimitStats,
  clearRateLimit,
  redis // Export redis instance for advanced usage
};