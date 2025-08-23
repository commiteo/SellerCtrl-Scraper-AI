const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');
const config = require('./price_monitor_config.cjs');
const SimpleTelegramService = require('./simple_telegram_service.cjs');

// Initialize Supabase client
const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Simple Telegram Service
const telegramService = new SimpleTelegramService();

class PriceMonitorService {
  constructor() {
    this.isRunning = false;
    this.browser = null;
    this.monitoringInterval = null;
  }

  // Extract numeric price from price string with currency
  extractNumericPrice(priceString) {
    try {
      if (typeof priceString === 'number') {
        return priceString;
      }
      
      if (!priceString || typeof priceString !== 'string') {
        return null;
      }
      
      let cleaned = priceString.replace(/[^\d.,]/g, '');
      cleaned = cleaned.replace(',', '.');
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    } catch (error) {
      console.error(`❌ Error in extractNumericPrice:`, error);
      return null;
    }
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Price Monitor Service...');
      
      if (this.browser) {
        try {
          await this.browser.close();
        } catch (error) {
          console.log('⚠️ Error closing existing browser:', error.message);
        }
        this.browser = null;
      }
      
      // Try to launch browser with executable path first
      try {
        this.browser = await puppeteer.launch({
          executablePath: config.browser.executablePath,
          headless: config.browser.headless,
          defaultViewport: config.browser.defaultViewport,
          slowMo: config.browser.slowMo,
          args: config.browser.args
        });
      } catch (error) {
        console.log('Failed to launch with executable path, trying without...');
        // Fallback: try without executable path (uses bundled Chromium)
        this.browser = await puppeteer.launch({
          headless: config.browser.headless,
          defaultViewport: config.browser.defaultViewport,
          slowMo: config.browser.slowMo,
          args: config.browser.args
        });
      }

      const testPage = await this.browser.newPage();
      await testPage.close();

      console.log('✅ Browser initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Price Monitor Service:', error);
      this.browser = null;
      return false;
    }
  }

  async scrapeProductPrice(asin, region) {
    try {
      if (!this.browser) {
        console.log('🔄 Browser not initialized, initializing...');
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize browser');
        }
      }

      if (!this.browser.isConnected()) {
        console.log('🔄 Browser disconnected, reinitializing...');
        await this.browser.close();
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to reinitialize browser');
        }
      }

      let page;
      const pages = await this.browser.pages();
      
      if (pages.length > 0) {
        page = pages[0];
        console.log(`🌐 Using existing browser page for ${asin}...`);
      } else {
        console.log(`🌐 Creating new browser page for ${asin}...`);
        page = await this.browser.newPage();
        console.log(`✅ Browser page created successfully`);
      }
      
      if (!page || page.isClosed()) {
        throw new Error('Page was closed or invalid');
      }
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      console.log(`👤 User agent set`);
      
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1'
      });
      console.log(`📋 HTTP headers set`);
      
      await page.setViewport({ width: 800, height: 600 });
      console.log(`🖥️ Viewport set to 800x600`);
      
      await page.evaluate(() => {
        document.body.style.zoom = '75%';
        document.body.style.transform = 'scale(0.75)';
        document.body.style.transformOrigin = 'top left';
      });
      console.log(`🔍 Zoom set to 75%`);
      
      let productUrl;
      if (region === 'ae') {
        productUrl = `https://www.amazon.${region}/dp/${asin}?language=en_AE`;
      } else if (region === 'sa') {
        productUrl = `https://www.amazon.${region}/dp/${asin}?language=en_AE`;
      } else if (region === 'de') {
        productUrl = `https://www.amazon.${region}/dp/${asin}?language=en_AE`;
      } else if (region === 'eg') {
        productUrl = `https://www.amazon.eg/en/dp/${asin}?language=en_AE`;
      } else {
        productUrl = `https://www.amazon.${region}/dp/${asin}?language=en_AE`;
      }
      
      console.log(`🔍 Navigating to: ${productUrl}`);
      
      // Add retry logic for network issues
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          await page.goto(productUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 // 30 seconds timeout
          });
          console.log('✅ PAGE LOADED SUCCESSFULLY');
          break; // Success, exit retry loop
        } catch (error) {
          retryCount++;
          console.log(`⚠️ Navigation attempt ${retryCount} failed: ${error.message}`);
          
          if (retryCount >= maxRetries) {
            throw new Error(`Failed to navigate after ${maxRetries} attempts: ${error.message}`);
          }
          
          // Wait before retry
          console.log(`⏳ Waiting 5 seconds before retry ${retryCount + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Check if page is still valid
          if (page.isClosed()) {
            throw new Error('Page was closed during retry');
          }
        }
      }
      
      console.log(`🌐 Browser is now on Amazon page for ${asin}`);
      console.log(`👁️ You can see the Amazon page in the same browser tab!`);
      
      // Wait a bit more for page to fully load and remove any overlays
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('⏳ Waiting for page to fully load...');
      
      // Try to remove any overlays that might be blocking content
      await page.evaluate(() => {
        // Remove any white overlays or blocking elements
        const overlays = document.querySelectorAll('div[style*="background: white"], div[style*="background-color: white"], .overlay, .blocking-overlay');
        overlays.forEach(overlay => overlay.remove());
        
        // Remove any blocking modals or popups
        const modals = document.querySelectorAll('.modal, .popup, .dialog, [role="dialog"]');
        modals.forEach(modal => modal.remove());
      });
      console.log('🧹 Cleaned up any blocking overlays');
      
      // Check if page is still valid before proceeding
      if (page.isClosed()) {
        throw new Error('Page was closed during overlay cleanup');
      }
      
      // Look for "See all buying options" button
      console.log('🔍 Looking for "See all buying options" button...');
      const btnSelector = 'span#buybox-see-all-buying-choices a.a-button-text';
      const btn = await page.$(btnSelector);
      if (btn) {
        console.log('🔍 Found See All Buying Options button, clicking...');
        await btn.evaluate(b => b.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await new Promise(r => setTimeout(r, 500));
        await btn.click();
        // انتظر حتى ظهور أول عرض في الـ sidebar
        await page.waitForSelector('div[id^="aod-offer"] .a-section.a-spacing-none.aok-align-center.aok-relative > span.aok-offscreen', { timeout: 15000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 2000)); // انتظار إضافي لتحميل باقي العروض
      }
      
      // Check if page is still valid before evaluate
      if (page.isClosed()) {
        throw new Error('Page was closed after clicking See All Buying Options');
      }
      
      // Save page HTML for debugging
      try {
        const html = await page.content();
        require('fs').writeFileSync('debug.html', html);
        console.log('Saved page HTML to debug.html');
      } catch (err) {
        console.log('Error saving debug.html:', err.message);
      }
      
      // Wait for essential selectors
      console.log('Waiting for essential selectors...');
      try {
        await Promise.all([
          page.waitForSelector('#productTitle', { timeout: 15000 }),
          page.waitForSelector('#landingImage', { timeout: 15000 }),
          page.waitForSelector('span.a-price span.a-offscreen, #priceblock_ourprice, #priceblock_dealprice, #priceblock_saleprice', { timeout: 15000 }),
        ]);
        console.log('All selectors found. Extracting product data...');
      } catch (e) {
        console.log('Warning: لم يتم العثور على كل العناصر الأساسية، سيتم استخراج ما يمكن فقط.');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Check if page is still valid before final evaluate
      if (page.isClosed()) {
        throw new Error('Page was closed before data extraction');
      }
      
      // Extract data using page.evaluate
      const pageData = await page.evaluate(() => {
        // Check product status first
        const productStatus = () => {
          const unavailableText = document.querySelector('span.a-size-medium.a-color-success')?.innerText;
          const outOfStockText = document.querySelector('#availability span')?.innerText;
          
          if (unavailableText?.includes('unavailable') || outOfStockText?.includes('unavailable')) {
            return 'unavailable';
          }
          
          const pageText = document.body.innerText.toLowerCase();
          if (pageText.includes('currently unavailable') || 
              pageText.includes('out of stock') || 
              pageText.includes('we don\'t know when') ||
              pageText.includes('temporarily out of stock')) {
            return 'unavailable';
          }
          
          return 'available';
        };

        const status = productStatus();
        console.log('Product status:', status);

        let price = null;
        let priceDisplay = null; // السعر مع العملة
        let title = null;
        let imageUrl = null; // صورة المنتج
        let sellerName = null;
        let hasBuybox = false;
        let totalOffers = 0;

        // Get title
        title = document.querySelector('#productTitle')?.innerText?.trim() || null;
        console.log('Title:', title);

        // Get product image
        const imageElement = document.querySelector('#landingImage');
        if (imageElement) {
          const imgSrc = imageElement.getAttribute('src');
          if (imgSrc) {
            imageUrl = imgSrc;
            console.log('Product image URL:', imageUrl);
          }
        }
        
        // Fallback: try other image selectors
        if (!imageUrl) {
          const fallbackImageSelectors = [
            '#imgBlkFront',
            '#main-image',
            '.a-dynamic-image',
            '[data-old-hires]',
            'img[src*="images/I"]'
          ];
          
          for (const selector of fallbackImageSelectors) {
            const img = document.querySelector(selector);
            if (img) {
              const src = img.getAttribute('src') || img.getAttribute('data-old-hires');
              if (src && src.includes('http')) {
                imageUrl = src;
                console.log('Product image URL (fallback):', imageUrl);
                break;
              }
            }
          }
        }

        // Clean price function - return both numeric and original
        const cleanPrice = (priceText) => {
          if (!priceText) return { numeric: null, original: null };
          
          // Keep original price with currency
          const original = priceText.trim();
          
          // Remove currency symbols and extra text for numeric value
          let cleaned = priceText.replace(/[^\d.,]/g, '');
          
          // Handle different decimal separators
          cleaned = cleaned.replace(',', '.');
          
          // Convert to number
          const num = parseFloat(cleaned);
          return {
            numeric: isNaN(num) ? null : num,
            original: original
          };
        };

        // جلب السعر من الصفحة الرئيسية فقط بالسلكتور الدقيق (مثل amazon_puppeteer)
        if (status === 'available') {
          // دالة لتنظيف السعر
          const cleanPrice = (priceText) => {
            if (!priceText) return null;
            
            let cleaned = priceText.trim();
            
            // إزالة النصوص الإضافية
            cleaned = cleaned.replace(/\s*FREE\s*Delivery\s*/gi, '');
            cleaned = cleaned.replace(/\s*FREE\s*Shipping\s*/gi, '');
            cleaned = cleaned.replace(/\s*Save\s*\d+%\s*/gi, '');
            cleaned = cleaned.replace(/\s*You\s*save\s*\d+%\s*/gi, '');
            
            // التحقق من أن السعر صالح (يحتوي على أرقام)
            if (cleaned && /\d/.test(cleaned) && cleaned.length < 50) {
              return cleaned;
            }
            
            return null;
          };

          // 1. البحث عن السعر في المكان الصحيح فقط
          let priceElement = document.querySelector('#corePrice_feature_div .a-price .a-offscreen');
          if (priceElement) {
            const priceText = cleanPrice(priceElement.innerText);
            if (priceText) {
              price = priceText;
              console.log('Main page price (corePrice_feature_div):', price);
            }
          }
          
          // 2. محاولة أخرى من corePrice_desktop
          if (!price) {
            priceElement = document.querySelector('#corePrice_desktop .a-price .a-offscreen');
            if (priceElement) {
              const priceText = cleanPrice(priceElement.innerText);
              if (priceText) {
                price = priceText;
                console.log('Main page price (corePrice_desktop):', price);
              }
            }
          }
          
          // 3. محاولة من أي عنصر سعر في الصفحة
          if (!price) {
            const allPriceElements = document.querySelectorAll('.a-price .a-offscreen');
            for (const el of allPriceElements) {
              const priceText = cleanPrice(el.innerText);
              if (priceText) {
                price = priceText;
                console.log('Main page price (fallback):', price);
                break;
              }
            }
          }
          
          // 4. محاولة من priceblock selectors
          if (!price) {
            const priceblockSelectors = [
              '#priceblock_ourprice',
              '#priceblock_dealprice', 
              '#priceblock_saleprice',
              '.a-price-whole',
              '.a-price .a-price-whole'
            ];
            
            for (const selector of priceblockSelectors) {
              const element = document.querySelector(selector);
              if (element) {
                const priceText = cleanPrice(element.innerText);
                if (priceText) {
                  price = priceText;
                  console.log('Main page price (priceblock):', price);
                  break;
                }
              }
            }
          }
          
          // 5. محاولة من أي نص يحتوي على عملة
          if (!price) {
            const currencyPatterns = [
              /EGP\s*[\d,]+\.?\d*/i,
              /AED\s*[\d,]+\.?\d*/i,
              /SAR\s*[\d,]+\.?\d*/i,
              /USD\s*[\d,]+\.?\d*/i,
              /EUR\s*[\d,]+\.?\d*/i
            ];
            
            const pageText = document.body.innerText;
            for (const pattern of currencyPatterns) {
              const match = pageText.match(pattern);
              if (match) {
                const priceText = cleanPrice(match[0]);
                if (priceText) {
                  price = priceText;
                  console.log('Main page price (currency pattern):', price);
                  break;
                }
              }
            }
          }
        }

        // Get seller info like amazon_puppeteer
        const cleanSellerName = (sellerText) => {
          if (!sellerText) return null;
          
          let cleaned = sellerText.trim();
          
          // Remove extra text
          cleaned = cleaned.replace(/\s*and\s*ships\s*from\s*Amazon\s*Fulfillment\.?/gi, '');
          cleaned = cleaned.replace(/\s*\+.*$/g, '');
          cleaned = cleaned.replace(/\s*Ships\s*from\s*Amazon\.?/gi, '');
          cleaned = cleaned.replace(/\s*Fulfilled\s*by\s*Amazon\.?/gi, '');
          cleaned = cleaned.replace(/\s*Sold\s*by\s*/gi, '');
          cleaned = cleaned.replace(/\s*Shipped\s*by\s*/gi, '');
          
          // Remove extra punctuation
          cleaned = cleaned.replace(/^[.,\s]+|[.,\s]+$/g, '');
          
          if (cleaned && cleaned.length > 0 && cleaned.length < 100) {
            return cleaned;
          }
          
          return null;
        };

        // Try multiple seller sources
        let seller = null;
        
        // 1. Try #sellerProfileTriggerId
        seller = document.querySelector('#sellerProfileTriggerId')?.innerText;
        if (seller) {
          const cleaned = cleanSellerName(seller);
                      if (cleaned) {
              console.log('Found seller from #sellerProfileTriggerId:', cleaned);
              sellerName = cleaned;
              hasBuybox = true;
            }
        }
        
        // 2. Try offer-display-feature-text (Amazon.eg)
        if (!sellerName) {
          const offerDisplayText = document.querySelector('.offer-display-feature-text-message');
          if (offerDisplayText) {
            seller = offerDisplayText.innerText.trim();
            if (seller && (seller.includes('Amazon') || seller.includes('amazon'))) {
              const cleaned = cleanSellerName(seller);
              if (cleaned) {
                console.log('Found seller from offer-display-feature-text:', cleaned);
                sellerName = cleaned;
                hasBuybox = true;
              }
            }
          }
        }
        
        // 3. Try "Sold by" text
        if (!sellerName) {
          const soldByElements = Array.from(document.querySelectorAll('*')).find(el => 
            el.textContent?.includes('Sold by') && el.textContent?.includes('Amazon')
          );
          if (soldByElements) {
            const text = soldByElements.textContent;
            const match = text.match(/Sold by\s*([^,\n]+)/i);
            if (match && match[1]) {
              const cleaned = cleanSellerName(match[1]);
              if (cleaned) {
                console.log('Found seller from Sold by text:', cleaned);
                sellerName = cleaned;
                hasBuybox = true;
              }
            }
          }
        }
        
        // 4. محاولة من merchant-info (مثل amazon_puppeteer)
        if (!sellerName) {
          const merchantInfo = document.querySelector('[data-csa-c-content-id="desktop-merchant-info"] .offer-display-feature-text-message');
          if (merchantInfo) {
            seller = merchantInfo.innerText.trim();
            if (seller) {
              const cleaned = cleanSellerName(seller);
              if (cleaned) {
                console.log('Found seller from merchant-info:', cleaned);
                sellerName = cleaned;
                hasBuybox = true;
              }
            }
          }
        }
        
        // 5. محاولة من "Ships from" و "Sold by" (مثل amazon_puppeteer)
        if (!sellerName) {
          const shipSoldElements = Array.from(document.querySelectorAll('*')).find(el => 
            el.textContent?.includes('Ships from') && el.textContent?.includes('Sold by')
          );
          if (shipSoldElements) {
            const text = shipSoldElements.textContent;
            const soldMatch = text.match(/Sold by\s*([^,\n]+)/i);
            if (soldMatch && soldMatch[1]) {
              const cleaned = cleanSellerName(soldMatch[1]);
              if (cleaned) {
                console.log('Found seller from Ships from/Sold by:', cleaned);
                sellerName = cleaned;
                hasBuybox = true;
              }
            }
          }
        }
        
        // 6. محاولة من أي نص يحتوي على Amazon (مثل amazon_puppeteer)
        if (!sellerName) {
          const amazonElements = Array.from(document.querySelectorAll('*')).find(el => 
            el.textContent?.includes('Amazon.eg') || el.textContent?.includes('Amazon.ae') || el.textContent?.includes('Amazon.sa')
          );
          if (amazonElements) {
            const text = amazonElements.textContent;
            const amazonMatch = text.match(/(Amazon\.(?:eg|ae|sa|com))/i);
            if (amazonMatch && amazonMatch[1]) {
              console.log('Found seller from Amazon elements:', amazonMatch[1]);
              sellerName = amazonMatch[1];
              hasBuybox = true;
            }
          }
        }
        
        // 7. محاولة من الصفحة بأكملها (مثل amazon_puppeteer)
        if (!sellerName) {
          const pageText = document.body.innerText;
          const amazonRegex = /(Amazon\.(?:eg|ae|sa|com))/i;
          const match = pageText.match(amazonRegex);
          if (match && match[1]) {
            console.log('Found seller from page text:', match[1]);
            sellerName = match[1];
            hasBuybox = true;
          }
        }
        
        // 8. Try "See all buying options" page if we clicked it (like amazon_puppeteer)
        if (!sellerName || !price) {
          // Look for data in the offers sidebar (like amazon_puppeteer)
          const offers = Array.from(document.querySelectorAll('div[id^="aod-offer"]'));
          for (const offer of offers) {
            const priceEl = offer.querySelector('.a-section.a-spacing-none.aok-align-center.aok-relative > span.aok-offscreen');
            let sellerEl = offer.querySelector('div#aod-offer-soldBy a.a-size-small.a-link-normal');
            
            // إذا لم يجد البائع بالطريقة العادية، جرب طرق أخرى (مثل amazon_puppeteer)
            if (!sellerEl) {
              sellerEl = offer.querySelector('.aod-offer-soldBy .a-size-small');
            }
            if (!sellerEl) {
              sellerEl = offer.querySelector('[data-csa-c-content-id="aod-offer-soldBy"] .a-size-small');
            }
            if (!sellerEl) {
              sellerEl = offer.querySelector('.aod-offer-soldBy');
            }
            
            if (priceEl) {
              const priceText = priceEl.innerText.trim();
              // التحقق من أن السعر صالح
              if (priceText && /\d/.test(priceText)) {
                // إذا لم يكن لدينا سعر من الصفحة الرئيسية، استخدم سعر الـ sidebar
                if (!price) {
                  price = priceText;
                  console.log('Sidebar price:', price);
                }
                
                const sellerText = sellerEl ? sellerEl.innerText.trim() : null;
                const cleanedSeller = cleanSellerName(sellerText);
                if (cleanedSeller && !sellerName) {
                  console.log('Found seller from sidebar:', cleanedSeller);
                  sellerName = cleanedSeller;
                  hasBuybox = true;
                  break;
                }
              }
            }
          }
        }

        // 9. Try Arabic patterns
        if (!sellerName) {
          const patterns = [
            /تباع بواسطة\s+(.+?)(?:\s|$)/i,
            /يبيع هذا المنتج\s+(.+?)(?:\s|$)/i,
            /(.+?)\s+يبيع/i,
            /(.+?)\s+البائع/i,
            /(.+?)\s+متجر/i,
            /(.+?)\s+شركة/i
          ];
          
          for (const pattern of patterns) {
            const match = document.body.innerText.match(pattern);
            if (match) {
              const cleaned = cleanSellerName(match[1]);
              if (cleaned) {
                console.log('Found Arabic seller:', cleaned);
                sellerName = cleaned;
                hasBuybox = true;
                break;
              }
            }
          }
        }

        // Get total offers
        const offersText = document.querySelector('#olp-sl-new')?.innerText;
        if (offersText) {
          const match = offersText.match(/(\d+)\s+new offers?/i);
          if (match) {
            totalOffers = parseInt(match[1]);
            console.log('Found offers:', totalOffers);
          }
        }

        return { 
          price, // السعر الوحيد مع العملة
          title, 
          imageUrl, // صورة المنتج
          sellerName, 
          sellerId: null, 
          hasBuybox, 
          totalOffers,
          link: window.location.href, // رابط المنتج
          dataSource: 'main_page' // مصدر البيانات
        };
      });

      await page.close();

      console.log('📊 Extracted data:', pageData);
      console.log('🔍 Debug - pageData.imageUrl:', pageData.imageUrl);

      // Check if we have valid data
      if (!pageData.price && !pageData.title) {
        return {
          success: false,
          error: 'Product not found or no longer available. Please check the ASIN and try again.'
        };
      }

      return {
        success: true,
        data: {
          price: pageData.price, // السعر الوحيد مع العملة
          title: pageData.title,
          imageUrl: pageData.imageUrl, // صورة المنتج
          sellerName: pageData.sellerName,
          sellerId: pageData.sellerId,
          hasBuybox: pageData.hasBuybox,
          totalOffers: pageData.totalOffers,
          link: pageData.link, // رابط المنتج
          dataSource: pageData.dataSource, // مصدر البيانات
          asin: asin // ASIN المنتج
        }
      };

    } catch (error) {
      console.error('❌ Error scraping product:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateProductPrice(product) {
    try {
      // Generate unique session ID for this scraping operation
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`🆔 Starting scraping session ${sessionId} for ${product.asin}`);
      
      let scrapeResult = await this.scrapeProductPrice(product.asin, product.region);
      
      console.log('🔍 Debug - scrapeResult.data:', scrapeResult.data);
      console.log('🔍 Debug - scrapeResult.data.imageUrl:', scrapeResult.data?.imageUrl);
      
      if (!scrapeResult.success) {
        console.log(`❌ Scraping failed for ${product.asin} (${sessionId}):`, scrapeResult.error);
        
        // Check if it's a network error and retry once
        if (scrapeResult.error.includes('ERR_SOCKET_NOT_CONNECTED') || 
            scrapeResult.error.includes('net::') ||
            scrapeResult.error.includes('timeout')) {
          console.log(`🔄 Network error detected, retrying once for ${product.asin} (${sessionId})...`);
          
          // Wait 10 seconds before retry
          await new Promise(resolve => setTimeout(resolve, 10000));
          
          const retryResult = await this.scrapeProductPrice(product.asin, product.region);
          if (retryResult.success) {
            console.log(`✅ Retry successful for ${product.asin} (${sessionId})`);
            scrapeResult = retryResult;
          } else {
            console.log(`❌ Retry also failed for ${product.asin} (${sessionId}):`, retryResult.error);
            return { success: false, error: retryResult.error };
          }
        } else {
          return { success: false, error: scrapeResult.error };
        }
      }

      // Validate scraped data before processing
      if (!scrapeResult.data || !scrapeResult.data.price) {
        console.log(`⚠️ Invalid data for ${product.asin} (${sessionId}): No price found`);
        return { success: false, error: 'No valid price data found' };
      }

      console.log(`✅ Scraping completed for ${product.asin} (${sessionId}): Price = ${scrapeResult.data.price}`);

      // Double-check that we're updating the correct product
      if (scrapeResult.data.title && !scrapeResult.data.title.toLowerCase().includes(product.asin.toLowerCase())) {
        console.log(`⚠️ Title mismatch for ${product.asin} (${sessionId}): "${scrapeResult.data.title}"`);
      }

      const currentPrice = this.extractNumericPrice(scrapeResult.data.price);
      if (!currentPrice) {
        console.log(`❌ Invalid price format for ${product.asin} (${sessionId}): ${scrapeResult.data.price}`);
        return { success: false, error: 'Invalid price format' };
      }

      // Get previous price for comparison
      const previousPrice = product.current_price;
      const priceChange = previousPrice ? currentPrice - previousPrice : 0;
      const priceChangePercentage = previousPrice ? (priceChange / previousPrice) * 100 : 0;

      // Calculate next scrape time
      const nextScrape = new Date();
      nextScrape.setMinutes(nextScrape.getMinutes() + product.scrape_interval);

      // Update product in database
      const { error: updateError } = await supabase
        .from('price_monitor_products')
        .update({
          current_price: currentPrice,
          previous_price: previousPrice,
          price_change: priceChange,
          price_change_percentage: priceChangePercentage,
          last_scraped: new Date().toISOString(),
          next_scrape: nextScrape.toISOString(),
          title: scrapeResult.data.title || product.title,
          image_url: scrapeResult.data.imageUrl || product.image_url,
          seller_name: scrapeResult.data.sellerName || product.seller_name,
          has_buybox: scrapeResult.data.hasBuybox || false,
          total_offers: scrapeResult.data.totalOffers || product.total_offers,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (updateError) {
        console.error(`❌ Database update failed for ${product.asin} (${sessionId}):`, updateError);
        throw updateError;
      }

      console.log(`💾 Database updated for ${product.asin} (${sessionId})`);

      // Save price history
      const { error: historyError } = await supabase
        .from('price_history')
        .insert({
          product_id: product.id,
          asin: product.asin,
          price: currentPrice,
          price_display: scrapeResult.data.price,
          region: product.region,
          scraped_at: new Date().toISOString()
        });

      if (historyError) {
        console.error(`❌ Price history save failed for ${product.asin} (${sessionId}):`, historyError);
      } else {
        console.log(`📊 Price history saved for ${product.asin} (${sessionId})`);
      }

      // Save seller info
      await this.saveSellerInfo(product.id, product.asin, product.region, scrapeResult.data, sessionId);

      // Send product data to Telegram instead of alerts
      try {
        console.log(`📱 Sending product data to Telegram for ${product.asin} (${sessionId})`);
        
        // Get My Account info - get first active account since region column doesn't exist
        const { data: myAccounts, error: myAccountError } = await supabase
          .from('seller_accounts')
          .select('seller_name')
          .eq('is_active', true)
          .limit(1);

        const myAccount = myAccounts && myAccounts.length > 0 ? myAccounts[0] : null;
        console.log(`🔍 Debug - My Account query:`, { myAccounts, myAccountError });
        console.log(`🔍 Debug - My Account seller_name: ${myAccount?.seller_name}`);

        const productData = {
          asin: product.asin,
          title: scrapeResult.data.title || product.title || 'Unknown Product',
          region: product.region,
          price: scrapeResult.data.price || 'N/A',
          seller_name: scrapeResult.data.sellerName || 'Unknown',
          has_buybox: scrapeResult.data.hasBuybox || false,
          my_account: myAccount?.seller_name || 'N/A',
          image_url: scrapeResult.data.imageUrl || null
        };
        
        console.log(`🔍 Debug - Image URL: ${productData.image_url}`);
        console.log(`🔍 Debug - Scrape result imageUrl: ${scrapeResult.data.imageUrl}`);
        console.log(`🔍 Debug - Product image_url: ${product.image_url}`);
        
        const success = await telegramService.sendProductData(productData);
        
        if (success) {
          console.log(`✅ Product data sent to Telegram successfully for ${product.asin} (${sessionId})`);
        } else {
          console.log(`❌ Failed to send product data to Telegram for ${product.asin} (${sessionId})`);
        }
      } catch (telegramError) {
        console.error(`❌ Error sending product data to Telegram for ${product.asin} (${sessionId}):`, telegramError);
      }

      console.log(`✅ Product update completed for ${product.asin} (${sessionId})`);
      return { 
        success: true, 
        data: {
          asin: product.asin,
          price: currentPrice,
          priceChange,
          priceChangePercentage,
          sessionId
        }
      };

    } catch (error) {
      console.error(`❌ Error updating product ${product.asin}:`, error);
      return { success: false, error: error.message };
    }
  }

  async saveSellerInfo(productId, asin, region, scrapeResult, sessionId) {
    try {
      console.log(`🏪 Saving seller info for ${asin} (${sessionId})...`);
      
      // Get previous seller info for comparison
      const { data: previousSeller } = await supabase
        .from('seller_info')
        .select('*')
        .eq('asin', asin)
        .eq('region', region)
        .single();

      // Prepare seller data
      const sellerData = {
        product_id: productId,
        asin: asin,
        seller_name: scrapeResult.sellerName || null,
        seller_id: scrapeResult.sellerId || null,
        has_buybox: scrapeResult.hasBuybox || false,
        buybox_price: scrapeResult.buyboxPrice || null,
        total_offers: scrapeResult.totalOffers || 0,
        region: region,
        scraped_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Validate seller data before saving
      if (!sellerData.seller_name) {
        console.log(`⚠️ No seller name found for ${asin} (${sessionId}), skipping seller info save`);
        return;
      }

      console.log(`💾 Saving seller info for ${asin} (${sessionId}): ${sellerData.seller_name}${sellerData.has_buybox ? ' (Buy Box)' : ''}`);

      // Update seller_info table
      const { error: sellerError } = await supabase
        .from('seller_info')
        .upsert([sellerData], { 
          onConflict: 'asin,region',
          ignoreDuplicates: false 
        });

      // If upsert fails, try delete then insert
      if (sellerError) {
        console.log(`🔄 Upsert failed for ${asin} (${sessionId}), trying delete then insert...`);
        
        // Delete existing record
        await supabase
          .from('seller_info')
          .delete()
          .eq('asin', asin)
          .eq('region', region);

        // Insert new record
        const { error: insertError } = await supabase
          .from('seller_info')
          .insert([sellerData]);

        if (insertError) throw insertError;
      }

      // Note: seller_history table doesn't exist, skipping history save
      // const { error: historyError } = await supabase
      //   .from('seller_history')
      //   .insert([sellerData]);

      // if (historyError) throw historyError;

      if (scrapeResult.sellerName) {
        console.log(`🏪 Seller info saved for ${asin} (${sessionId}): ${scrapeResult.sellerName}${scrapeResult.hasBuybox ? ' (Buy Box)' : ''}`);
      }

      // Check for Buy Box changes and send Telegram alerts
      if (previousSeller && previousSeller.seller_name !== scrapeResult.sellerName) {
        console.log(`🔄 Buy Box changed for ${asin} (${sessionId}): ${previousSeller.seller_name} → ${scrapeResult.sellerName}`);
        
        // Get product title for the alert
        const { data: product } = await supabase
          .from('price_monitor_products')
          .select('title, current_price')
          .eq('asin', asin)
          .single();

        // Validate data before creating alert
        if (!product || !product.title) {
          console.log(`⚠️ Skipping Buy Box alert for ${asin} (${sessionId}): Invalid product data`);
          return;
        }

        const alertData = {
          asin: asin,
          product_title: product.title,
          old_seller: previousSeller.seller_name || 'Unknown',
          new_seller: scrapeResult.sellerName || 'Unknown',
          price: product.current_price || 'N/A',
          region: region,
          session_id: sessionId,
          timestamp: new Date().toISOString()
        };

        // Validate alert data before sending
        if (alertData.product_title && alertData.product_title !== 'Unknown Product') {
                  // Log Buy Box changes for debugging
        if (previousSeller.has_buybox && !scrapeResult.hasBuybox) {
          // We lost the Buy Box
          console.log(`🚨 Buy Box Lost for ${asin} (${sessionId})`);
          console.log(`📊 Buy Box Lost data:`, alertData);
        } else if (!previousSeller.has_buybox && scrapeResult.hasBuybox) {
          // We won the Buy Box
          console.log(`🎉 Buy Box Won for ${asin} (${sessionId})`);
          console.log(`📊 Buy Box Won data:`, alertData);
        }

        // Send Telegram Buy Box alerts using the new service
        try {
          if (previousSeller.has_buybox && !scrapeResult.hasBuybox) {
            // We lost the Buy Box
            console.log(`📱 Sending Buy Box Lost alert for ${asin} (${sessionId})`);
            const success = await telegramService.sendBuyBoxLostAlert(alertData);
            
            if (success) {
              await telegramService.saveAlertLog({
                alert_type: 'buybox_lost',
                ...alertData,
                message_sent: true,
                sent_at: new Date().toISOString()
              });
              console.log(`✅ Buy Box Lost alert sent successfully for ${asin} (${sessionId})`);
            }
          } else if (!previousSeller.has_buybox && scrapeResult.hasBuybox) {
            // We won the Buy Box
            console.log(`📱 Sending Buy Box Won alert for ${asin} (${sessionId})`);
            const success = await telegramService.sendBuyBoxWonAlert(alertData);
            
            if (success) {
              await telegramService.saveAlertLog({
                alert_type: 'buybox_won',
                ...alertData,
                message_sent: true,
                sent_at: new Date().toISOString()
              });
              console.log(`✅ Buy Box Won alert sent successfully for ${asin} (${sessionId})`);
            }
          }
        } catch (telegramError) {
          console.error(`❌ Error sending Buy Box alert for ${asin} (${sessionId}):`, telegramError);
        }
        } else {
          console.log(`⚠️ Skipping Buy Box alert for ${asin} (${sessionId}): Invalid product title`);
        }
      }

    } catch (error) {
      console.error(`❌ Error saving seller info for ${asin} (${sessionId}):`, error.message);
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

      console.log(`🚨 Price alert created for ${product.asin}: ${alertType} of ${Math.abs(updatedProduct.price_change_percentage).toFixed(1)}%`);

      if (Math.abs(updatedProduct.price_change_percentage) >= 5) {
        console.log(`📱 Price change alert for ${product.asin}: ${updatedProduct.price_change_percentage.toFixed(1)}%`);
        
        const { data: sellerInfo } = await supabase
          .from('seller_info')
          .select('seller_name')
          .eq('asin', product.asin)
          .eq('region', product.region)
          .single();

        const alertData = {
          asin: product.asin,
          product_title: product.title || 'Unknown Product',
          old_price: product.current_price || 'N/A',
          new_price: updatedProduct.current_price || 'N/A',
          price_change: updatedProduct.price_change || 0,
          price_change_percentage: updatedProduct.price_change_percentage || 0,
          region: product.region,
          seller_name: sellerInfo?.seller_name || 'Unknown'
        };

        console.log(`📊 Price change alert data:`, alertData);
        
        // Send Telegram price change alert using the new service
        try {
          console.log(`📱 Sending Telegram price change alert for ${product.asin}`);
          const success = await telegramService.sendPriceChangeAlert(alertData);
          
          if (success) {
            await telegramService.saveAlertLog({
              alert_type: 'price_change',
              ...alertData,
              message_sent: true,
              sent_at: new Date().toISOString()
            });
            console.log(`✅ Telegram price change alert sent successfully for ${product.asin}`);
          } else {
            console.log(`❌ Failed to send Telegram price change alert for ${product.asin}`);
          }
        } catch (telegramError) {
          console.error(`❌ Error sending Telegram price change alert for ${product.asin}:`, telegramError);
        }
      }

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
      return { success: false, error: error.message };
    }
  }

  async runMonitoringCycle() {
    try {
      console.log('🔄 Starting monitoring cycle...');

      // Ensure browser is initialized
      if (!this.browser || !this.browser.isConnected()) {
        console.log('🔄 Browser not ready, initializing...');
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize browser for monitoring cycle');
        }
      }

      console.log('🌐 Browser is ready for scraping');

      const dueProductsResult = await this.getProductsDueForScraping();
      if (!dueProductsResult.success) {
        throw new Error(dueProductsResult.error);
      }

      const dueProducts = dueProductsResult.data;
      if (dueProducts.length === 0) {
        console.log('📭 No products due for scraping');
        return { success: true, processed: 0, errors: 0 };
      }

      console.log(`📋 Found ${dueProducts.length} products due for scraping:`, dueProducts.map(p => p.asin));
      console.log('🔍 Processing products SEQUENTIALLY to avoid data conflicts...');
      console.log('👁️ You will see browser windows opening one by one for each product!');

      let processed = 0;
      let errors = 0;

      // Process products SEQUENTIALLY (one by one) instead of in parallel
      for (let i = 0; i < dueProducts.length; i++) {
        const product = dueProducts[i];
        
        try {
          console.log(`🔄 Processing ${product.asin} (${product.region}) - Product ${i + 1}/${dueProducts.length}...`);
          
          // Add longer delay between products to prevent conflicts
          if (i > 0) {
            console.log(`⏳ Waiting ${config.timing.delayBetweenProducts / 1000} seconds before processing next product...`);
            await new Promise(resolve => setTimeout(resolve, config.timing.delayBetweenProducts));
          }
          
          const result = await this.updateProductPrice(product);
          if (result.success) {
            processed++;
            console.log(`✅ Successfully processed ${product.asin}`);
          } else {
            errors++;
            console.error(`❌ Failed to process ${product.asin}:`, result.error);
          }

          // Add additional delay after each product
          console.log(`⏳ Waiting ${config.timing.delayAfterProduct / 1000} seconds after processing ${product.asin}...`);
          await new Promise(resolve => setTimeout(resolve, config.timing.delayAfterProduct));

        } catch (error) {
          errors++;
          console.error(`❌ Error processing ${product.asin}:`, error);
          
          // Add delay even after errors
          console.log(`⏳ Waiting ${config.timing.delayAfterError / 1000} seconds after error with ${product.asin}...`);
          await new Promise(resolve => setTimeout(resolve, config.timing.delayAfterError));
        }
      }

      console.log(`✅ Monitoring cycle completed: ${processed} processed, ${errors} errors`);
      return { success: true, processed, errors };

    } catch (error) {
      console.error('❌ Error running monitoring cycle:', error);
      return { success: false, processed: 0, errors: 0, error: error.message };
    }
  }

  async startMonitoring() {
    if (this.isRunning) {
      console.log('⚠️ Monitoring is already running');
      return;
    }

    const initialized = await this.initialize();
    if (!initialized) {
      console.error('❌ Failed to initialize monitoring service');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Price monitoring started');

    // Run initial cycle immediately
    console.log('🔄 Running initial monitoring cycle...');
    await this.runMonitoringCycle();

    // Set up interval for continuous monitoring (increased from 60s to 300s)
    this.monitoringInterval = setInterval(async () => {
      if (this.isRunning) {
        console.log('🔄 Running scheduled monitoring cycle...');
        await this.runMonitoringCycle();
      }
    }, config.timing.monitoringInterval); // Use configurable interval

    console.log(`⏰ Monitoring interval set to ${config.timing.monitoringInterval / 1000} seconds (${config.timing.monitoringInterval / 60000} minutes)`);
  }

  async stopMonitoring() {
    if (!this.isRunning) {
      console.log('⚠️ Monitoring is not running');
      return;
    }

    this.isRunning = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    console.log('🛑 Price monitoring stopped');
  }

  async getMonitoringStats() {
    try {
      const { data: products, error: productsError } = await supabase
        .from('price_monitor_products')
        .select('*');

      if (productsError) throw productsError;

      const stats = {
        totalProducts: products?.length || 0,
        activeProducts: products?.filter(p => p.is_active).length || 0,
        dueForScraping: products?.filter(p => p.is_active && new Date(p.next_scrape) <= new Date()).length || 0,
        priceChanges: products?.filter(p => p.price_change !== null).length || 0
      };

      return { success: true, data: stats };

    } catch (error) {
      console.error('Error fetching monitoring stats:', error);
      return { success: false, error: error.message };
    }
  }

  // التحقق من أن البائع من الحسابات الخاصة بك
  async isMySeller(sellerName, region) {
    try {
      console.log(`🔍 Starting seller check for: "${sellerName}" in region: ${region}`);
      
      // قراءة الحسابات الخاصة بك من قاعدة البيانات
      const { data: myAccounts, error } = await supabase
        .from('seller_accounts')
        .select('seller_name')
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error fetching seller accounts:', error);
        return false;
      }

      // استخراج أسماء البائعين من النتائج
      const mySellerNames = myAccounts?.map(account => account.seller_name) || [];

      console.log(`🔍 Found ${mySellerNames.length} active seller accounts:`, mySellerNames);
      console.log(`🔍 Checking seller "${sellerName}" against my accounts:`, mySellerNames);

      // التحقق من أن اسم البائع موجود في القائمة
      const isMySeller = mySellerNames.some(mySeller => 
        sellerName && sellerName.toLowerCase().includes(mySeller.toLowerCase())
      );

      if (isMySeller) {
        console.log(`✅ Seller "${sellerName}" is one of my accounts`);
      } else {
        console.log(`❌ Seller "${sellerName}" is NOT one of my accounts (Competitor)`);
      }

      return isMySeller;
    } catch (error) {
      console.error('❌ Error checking seller:', error);
      return false;
    }
  }
}

// Export the service
module.exports = PriceMonitorService;

// If running directly, start the service
if (require.main === module) {
  const service = new PriceMonitorService();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await service.stopMonitoring();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await service.stopMonitoring();
    process.exit(0);
  });

  // Start the service
  service.startMonitoring().catch(error => {
    console.error('❌ Failed to start monitoring service:', error);
    process.exit(1);
  });
}