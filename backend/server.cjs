require('dotenv').config();
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Import enhanced rate limiting middleware - temporarily disabled
// const {
//   generalLimiter,
//   scrapingLimiter,
//   amazonScrapingLimiter,
//   noonScrapingLimiter,
//   adminLimiter,
//   authLimiter,
//   apiKeyLimiter,
//   getRateLimitStats,
//   clearRateLimit
// } = require('./middleware/rateLimit.cjs');

// Simple rate limiting fallback
const createSimpleLimiter = () => (req, res, next) => next();
const generalLimiter = createSimpleLimiter();
const scrapingLimiter = createSimpleLimiter();
const amazonScrapingLimiter = createSimpleLimiter();
const noonScrapingLimiter = createSimpleLimiter();
const adminLimiter = createSimpleLimiter();
const authLimiter = createSimpleLimiter();
const apiKeyLimiter = createSimpleLimiter();
const getRateLimitStats = () => ({});
const clearRateLimit = () => true;

const PORT = process.env.API_PORT || 3003;

const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Price Monitor Service
const PriceMonitorService = require('./price_monitor_service.cjs');
const priceMonitorService = new PriceMonitorService();

// Initialize Advanced Services with error handling
const { initializeServices } = require('./services_init.cjs');
const services = initializeServices();

// Extract services for easier access
const scraperOptimizer = services.scraperOptimizer;
const memoryManager = services.memoryManager;
const analyticsService = services.analyticsService;
const authService = services.authService;
const advancedTelegramService = services.advancedTelegramService;



// Enhanced sendJSON with rate limit headers
const sendJSON = (res, statusCode, data, rateLimitInfo = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-API-Tier',
  };
  
  // Add rate limit headers if available
  if (rateLimitInfo) {
    headers['X-RateLimit-Limit'] = rateLimitInfo.limit;
    headers['X-RateLimit-Remaining'] = rateLimitInfo.remaining;
    headers['X-RateLimit-Reset'] = rateLimitInfo.reset;
  }
  
  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(data));
};

// Authentication middleware
const authenticateUser = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);
    
    if (decoded && decoded.id) {
      // Fetch user details from database
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('id', decoded.id)
        .single();
      
      if (!error && user) {
        return user;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

// Rate limiting wrapper function
const applyRateLimit = (limiter) => {
  return new Promise((resolve, reject) => {
    limiter(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};



// --- SYNC COMPETITORS LOGIC ---
async function syncCompetitors() {
  // Amazon sellers
  const { data: amazonSellers, error: amazonErr } = await supabase
    .from('amazon_scraping_history')
    .select('current_seller, asin')
    .neq('current_seller', null);
  if (amazonErr) throw amazonErr;
  const amazonMap = {};
  (amazonSellers || []).forEach(row => {
    if (!row.current_seller) return;
    if (!amazonMap[row.current_seller]) amazonMap[row.current_seller] = [];
    amazonMap[row.current_seller].push(row.asin);
  });
  // Noon sellers
  const { data: noonSellers, error: noonErr } = await supabase
    .from('noon_scraping_history')
    .select('seller, product_code')
    .neq('seller', null);
  if (noonErr) throw noonErr;
  const noonMap = {};
  (noonSellers || []).forEach(row => {
    if (!row.seller) return;
    if (!noonMap[row.seller]) noonMap[row.seller] = [];
    noonMap[row.seller].push(row.product_code);
  });
  // Upsert Amazon competitors
  for (const seller in amazonMap) {
    await supabase.from('competitors').upsert([
      {
        seller_name: seller,
        platform: 'Amazon',
        product_count: amazonMap[seller].length,
        product_codes: amazonMap[seller],
        is_ignored: false
      }
    ], { onConflict: 'seller_name,platform' });
  }
  // Upsert Noon competitors
  for (const seller in noonMap) {
    await supabase.from('competitors').upsert([
      {
        seller_name: seller,
        platform: 'Noon',
        product_count: noonMap[seller].length,
        product_codes: noonMap[seller],
        is_ignored: false
      }
    ], { onConflict: 'seller_name,platform' });
  }
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-API-Tier',
    });
    return res.end();
  }

  // Authenticate user for all requests
  req.user = await authenticateUser(req);
  
  // Apply general rate limiting to all requests
  try {
    await new Promise((resolve, reject) => {
      generalLimiter(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (rateLimitError) {
    // Rate limit exceeded, response already sent by middleware
    return;
  }

  if (req.method === 'POST' && req.url === '/api/scrape') {
    // Apply Amazon scraping rate limit
    try {
      await new Promise((resolve, reject) => {
        amazonScrapingLimiter(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (rateLimitError) {
      return; // Rate limit exceeded, response already sent
    }
    
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { asin, options, region } = JSON.parse(body);
        if (!asin) {
          return sendJSON(res, 400, { error: 'ASIN is required' });
        }

        const scriptPath = path.join(__dirname, 'amazon_puppeteer.cjs');
        const args = [scriptPath, asin, region || 'eg'];

        console.log(`Starting Amazon scraper for ASIN: ${asin} in region: ${region || 'eg'}`);
        const py = spawn('node', args);
        let stdout = '';
        py.stdout.on('data', d => (stdout += d.toString()));
        let stderr = '';
        py.stderr.on('data', d => (stderr += d.toString()));

        py.on('close', code => {
          console.log(`Amazon scraper finished with code: ${code}`);
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
          
          try {
            const jsonMatch = stdout.match(/{[\s\S]*}/);
            if (!jsonMatch) {
              const userError = stderr?.split('\n').find(line => line.startsWith('Error:')) || 'Scraper failed';
              return sendJSON(res, 500, { error: userError.replace('Error:', '').trim() });
            }
            const result = JSON.parse(jsonMatch[0]);
            
            // Check if this is an error data structure
            if (result.dataSource === 'error' && result.error) {
              return sendJSON(res, 500, { error: result.error });
            }
            
            sendJSON(res, 200, { data: result });
          } catch (err) {
            console.error('JSON parse error:', err);
            sendJSON(res, 500, { error: 'Invalid response from scraper' });
          }
        });
      } catch (err) {
        console.error('Request parse error:', err);
        sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/noon-scrape') {
    // Apply Noon scraping rate limit
    try {
      await new Promise((resolve, reject) => {
        noonScrapingLimiter(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (rateLimitError) {
      return; // Rate limit exceeded, response already sent
    }
    
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { productCode, options } = JSON.parse(body);
        if (!productCode) {
          return sendJSON(res, 400, { error: 'Product code is required' });
        }

        const scriptPath = path.join(__dirname, 'noon_puppeteer.cjs');
        const args = [scriptPath, productCode];

        console.log(`Starting Noon scraper for product: ${productCode}`);
        const py = spawn('node', args);
        let stdout = '';
        py.stdout.on('data', d => (stdout += d.toString()));
        let stderr = '';
        py.stderr.on('data', d => (stderr += d.toString()));

        py.on('close', code => {
          console.log(`Noon scraper finished with code: ${code}`);
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
          try {
            const jsonMatch = stdout.match(/{[\s\S]*}/);
            if (!jsonMatch) return sendJSON(res, 500, { error: 'No JSON output' });
            const result = JSON.parse(jsonMatch[0]);
            const allBlank = Object.values(result).every(v => !v);
            if (allBlank) return sendJSON(res, 500, { error: 'No data scraped from Noon product.' });
            sendJSON(res, 200, { data: result });
          } catch (err) {
            console.error('JSON parse error:', err);
            sendJSON(res, 500, { error: 'Invalid response from scraper' });
          }
        });
      } catch (err) {
        console.error('Request parse error:', err);
        sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    });

  } else if (req.method === 'GET' && req.url === '/api/analytics/performance') {
    (async () => {
      try {
        const days = req.url.includes('?') ? parseInt(new URL(req.url, 'http://localhost').searchParams.get('days') || '7') : 7;
        const metrics = await analyticsService.getPerformanceMetrics(days);
        sendJSON(res, 200, metrics);
      } catch (error) {
        console.error('Analytics error:', error);
        sendJSON(res, 500, { error: error.message });
      }
    })();
  } else if (req.method === 'GET' && req.url === '/api/analytics/price-analysis') {
    (async () => {
      try {
        const days = req.url.includes('?') ? parseInt(new URL(req.url, 'http://localhost').searchParams.get('days') || '30') : 30;
        const analysis = await analyticsService.getPriceAnalysis(days);
        sendJSON(res, 200, analysis);
      } catch (error) {
        console.error('Price analysis error:', error);
        sendJSON(res, 500, { error: error.message });
      }
    })();
  } else if (req.method === 'GET' && req.url === '/api/analytics/competitor-analysis') {
    (async () => {
      try {
        const days = req.url.includes('?') ? parseInt(new URL(req.url, 'http://localhost').searchParams.get('days') || '7') : 7;
        const analysis = await analyticsService.getCompetitorAnalysis(days);
        sendJSON(res, 200, analysis);
      } catch (error) {
        console.error('Competitor analysis error:', error);
        sendJSON(res, 500, { error: error.message });
      }
    })();
  } else if (req.method === 'GET' && req.url === '/api/analytics/market-trends') {
    (async () => {
      try {
        const days = req.url.includes('?') ? parseInt(new URL(req.url, 'http://localhost').searchParams.get('days') || '30') : 30;
        const trends = await analyticsService.getMarketTrends(days);
        sendJSON(res, 200, trends);
      } catch (error) {
        console.error('Market trends error:', error);
        sendJSON(res, 500, { error: error.message });
      }
    })();
  } else if (req.method === 'POST' && req.url === '/api/auth/register') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const userData = JSON.parse(body);
        const result = await authService.registerUser(userData);
        sendJSON(res, result.success ? 201 : 400, result);
      } catch (error) {
        console.error('Registration error:', error);
        sendJSON(res, 500, { error: error.message });
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/auth/login') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const credentials = JSON.parse(body);
        const result = await authService.loginUser(credentials);
        sendJSON(res, result.success ? 200 : 401, result);
      } catch (error) {
        console.error('Login error:', error);
        sendJSON(res, 500, { error: error.message });
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/auth/verify') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { token } = JSON.parse(body);
        const result = authService.verifyToken(token);
        sendJSON(res, result.success ? 200 : 401, result);
      } catch (error) {
        console.error('Token verification error:', error);
        sendJSON(res, 500, { error: error.message });
      }
    });
  } else if (req.method === 'GET' && req.url === '/api/telegram/stats') {
    try {
      const stats = advancedTelegramService.getNotificationStats();
      sendJSON(res, 200, stats);
    } catch (error) {
      console.error('Telegram stats error:', error);
      sendJSON(res, 500, { error: error.message });
    }
  } else if (req.method === 'GET' && req.url === '/api/telegram/queue-status') {
    try {
      const status = advancedTelegramService.getQueueStatus();
      sendJSON(res, 200, status);
    } catch (error) {
      console.error('Telegram queue status error:', error);
      sendJSON(res, 500, { error: error.message });
    }
  } else if (req.method === 'POST' && req.url === '/api/sync-competitors') {
    syncCompetitors()
      .then(() => sendJSON(res, 200, { success: true }))
      .catch(err => {
        console.error('syncCompetitors error:', err);
        sendJSON(res, 500, { error: 'Failed to sync competitors' });
      });
  } else if (req.method === 'POST' && req.url === '/api/multi-domain-scrape') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { asin, domain, options } = JSON.parse(body);
        if (!asin) {
          return sendJSON(res, 400, { error: 'ASIN is required' });
        }
        if (!domain) {
          return sendJSON(res, 400, { error: 'Domain is required' });
        }

        const scriptPath = path.join(__dirname, 'multi_domain_scraper.cjs');
        const args = [scriptPath, asin, domain];

        console.log(`Starting Multi-Domain scraper for ASIN: ${asin} in domain: ${domain}`);
        const py = spawn('node', args);
        let stdout = '';
        py.stdout.on('data', d => (stdout += d.toString()));
        let stderr = '';
        py.stderr.on('data', d => (stderr += d.toString()));

        py.on('close', code => {
          console.log(`Multi-Domain scraper finished with code: ${code}`);
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
          if (code !== 0 && !stdout) {
            const userError = stderr?.split('\n').find(line => line.startsWith('Error:')) || 'Scraper failed';
            return sendJSON(res, 500, { error: userError.replace('Error:', '').trim() });
          }
          try {
            // Simple JSON parsing - just parse the entire stdout
            const result = JSON.parse(stdout.trim());
            sendJSON(res, 200, { data: result });
          } catch (err) {
            console.error('JSON parse error:', err);
            console.error('Raw stdout:', stdout);
            console.error('Stdout length:', stdout.length);
            console.error('Stdout lines:', stdout.split('\n').length);
            
            // Try to extract JSON from mixed output
            try {
              const jsonMatch = stdout.match(/\{[^{}]*"asin"[^{}]*\}/);
              if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                sendJSON(res, 200, { data: result });
                return;
              }
            } catch (extractErr) {
              console.error('JSON extraction failed:', extractErr);
            }
            
            sendJSON(res, 500, { error: 'Invalid response from scraper' });
          }
        });
      } catch (err) {
        console.error('Request parse error:', err);
        sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    });
  } 
  
  // 🚀 NEW: Parallel Multi-Domain Scraping with Crew
  else if (req.method === 'POST' && req.url === '/api/crew-parallel-scrape') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { asin, domains, options } = JSON.parse(body);
        if (!asin) {
          return sendJSON(res, 400, { error: 'ASIN is required' });
        }
        if (!domains || !Array.isArray(domains) || domains.length === 0) {
          return sendJSON(res, 400, { error: 'Domains array is required' });
        }

        // استخدام multi_domain_scraper.cjs لكل domain منفصل
        const results = [];
        let completed = 0;
        const total = domains.length;
        
        if (domains.length === 0) {
          return sendJSON(res, 400, { error: 'No domains provided' });
        }
        
        // Function to scrape a single domain
        const scrapeDomain = (domain) => {
          return new Promise((resolve, reject) => {
            const scriptPath = path.join(__dirname, 'multi_domain_scraper.cjs');
            const args = [scriptPath, asin, domain];
            
            console.log(`🌐 Starting scraper for ${domain}...`);
            const domainProcess = spawn('node', args);
            let stdout = '';
            let stderr = '';
            
            domainProcess.stdout.on('data', d => (stdout += d.toString()));
            domainProcess.stderr.on('data', d => (stderr += d.toString()));
            
            domainProcess.on('close', code => {
              try {
                const result = JSON.parse(stdout.trim());
                result.domain = domain; // إضافة domain للنتيجة
                resolve(result);
              } catch (err) {
                console.error(`❌ ${domain} JSON parse error:`, err);
                resolve({
                  asin,
                  domain,
                  status: 'failed',
                  errorMessage: 'JSON parse error'
                });
              }
            });
            
            domainProcess.on('error', (error) => {
              console.error(`💥 ${domain} process error:`, error);
              resolve({
                asin,
                domain,
                status: 'failed',
                errorMessage: error.message
              });
            });
          });
        };
        
        // تشغيل جميع domains بشكل متوازي
        Promise.all(domains.map(domain => scrapeDomain(domain)))
          .then(domainResults => {
            const finalResult = {
              success: true,
              results: domainResults,
              totalTime: Date.now() - Date.now(), // placeholder
              summary: {
                total: domainResults.length,
                successful: domainResults.filter(r => r.status === 'success').length,
                failed: domainResults.filter(r => r.status === 'failed').length
              }
            };
            sendJSON(res, 200, finalResult);
          })
          .catch(error => {
            console.error('💥 Multi-domain scraping error:', error);
            sendJSON(res, 500, { error: `Multi-domain scraping failed: ${error.message}` });
          });
        
        return; // خروج مبكر لأننا نتعامل مع Promise
      } catch (err) {
        console.error('🔥 Crew request parse error:', err);
        sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    });
  }
  
  // Fallback endpoint for single domain parallel scraping
  else if (req.method === 'POST' && req.url === '/api/parallel-multi-domain-scrape') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { asin, domain, options } = JSON.parse(body);
        if (!asin) {
          return sendJSON(res, 400, { error: 'ASIN is required' });
        }
        if (!domain) {
          return sendJSON(res, 400, { error: 'Domain is required' });
        }

        // استخدام multi_domain_scraper.cjs للـ single domain
        const scriptPath = path.join(__dirname, 'multi_domain_scraper.cjs');
        const args = [scriptPath, asin, domain];

        console.log(`🔄 Starting Single Domain Crew scraper for ASIN: ${asin} in domain: ${domain}`);
        const crewProcess = spawn('node', args);
        let stdout = '';
        let stderr = '';
        
        crewProcess.stdout.on('data', d => (stdout += d.toString()));
        crewProcess.stderr.on('data', d => (stderr += d.toString()));

        crewProcess.on('close', code => {
          console.log(`🏁 Single Domain Crew scraper finished with code: ${code}`);
          
          try {
            const result = JSON.parse(stdout.trim());
            if (result && result.status === 'success') {
              // تحويل format البيانات ليتوافق مع Frontend
              const formattedData = {
                success: true,
                data: {
                  asin: result.asin,
                  title: result.title,
                  price: result.price,
                  currency: result.currency,
                  seller: result.seller,
                  imageUrl: result.imageUrl,
                  productUrl: result.productUrl,
                  dataSource: result.dataSource,
                  status: result.status
                }
              };
              sendJSON(res, 200, formattedData);
            } else {
              sendJSON(res, 500, { error: result.errorMessage || 'Single domain scraping failed' });
            }
          } catch (err) {
            console.error('🔥 Single domain JSON parse error:', err);
            sendJSON(res, 500, { error: 'Invalid response from single domain scraper' });
          }
        });

        crewProcess.on('error', (error) => {
          console.error('💥 Single domain crew process spawn error:', error);
          sendJSON(res, 500, { error: `Single domain crew process failed: ${error.message}` });
        });
      } catch (err) {
        console.error('🔥 Single domain crew request parse error:', err);
        sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    });
  }
  
  // 🚀 Price Monitor Endpoints
  else if (req.method === 'POST' && req.url === '/api/price-monitor/start') {
    priceMonitorService.startMonitoring()
      .then(async () => {
        // Log monitoring start
        try {
          // Get monitoring stats for the log
          const stats = await priceMonitorService.getMonitoringStats();
          const activeProducts = stats.data?.activeProducts || 0;
          const interval = stats.data?.interval || 60;
          const threshold = stats.data?.threshold || 5;
          
          console.log(`🚀 Price Monitoring Started!`);
          console.log(`📦 Products: ${activeProducts} active`);
          console.log(`⏰ Interval: ${interval} minutes`);
          console.log(`🎯 Alert Threshold: ${threshold}%`);
          console.log(`⏰ Started at: ${new Date().toLocaleString('en-US', { 
              timeZone: 'Asia/Dubai',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}`);
          console.log(`🔄 Next scraping cycle: ${new Date(Date.now() + interval * 60000).toLocaleString('en-US', { 
              timeZone: 'Asia/Dubai',
              hour: '2-digit',
              minute: '2-digit'
            })}`);
          
          // Removed Telegram notification for monitoring start
        } catch (error) {
          console.error('❌ Error logging monitoring start:', error);
        }
        
        sendJSON(res, 200, { success: true, message: 'Price monitoring started' });
      })
      .catch(error => {
        console.error('Error starting price monitoring:', error);
        sendJSON(res, 500, { error: 'Failed to start price monitoring' });
      });
  }
  
  else if (req.method === 'POST' && req.url === '/api/price-monitor/stop') {
    priceMonitorService.stopMonitoring()
      .then(() => sendJSON(res, 200, { success: true, message: 'Price monitoring stopped' }))
      .catch(error => {
        console.error('Error stopping price monitoring:', error);
        sendJSON(res, 500, { error: 'Failed to stop price monitoring' });
      });
  }
  
    else if (req.method === 'GET' && req.url === '/api/price-monitor/status') {
    priceMonitorService.getMonitoringStats()
      .then(stats => {
        sendJSON(res, 200, {
          success: true,
          data: {
            ...stats.data,
            isRunning: priceMonitorService.isRunning
          }
        });
      })
      .catch(error => {
        console.error('Error getting monitoring status:', error);
        sendJSON(res, 500, { error: 'Failed to get monitoring status' });
      });
  }

  // 🏪 Seller Info Endpoints
  else if (req.method === 'GET' && req.url.startsWith('/api/seller-info/')) {
    const asin = req.url.split('/').pop();
    
    if (!asin) {
      sendJSON(res, 400, { error: 'ASIN is required' });
      return;
    }

    // Get seller info for specific ASIN
    supabase
      .from('seller_info')
      .select('*')
      .eq('asin', asin.toUpperCase())
      .order('scraped_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching seller info:', error);
          sendJSON(res, 500, { error: 'Failed to fetch seller info' });
          return;
        }
        
        sendJSON(res, 200, { 
          success: true, 
          data: data || null 
        });
      })
      .catch(error => {
        console.error('Error fetching seller info:', error);
        sendJSON(res, 500, { error: 'Failed to fetch seller info' });
      });
  }

  else if (req.method === 'GET' && req.url === '/api/seller-info/all') {
    // Get all seller info
    supabase
      .from('seller_info')
      .select('*')
      .order('scraped_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching all seller info:', error);
          sendJSON(res, 500, { error: 'Failed to fetch seller info' });
          return;
        }
        
        sendJSON(res, 200, { 
          success: true, 
          data: data || [] 
        });
      })
      .catch(error => {
        console.error('Error fetching all seller info:', error);
        // Return empty array instead of error if it's a network issue
        sendJSON(res, 200, { 
          success: true, 
          data: [] 
        });
      });
  }

  // 🔍 Enhanced Product Scraping Endpoint
  else if (req.method === 'POST' && req.url === '/api/scrape-product') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { asin, region } = JSON.parse(body);
        
        if (!asin || !region) {
          sendJSON(res, 400, { success: false, error: 'ASIN and region are required' });
          return;
        }

        // Use the direct scraper instead of price monitor service
        const scriptPath = path.join(__dirname, 'amazon_puppeteer.cjs');
        const args = [scriptPath, asin, region];

        console.log(`Starting Amazon scraper for ASIN: ${asin} in region: ${region}`);
        const py = spawn('node', args);
        let stdout = '';
        py.stdout.on('data', d => (stdout += d.toString()));
        let stderr = '';
        py.stderr.on('data', d => (stderr += d.toString()));

        py.on('close', code => {
          console.log(`Amazon scraper finished with code: ${code}`);
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
          
          try {
            const jsonMatch = stdout.match(/{[\s\S]*}/);
            if (!jsonMatch) {
              const userError = stderr?.split('\n').find(line => line.startsWith('Error:')) || 'Scraper failed';
              return sendJSON(res, 500, { success: false, error: userError.replace('Error:', '').trim() });
            }
            const result = JSON.parse(jsonMatch[0]);
            
            // Check if this is an error data structure
            if (result.dataSource === 'error' && result.error) {
              return sendJSON(res, 500, { success: false, error: result.error });
            }
            
            // Format the response to match expected structure
            const formattedResult = {
              success: true,
              data: {
                price: result.price,
                title: result.title,
                imageUrl: result.image,
                sellerName: result.buyboxWinner,
                sellerId: null,
                hasBuybox: !!result.buyboxWinner,
                totalOffers: 0,
                link: result.link,
                dataSource: result.dataSource,
                asin: result.asin
              }
            };
            
            sendJSON(res, 200, formattedResult);
          } catch (err) {
            console.error('JSON parse error:', err);
            sendJSON(res, 500, { success: false, error: 'Invalid response from scraper' });
          }
        });
      } catch (error) {
        console.error('Error scraping product:', error);
        sendJSON(res, 500, { success: false, error: error.message });
      }
    });
    return;
  }

  // 🚀 Add Product Immediately After Scraping
  else if (req.method === 'POST' && req.url === '/api/add-product-immediately') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { asin, region, scrapeInterval = 60, alertThreshold = 5, selectedAccount } = JSON.parse(body);
        
        if (!asin || !region) {
          sendJSON(res, 400, { success: false, error: 'ASIN and region are required' });
          return;
        }

        console.log(`🚀 Adding product ${asin} immediately after scraping...`);

        // First, scrape the product
        const scrapeResult = await priceMonitorService.scrapeProductPrice(asin, region);
        
        if (!scrapeResult.success) {
          sendJSON(res, 400, { success: false, error: scrapeResult.error });
          return;
        }

        console.log(`📊 Scrape result for ${asin}:`, {
          title: scrapeResult.data?.title,
          price: scrapeResult.data?.price,
          imageUrl: scrapeResult.data?.imageUrl,
          sellerName: scrapeResult.data?.sellerName,
          hasBuybox: scrapeResult.data?.hasBuybox
        });

        // Then, add it to monitoring immediately
        const { data: existingProduct } = await supabase
          .from('price_monitor_products')
          .select('*')
          .eq('asin', asin)
          .eq('region', region)
          .single();

        let savedProduct = null;

        if (existingProduct) {
          // Update existing product
          const { data: updatedProduct, error: updateError } = await supabase
            .from('price_monitor_products')
            .update({
              title: scrapeResult.data?.title || existingProduct.title,
              current_price: scrapeResult.data?.price,
              last_scraped: new Date().toISOString(),
              next_scrape: new Date(Date.now() + scrapeInterval * 60000).toISOString(),
              scrape_interval: scrapeInterval,
              alert_threshold: alertThreshold,
              is_active: true,
              updated_at: new Date().toISOString(),
              // Add seller info
              seller_name: scrapeResult.data?.sellerName,
              seller_id: scrapeResult.data?.sellerId,
              has_buybox: scrapeResult.data?.hasBuybox,
              total_offers: scrapeResult.data?.totalOffers,
              // Add image URL
              image_url: scrapeResult.data?.imageUrl,
              // Add selected account
              selected_account: selectedAccount
            })
            .eq('id', existingProduct.id)
            .select()
            .single();

          if (updateError) throw updateError;

          savedProduct = updatedProduct;
          console.log(`✅ Product ${asin} updated immediately with image:`, scrapeResult.imageUrl);
          sendJSON(res, 200, { 
            success: true, 
            message: 'Product updated successfully',
            data: updatedProduct,
            isNew: false
          });
        } else {
          // Add new product
          const { data: newProduct, error: insertError } = await supabase
            .from('price_monitor_products')
            .insert({
              asin: asin,
              title: scrapeResult.data?.title,
              current_price: scrapeResult.data?.price,
              region: region,
              scrape_interval: scrapeInterval,
              alert_threshold: alertThreshold,
              is_active: true,
              last_scraped: new Date().toISOString(),
              next_scrape: new Date(Date.now() + scrapeInterval * 60000).toISOString(),
              // Add seller info
              seller_name: scrapeResult.data?.sellerName,
              seller_id: scrapeResult.data?.sellerId,
              has_buybox: scrapeResult.data?.hasBuybox,
              total_offers: scrapeResult.data?.totalOffers,
              // Add image URL
              image_url: scrapeResult.data?.imageUrl,
              // Add selected account
              selected_account: selectedAccount
            })
            .select()
            .single();

          if (insertError) throw insertError;

          savedProduct = newProduct;
          console.log(`✅ Product ${asin} added immediately with image:`, scrapeResult.imageUrl);
          sendJSON(res, 200, { 
            success: true, 
            message: 'Product added successfully',
            data: newProduct,
            isNew: true
          });
        }

        // Save seller info if available
        if (scrapeResult.sellerName && savedProduct) {
          console.log(`👤 Saving seller info for ${asin}: ${scrapeResult.sellerName}`);
          await priceMonitorService.saveSellerInfo(
            savedProduct.id, 
            asin, 
            scrapeResult, 
            region
          );
        }

      } catch (error) {
        console.error('Error adding product immediately:', error);
        sendJSON(res, 500, { success: false, error: error.message });
      }
    });
    return;
  }
  
  // 📱 Telegram Endpoints
  else if (req.method === 'GET' && req.url === '/api/telegram/config') {
    // Get Telegram configuration
    supabase
      .from('telegram_config')
      .select('*')
      .single()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching Telegram config:', error);
          sendJSON(res, 500, { error: 'Failed to fetch Telegram config' });
          return;
        }
        
        sendJSON(res, 200, { 
          success: true, 
          data: data || null 
        });
      })
      .catch(error => {
        console.error('Error fetching Telegram config:', error);
        sendJSON(res, 500, { error: 'Failed to fetch Telegram config' });
      });
  }

  else if (req.method === 'POST' && req.url === '/api/telegram/config') {
    // Save Telegram configuration
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const config = JSON.parse(body);
        
        const { error } = await supabase
          .from('telegram_config')
          .upsert([config], { onConflict: 'id' });

        if (error) throw error;

        sendJSON(res, 200, { success: true, message: 'Telegram configuration saved' });
      } catch (error) {
        console.error('Error saving Telegram config:', error);
        sendJSON(res, 500, { error: 'Failed to save Telegram config' });
      }
    });
    return;
  }

  else if (req.method === 'POST' && req.url === '/api/telegram/test') {
    // Test Telegram connection
    const TelegramService = require('./telegram_service.cjs');
    const telegramService = new TelegramService();
    
    telegramService.testConnection()
      .then(success => {
        if (success) {
          sendJSON(res, 200, { success: true, message: 'Telegram test message sent successfully' });
        } else {
          sendJSON(res, 400, { error: 'Failed to send Telegram test message' });
        }
      })
      .catch(error => {
        console.error('Error testing Telegram:', error);
        sendJSON(res, 500, { error: 'Failed to test Telegram connection' });
      });
  }

  else if (req.method === 'GET' && req.url === '/api/telegram/alerts') {
    // Get Telegram alerts history
    supabase
      .from('telegram_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching Telegram alerts:', error);
          sendJSON(res, 500, { error: 'Failed to fetch Telegram alerts' });
          return;
        }
        
        sendJSON(res, 200, { 
          success: true, 
          data: data || [] 
        });
      })
      .catch(error => {
        console.error('Error fetching Telegram alerts:', error);
        sendJSON(res, 500, { error: 'Failed to fetch Telegram alerts' });
      });
  }
  
  else if (req.method === 'POST' && req.url === '/api/price-monitor/run-cycle') {
    console.log('🔄 Manual Run Now button clicked - will open visible browser!');
    
    // Ensure browser is initialized and visible
    priceMonitorService.initialize()
      .then(() => {
        console.log('✅ Browser initialized for manual run');
        return priceMonitorService.runMonitoringCycle();
      })
      .then(async (result) => {
        console.log('✅ Manual monitoring cycle completed:', result);
        
        // Send product list to Telegram if products were processed
        if (result.processed > 0) {
          try {
            const SimpleTelegramService = require('./simple_telegram_service.cjs');
            const telegramService = new SimpleTelegramService();
            
            // Get the processed products
            const { data: products } = await supabase
              .from('price_monitor_products')
              .select('asin, title, current_price, seller_name')
              .eq('is_active', true)
              .order('updated_at', { ascending: false })
              .limit(10);
            
            if (products && products.length > 0) {
              await telegramService.sendProductList(products);
            }
          } catch (telegramError) {
            console.error('❌ Error sending product list to Telegram:', telegramError);
          }
        }
        
        sendJSON(res, 200, { success: true, data: result });
      })
      .catch(async (error) => {
        console.error('❌ Error running manual monitoring cycle:', error);
        sendJSON(res, 500, { success: false, error: error.message });
      });
    return;
  }
  
  // 📦 Send Product Data to Telegram
  else if (req.method === 'POST' && req.url === '/api/telegram/send-product') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { asin, region } = JSON.parse(body);
        
        if (!asin || !region) {
          sendJSON(res, 400, { success: false, error: 'ASIN and region are required' });
          return;
        }

        console.log(`📱 Sending product data to Telegram for ${asin} (${region})`);

        // Get product data from database
        const { data: product, error: productError } = await supabase
          .from('price_monitor_products')
          .select('*')
          .eq('asin', asin)
          .eq('region', region)
          .single();

        if (productError || !product) {
          sendJSON(res, 404, { success: false, error: 'Product not found' });
          return;
        }

        // Get seller info
        const { data: sellerInfo } = await supabase
          .from('seller_info')
          .select('seller_name, has_buybox, total_offers')
          .eq('asin', asin)
          .eq('region', region)
          .single();

        // Get My Account info
        const { data: myAccount } = await supabase
          .from('seller_accounts')
          .select('seller_name')
          .eq('is_active', true)
          .eq('region', region)
          .single();

        // Prepare product data
        const productData = {
          asin: product.asin,
          title: product.title || 'Unknown Product',
          region: product.region,
          price: product.current_price ? `${product.current_price}` : 'N/A',
          seller_name: sellerInfo?.seller_name || 'Unknown',
          has_buybox: sellerInfo?.has_buybox || false,
          my_account: myAccount?.seller_name || 'N/A',
          image_url: product.image_url || null
        };

        // Send to Telegram
        const SimpleTelegramService = require('./simple_telegram_service.cjs');
        const telegramService = new SimpleTelegramService();
        
        const success = await telegramService.sendProductData(productData);
        
        if (success) {
          sendJSON(res, 200, { 
            success: true, 
            message: 'Product data sent to Telegram successfully',
            data: productData
          });
        } else {
          sendJSON(res, 500, { 
            success: false, 
            error: 'Failed to send product data to Telegram' 
          });
        }
      } catch (error) {
        console.error('Error sending product data to Telegram:', error);
        sendJSON(res, 500, { success: false, error: error.message });
      }
    });
    return;
  }

  // 📋 Send Product List to Telegram
  else if (req.method === 'POST' && req.url === '/api/telegram/send-product-list') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { limit = 10 } = JSON.parse(body);

        console.log(`📱 Sending product list to Telegram (limit: ${limit})`);

        // Get products from database
        const { data: products, error: productsError } = await supabase
          .from('price_monitor_products')
          .select('asin, title, current_price, seller_name, region')
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
          .limit(limit);

        if (productsError) {
          sendJSON(res, 500, { success: false, error: 'Failed to fetch products' });
          return;
        }

        // Send to Telegram
        const SimpleTelegramService = require('./simple_telegram_service.cjs');
        const telegramService = new SimpleTelegramService();
        
        const success = await telegramService.sendProductList(products);
        
        if (success) {
          sendJSON(res, 200, { 
            success: true, 
            message: 'Product list sent to Telegram successfully',
            data: { count: products?.length || 0 }
          });
        } else {
          sendJSON(res, 500, { 
            success: false, 
            error: 'Failed to send product list to Telegram' 
          });
        }
      } catch (error) {
        console.error('Error sending product list to Telegram:', error);
        sendJSON(res, 500, { success: false, error: error.message });
      }
    });
    return;
  }

  // 📊 Rate Limiting Management Endpoints
  else if (req.method === 'GET' && req.url === '/api/admin/rate-limit-stats') {
    // Apply admin rate limit
    try {
      await new Promise((resolve, reject) => {
        adminLimiter(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (rateLimitError) {
      return;
    }
    
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return sendJSON(res, 403, { error: 'Admin access required' });
    }
    
    try {
      const stats = await getRateLimitStats();
      sendJSON(res, 200, { success: true, data: stats });
    } catch (error) {
      console.error('Error getting rate limit stats:', error);
      sendJSON(res, 500, { error: 'Failed to get rate limit statistics' });
    }
  }
  
  else if (req.method === 'POST' && req.url === '/api/admin/clear-rate-limit') {
    // Apply admin rate limit
    try {
      await new Promise((resolve, reject) => {
        adminLimiter(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (rateLimitError) {
      return;
    }
    
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return sendJSON(res, 403, { error: 'Admin access required' });
    }
    
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { key } = JSON.parse(body);
        
        if (!key) {
          return sendJSON(res, 400, { error: 'Rate limit key is required' });
        }
        
        const success = await clearRateLimit(key);
        
        if (success) {
          sendJSON(res, 200, { 
            success: true, 
            message: `Rate limit cleared for key: ${key}` 
          });
        } else {
          sendJSON(res, 500, { 
            success: false, 
            error: 'Failed to clear rate limit' 
          });
        }
      } catch (error) {
        console.error('Error clearing rate limit:', error);
        sendJSON(res, 500, { error: 'Failed to clear rate limit' });
      }
    });
  }
  
  // 🔐 Authentication Endpoints with Rate Limiting
  else if (req.method === 'POST' && req.url === '/api/auth/login') {
    // Apply authentication rate limit
    try {
      await new Promise((resolve, reject) => {
        authLimiter(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (rateLimitError) {
      return;
    }
    
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { email, password } = JSON.parse(body);
        
        if (!email || !password) {
          return sendJSON(res, 400, { error: 'Email and password are required' });
        }
        
        const result = await authService.login(email, password);
        
        if (result.success) {
          sendJSON(res, 200, result);
        } else {
          sendJSON(res, 401, result);
        }
      } catch (error) {
        console.error('Login error:', error);
        sendJSON(res, 500, { error: 'Login failed' });
      }
    });
  }
  
  else if (req.method === 'POST' && req.url === '/api/auth/register') {
    // Apply authentication rate limit
    try {
      await new Promise((resolve, reject) => {
        authLimiter(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (rateLimitError) {
      return;
    }
    
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { email, password, name } = JSON.parse(body);
        
        if (!email || !password || !name) {
          return sendJSON(res, 400, { error: 'Email, password, and name are required' });
        }
        
        const result = await authService.register(email, password, name);
        
        if (result.success) {
          sendJSON(res, 201, result);
        } else {
          sendJSON(res, 400, result);
        }
      } catch (error) {
        console.error('Registration error:', error);
        sendJSON(res, 500, { error: 'Registration failed' });
      }
    });
  }

  else {
    sendJSON(res, 404, { error: 'Not Found' });
  }
});

server.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
