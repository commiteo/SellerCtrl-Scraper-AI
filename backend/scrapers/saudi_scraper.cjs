const puppeteer = require('puppeteer');
const CHROME_PATH = process.env.CHROME_EXECUTABLE_PATH || process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome';

async function scrapeSaudi(asin) {
  console.error('=== SAUDI SCRAPER STARTING ===');
  let browser;
  
  try {
    console.error(`🇸🇦 Saudi Single Attempt - ASIN: ${asin}`);
      
      browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: process.env.HEADLESS === 'false' ? false : true, // Dynamic headless mode
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
      
      page.setDefaultNavigationTimeout(60000);
      page.setDefaultTimeout(30000);
      
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1'
      });

      const productUrl = `https://www.amazon.sa/dp/${asin}?language=en_AE`;
      console.error(`🌐 Opening Saudi URL: ${productUrl}`);
      
      try {
        await page.goto(productUrl, { 
          waitUntil: 'domcontentloaded', 
          timeout: 60000 
        });
        console.error('✅ Saudi PAGE LOADED SUCCESSFULLY');
      } catch (navError) {
        console.error(`⚠️ Saudi Navigation failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.goto(productUrl, { 
          waitUntil: 'networkidle2', 
          timeout: 90000 
        });
        console.error('✅ Saudi PAGE LOADED ON RETRY');
      }

      // Handle security page
      const pageContent = await page.content();
      if (pageContent.includes('security') || pageContent.includes('continue shopping')) {
        console.error('🔒 Saudi Security page detected, handling...');
        const continueButton = await page.$('input[type="submit"][value*="Continue"]');
        if (continueButton) {
          await continueButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.error('✅ Saudi Security page bypassed');
        }
      }

      console.error('🔍 Saudi Checking page readiness...');
      
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
        console.error('⚠️ Saudi Page evaluation failed:', evalError.message);
        essentialElements = { hasTitle: false, hasImage: false, hasPrice: false };
      }

      if (!essentialElements.hasTitle) {
        console.error('⏳ Saudi Waiting for elements to load...');
        await new Promise(resolve => setTimeout(resolve, 120000)); // 2 MINUTES for slow loading
      } else {
        console.error('⚡ Saudi Elements ready, additional stability wait...');
        await new Promise(resolve => setTimeout(resolve, 60000)); // 1 MINUTE even if elements are ready
      }

      // Additional page stability wait
      console.error('🔄 Saudi Ensuring page stability...');
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds extra stability

      console.error('✅ Saudi Page ready for data extraction');

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
          
          // Price extraction for Saudi (SAR)
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
            asin: null,
            title,
            price,
            currency: 'SAR',
            seller,
            imageUrl,
            productUrl: window.location.href,
            dataSource: 'saudi_scraper',
            status: productStatus === 'unavailable' ? 'unavailable' : 'success'
          };
        });
        
      } catch (extractError) {
        console.error('⚠️ Saudi Data extraction failed:', extractError.message);
        data = {
          asin: asin,
          title: null,
          price: null,
          currency: 'SAR',
          seller: null,
          imageUrl: null,
          productUrl: productUrl,
          dataSource: 'saudi_scraper',
          status: 'failed'
        };
      }

      if (data) {
        data.asin = asin;
      }

      // Final data processing wait
      console.error('🔄 Saudi Final data processing...');
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds for data processing

      console.error(`✅ Saudi Scraping successful! Closing immediately after data extraction.`);
      
      console.error(`🔒 Closing Saudi browser...`);
      await browser.close();
      
      return data;
      
  } catch (err) {
    console.error(`❌ Saudi SINGLE ATTEMPT FAILED:`, err.message);
    
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error('Saudi Error closing browser:', closeErr);
      }
    }
    
    // Return error data immediately - no retries
    const errorData = {
      asin,
      title: null,
      price: null,
      currency: 'SAR',
      seller: null,
      imageUrl: null,
      productUrl: null,
      dataSource: 'saudi_scraper',
      status: 'failed',
      errorMessage: `Saudi single attempt failed: ${err.message}`
    };
    return errorData;
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: node saudi_scraper.cjs <ASIN>');
  process.exit(1);
}

const asin = args[0];

if (!/^[A-Z0-9]{10}$/.test(asin)) {
  console.error('Error: Invalid ASIN format');
  process.exit(1);
}

scrapeSaudi(asin)
  .then(result => {
    console.log(JSON.stringify(result));
  })
  .catch(error => {
    console.error('Saudi Fatal error:', error);
    const errorResult = {
      asin,
      title: null,
      price: null,
      currency: 'SAR',
      seller: null,
      imageUrl: null,
      productUrl: null,
      dataSource: 'saudi_scraper',
      status: 'failed',
      errorMessage: error.message
    };
    console.log(JSON.stringify(errorResult));
  }); 