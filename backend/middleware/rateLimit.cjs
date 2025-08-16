/**
 * Rate Limiting Middleware
 * Protects against abuse and ensures fair usage
 */

const rateLimit = require('express-rate-limit');

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Scraping-specific rate limiter (more restrictive)
const scrapingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 scraping requests per 5 minutes
  message: {
    error: 'Too many scraping requests, please wait before trying again.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many scraping requests, please wait before trying again.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining
    });
  }
});

// Amazon scraping rate limiter (very restrictive)
const amazonScrapingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // limit each IP to 10 Amazon scraping requests per 10 minutes
  message: {
    error: 'Amazon scraping limit reached, please wait before trying again.',
    retryAfter: '10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Amazon scraping limit reached, please wait before trying again.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining
    });
  }
});

// Noon scraping rate limiter
const noonScrapingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // limit each IP to 15 Noon scraping requests per 5 minutes
  message: {
    error: 'Noon scraping limit reached, please wait before trying again.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Noon scraping limit reached, please wait before trying again.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining
    });
  }
});

// Crawl API rate limiter
const crawlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 crawl requests per 15 minutes
  message: {
    error: 'Crawl API limit reached, please wait before trying again.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Crawl API limit reached, please wait before trying again.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining
    });
  }
});

// Admin/management endpoints rate limiter (less restrictive)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 admin requests per 15 minutes
  message: {
    error: 'Too many admin requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many admin requests, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Whitelist for trusted IPs (optional)
const whitelist = [
  '127.0.0.1', // localhost
  '::1', // localhost IPv6
  // Add your trusted IPs here
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

// Export rate limiters
module.exports = {
  generalLimiter: createRateLimiter(generalLimiter),
  scrapingLimiter: createRateLimiter(scrapingLimiter),
  amazonScrapingLimiter: createRateLimiter(amazonScrapingLimiter),
  noonScrapingLimiter: createRateLimiter(noonScrapingLimiter),
  crawlLimiter: createRateLimiter(crawlLimiter),
  adminLimiter: createRateLimiter(adminLimiter),
  isWhitelisted
}; 