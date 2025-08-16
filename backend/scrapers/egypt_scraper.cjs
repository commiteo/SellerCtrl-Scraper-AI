const puppeteer = require('puppeteer');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function scrapeEgypt(asin) {
  console.error('=== EGYPT SCRAPER STARTING ===');
  let browser;
  
  try {
    console.error(`🇪🇬 Egypt Single Attempt - ASIN: ${asin}`);
      
      browser = await puppeteer.launch({
        executablePath: EDGE_PATH,
        headless: false,
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
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });
      
      const page = await browser.newPage();
      
      // Set longer timeouts for slow connections
      page.setDefaultNavigationTimeout(60000);
      page.setDefaultTimeout(30000);
      
      // Set headers to avoid detection
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

      const productUrl = `https://www.amazon.eg/dp/${asin}?language=en_AE`;
      console.error(`🌐 Opening Egypt URL: ${productUrl}`);
      
      // Try to load page with retries for network issues
      try {
        await page.goto(productUrl, { 
          waitUntil: 'domcontentloaded', 
          timeout: 60000 
        });
        console.error('✅ Egypt PAGE LOADED SUCCESSFULLY');
      } catch (navError) {
        console.error(`⚠️ Egypt Navigation failed, retrying... Error: ${navError.message}`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.goto(productUrl, { 
          waitUntil: 'networkidle2', 
          timeout: 90000 
        });
        console.error('✅ Egypt PAGE LOADED ON RETRY');
      }

      // Handle security page and delivery location
      const pageContent = await page.content();
      if (pageContent.includes('security') || pageContent.includes('continue shopping')) {
        console.error('🔒 Egypt Security page detected, handling...');
        const continueButton = await page.$('input[type="submit"][value*="Continue"]');
        if (continueButton) {
          await continueButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.error('✅ Egypt Security page bypassed');
        }
      }

      // Wait for page readiness
      console.error('🔍 Egypt Checking page readiness...');
      
      let essentialElements = null;
      try {
        essentialElements = await page.evaluate(() => {
          return {
            hasTitle: !!document.querySelector('#productTitle'),
            hasImage: !!document.querySelector('#landingImage'),
            hasPrice: !!document.querySelector('span.a-price span.a-offscreen, #priceblock_ourprice, #priceblock_dealprice, #priceblock_saleprice')
          };
        });
      } catch (evalError) {
        console.error('⚠️ Egypt Page evaluation failed:', evalError.message);
        essentialElements = { hasTitle: false, hasImage: false, hasPrice: false };
      }

      if (essentialElements.hasTitle && essentialElements.hasImage) {
        console.error('⚡ Egypt Elements ready immediately!');
        console.error('⏳ Egypt Additional stability wait...');
        await new Promise(resolve => setTimeout(resolve, 60000)); // 1 MINUTE even if elements are ready
      } else {
        console.error('⏳ Egypt Waiting for elements to load...');
        await new Promise(resolve => setTimeout(resolve, 120000)); // 2 MINUTES for slow loading
      }

      // Additional page stability wait
      console.error('🔄 Egypt Ensuring page stability...');
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds extra stability
      
      console.error('✅ Egypt Page ready for data extraction');

      // Extract product data with error handling
      let data = null;
      try {
        data = await page.evaluate(() => {
          // Product status check
          const productStatus = (() => {
            const unavailableSelectors = [
              '[data-feature-name="availability"] .a-color-state',
              '#availability .a-color-state',
              '.availability .a-color-state'
            ];
            
            for (const selector of unavailableSelectors) {
              const element = document.querySelector(selector);
              if (element && element.innerText.toLowerCase().includes('unavailable')) {
                return 'unavailable';
              }
            }
            
            return 'available';
          })();

          // Title extraction
          const titleElement = document.querySelector('#productTitle');
          const title = titleElement ? titleElement.innerText.trim() : null;
          
          // Price extraction 
          let price = null;
          const priceSelectors = [
            'span.a-price.a-text-price.a-size-medium.apexPriceToPay span.a-offscreen',
            'span.a-price span.a-offscreen',
            '#priceblock_ourprice',
            '#priceblock_dealprice', 
            '#priceblock_saleprice',
            '.a-price-whole'
          ];
          
          for (const selector of priceSelectors) {
            const element = document.querySelector(selector);
            if (element) {
              let priceText = element.innerText || element.textContent;
              if (priceText) {
                const match = priceText.match(/[\d,]+\.?\d*/);
                if (match) {
                  price = parseFloat(match[0].replace(/,/g, ''));
                  break;
                }
              }
            }
          }
          
          // Image extraction
          const imageElement = document.querySelector('#landingImage');
          const imageUrl = imageElement ? imageElement.src : null;
          
          // Seller extraction
          let seller = null;
          const sellerSelectors = [
            '#merchant-info a',
            '.contributorNameID',
            '[data-automation-id="merchant-info"]'
          ];
          
          for (const selector of sellerSelectors) {
            const element = document.querySelector(selector);
            if (element && element.innerText.trim()) {
              seller = element.innerText.trim();
              break;
            }
          }
          
          return {
            asin: null, // Will be set by calling function
            title,
            price,
            currency: 'EGP',
            seller,
            imageUrl,
            productUrl: window.location.href,
            dataSource: 'egypt_scraper',
            status: productStatus === 'unavailable' ? 'unavailable' : 'success'
          };
        });
        
      } catch (extractError) {
        console.error('⚠️ Egypt Data extraction failed:', extractError.message);
        data = {
          asin: asin,
          title: null,
          price: null,
          currency: 'EGP',
          seller: null,
          imageUrl: null,
          productUrl: productUrl,
          dataSource: 'egypt_scraper',
          status: 'failed'
        };
      }

      // Set ASIN
      if (data) {
        data.asin = asin;
      }

      // Final data processing wait
      console.error('🔄 Egypt Final data processing...');
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds for data processing

      console.error(`✅ Egypt Scraping successful! Closing immediately after data extraction.`);
      
      console.error(`🔒 Closing Egypt browser...`);
      await browser.close();
      
      return data;
      
  } catch (err) {
    console.error(`❌ Egypt SINGLE ATTEMPT FAILED:`, err.message);
    
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error('Egypt Error closing browser:', closeErr);
      }
    }
    
    // Return error data immediately - no retries
    const errorData = {
      asin,
      title: null,
      price: null,
      currency: 'EGP',
      seller: null,
      imageUrl: null,
      productUrl: null,
      dataSource: 'egypt_scraper',
      status: 'failed',
      errorMessage: `Egypt single attempt failed: ${err.message}`
    };
    return errorData;
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: node egypt_scraper.cjs <ASIN>');
  process.exit(1);
}

const asin = args[0];

// Validate ASIN
if (!/^[A-Z0-9]{10}$/.test(asin)) {
  console.error('Error: Invalid ASIN format');
  process.exit(1);
}

// Run the scraper
scrapeEgypt(asin)
  .then(result => {
    console.log(JSON.stringify(result));
  })
  .catch(error => {
    console.error('Egypt Fatal error:', error);
    const errorResult = {
      asin,
      title: null,
      price: null,
      currency: 'EGP',
      seller: null,
      imageUrl: null,
      productUrl: null,
      dataSource: 'egypt_scraper',
      status: 'failed',
      errorMessage: error.message
    };
    console.log(JSON.stringify(errorResult));
  }); 