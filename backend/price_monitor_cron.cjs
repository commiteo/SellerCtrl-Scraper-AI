const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

// Initialize Supabase client
const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8';
const supabase = createClient(supabaseUrl, supabaseKey);

class PriceMonitorCron {
  constructor() {
    this.browser = null;
    this.isRunning = false;
    this.checkInterval = null;
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Price Monitor Cron Service...');
      
      // Launch browser - VISIBLE BROWSER
      this.browser = await puppeteer.launch({
        headless: false, // VISIBLE BROWSER
        defaultViewport: null,
        slowMo: 50, // Reduced slowMo for better performance
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
          '--window-size=800,600', // SMALL WINDOW FOR DISPLAY ONLY
          '--disable-web-security', // Disable web security
          '--disable-features=VizDisplayCompositor', // Fix display issues
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });

      console.log('✅ Browser initialized for cron service');
      console.log('👁️ Cron service will open visible browser windows!');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Price Monitor Cron Service:', error);
      return false;
    }
  }

  async scrapeProductPrice(asin, region) {
    try {
      const page = await this.browser.newPage();
      
      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Set viewport
      await page.setViewport({ width: 800, height: 600 });
      
      // Set zoom to 75% for better content display
      await page.evaluate(() => {
        document.body.style.zoom = '75%';
        document.body.style.transform = 'scale(0.75)';
        document.body.style.transformOrigin = 'top left';
      });
      console.log(`🔍 Zoom set to 75% for better content display`);
      
      // Navigate to product page
      const domainMap = {
        'eg': 'amazon.eg',
        'sa': 'amazon.sa',
        'ae': 'amazon.ae',
        'com': 'amazon.com',
        'de': 'amazon.de'
      };
      
      const domain = domainMap[region] || 'amazon.com';
      const url = `https://www.${domain}/dp/${asin}`;
      
      console.log(`🔍 Cron scraping: ${url}`);
      console.log(`👁️ Cron service opening browser for ${asin}...`);
      
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      console.log(`✅ Cron service page loaded for ${asin}`);
      console.log(`👁️ You can see the browser window for ${asin}!`);

      // Wait for price to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Extract price
      const priceData = await page.evaluate(() => {
        // Try multiple price selectors
        const priceSelectors = [
          '.a-price-whole',
          '.a-price .a-offscreen',
          '#priceblock_ourprice',
          '#priceblock_dealprice',
          '.a-price-range .a-price-range-fraction',
          '.a-price .a-price-symbol + span',
          '[data-a-color="price"] .a-price-whole',
          '.a-price .a-price-fraction'
        ];

        let price = null;
        let title = null;

        // Get title
        const titleSelectors = [
          '#productTitle',
          '.a-size-large.product-title-word-break',
          'h1.a-size-large'
        ];

        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            title = element.textContent.trim();
            break;
          }
        }

        // Get price
        for (const selector of priceSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const priceText = element.textContent.trim();
            const priceMatch = priceText.match(/[\d,]+\.?\d*/);
            if (priceMatch) {
              price = priceMatch[0].replace(/,/g, '');
              break;
            }
          }
        }

        return { price, title };
      });

      await page.close();

      if (!priceData.price) {
        throw new Error('Price not found');
      }

      return {
        success: true,
        price: parseFloat(priceData.price),
        title: priceData.title
      };

    } catch (error) {
      console.error(`❌ Error scraping product ${asin}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateProductPrice(product) {
    try {
      console.log(`🔄 Cron updating price for ${product.asin} (${product.region})`);

      const scrapeResult = await this.scrapeProductPrice(product.asin, product.region);
      
      if (!scrapeResult.success) {
        throw new Error(scrapeResult.error);
      }

      const newPrice = scrapeResult.price;
      const newTitle = scrapeResult.title;

      // Calculate price change
      let priceChange = null;
      let priceChangePercentage = null;
      
      if (product.current_price && newPrice) {
        priceChange = newPrice - product.current_price;
        priceChangePercentage = (priceChange / product.current_price) * 100;
      }

      // Update product in database
      const { data, error } = await supabase
        .from('price_monitor_products')
        .update({
          current_price: newPrice,
          previous_price: product.current_price,
          price_change: priceChange,
          price_change_percentage: priceChangePercentage,
          title: newTitle || product.title,
          last_scraped: new Date().toISOString(),
          next_scrape: new Date(Date.now() + product.scrape_interval * 60000).toISOString()
        })
        .eq('id', product.id)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Cron updated ${product.asin}: $${newPrice} (${priceChange ? `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}` : 'N/A'})`);

      // Check if price change exceeds alert threshold
      if (product.alert_threshold && priceChangePercentage && Math.abs(priceChangePercentage) >= product.alert_threshold) {
        await this.createPriceAlert(product, data);
      }

      return { success: true, data };

    } catch (error) {
      console.error(`❌ Error updating product ${product.asin}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async createPriceAlert(product, updatedProduct) {
    try {
      const alertType = updatedProduct.price_change > 0 ? 'increase' : 'decrease';
      
      const { error } = await supabase
        .from('price_alerts')
        .insert({
          product_id: product.id,
          asin: product.asin,
          old_price: product.current_price,
          new_price: updatedProduct.current_price,
          price_change: updatedProduct.price_change,
          price_change_percentage: updatedProduct.price_change_percentage,
          alert_type: alertType
        });

      if (error) throw error;

      console.log(`🚨 Cron price alert created for ${product.asin}: ${alertType} of ${Math.abs(updatedProduct.price_change_percentage).toFixed(1)}%`);

    } catch (error) {
      console.error('Error creating price alert:', error);
    }
  }

  async getProductsDueForScraping() {
    try {
      const { data, error } = await supabase
        .from('price_monitor_products')
        .select('*')
        .eq('is_active', true)
        .lte('next_scrape', new Date().toISOString())
        .order('next_scrape', { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching products due for scraping:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch products due for scraping' 
      };
    }
  }

  async runMonitoringCycle() {
    try {
      console.log('🔄 Cron starting monitoring cycle...');

      const dueProductsResult = await this.getProductsDueForScraping();
      if (!dueProductsResult.success) {
        throw new Error(dueProductsResult.error);
      }

      const dueProducts = dueProductsResult.data;
      if (dueProducts.length === 0) {
        console.log('📭 Cron: No products due for scraping');
        return { success: true, processed: 0, errors: 0 };
      }

      console.log(`📋 Cron: Found ${dueProducts.length} products due for scraping`);

      let processed = 0;
      let errors = 0;

      for (const product of dueProducts) {
        try {
          const result = await this.updateProductPrice(product);
          if (result.success) {
            processed++;
          } else {
            errors++;
            console.error(`Cron failed to process ${product.asin}:`, result.error);
          }

          // Add delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));

        } catch (error) {
          errors++;
          console.error(`Cron error processing ${product.asin}:`, error);
        }
      }

      console.log(`✅ Cron monitoring cycle completed: ${processed} processed, ${errors} errors`);
      return { success: true, processed, errors };

    } catch (error) {
      console.error('❌ Cron error running monitoring cycle:', error);
      return { success: false, processed: 0, errors: 0, error: error.message };
    }
  }

  async startCronService() {
    if (this.isRunning) {
      console.log('⚠️ Cron service is already running');
      return;
    }

    const initialized = await this.initialize();
    if (!initialized) {
      console.error('❌ Failed to initialize cron service');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Price Monitor Cron Service started');

    // Run initial cycle
    await this.runMonitoringCycle();

    // Set up interval for continuous monitoring (check every 2 minutes)
    this.checkInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.runMonitoringCycle();
      }
    }, 2 * 60 * 1000); // Check every 2 minutes

    console.log('⏰ Cron service will check for due products every 2 minutes');
  }

  async stopCronService() {
    if (!this.isRunning) {
      console.log('⚠️ Cron service is not running');
      return;
    }

    this.isRunning = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    console.log('🛑 Price Monitor Cron Service stopped');
  }

  async getCronStats() {
    try {
      const { data: products, error: productsError } = await supabase
        .from('price_monitor_products')
        .select('*');

      if (productsError) throw productsError;

      const { data: alerts, error: alertsError } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('is_read', false);

      if (alertsError) throw alertsError;

      const stats = {
        totalProducts: products?.length || 0,
        activeProducts: products?.filter(p => p.is_active).length || 0,
        dueForScraping: products?.filter(p => p.is_active && new Date(p.next_scrape) <= new Date()).length || 0,
        unreadAlerts: alerts?.length || 0,
        priceChanges: products?.filter(p => p.price_change !== null).length || 0,
        isRunning: this.isRunning
      };

      return { success: true, data: stats };

    } catch (error) {
      console.error('Error fetching cron stats:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export the service
module.exports = PriceMonitorCron;

// If running directly, start the cron service
if (require.main === module) {
  const cronService = new PriceMonitorCron();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down cron service gracefully...');
    await cronService.stopCronService();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down cron service gracefully...');
    await cronService.stopCronService();
    process.exit(0);
  });

  // Start the cron service
  cronService.startCronService().catch(error => {
    console.error('❌ Failed to start cron service:', error);
    process.exit(1);
  });
} 