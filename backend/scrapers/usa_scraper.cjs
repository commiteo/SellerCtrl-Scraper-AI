const puppeteer = require('puppeteer');
const CHROME_PATH = process.env.CHROME_EXECUTABLE_PATH || process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome';

async function scrapeUSA(asin) {
  console.error('=== USA SCRAPER STARTING ===');
  let browser;
  
  try {
    console.error(`🇺🇸 USA Single Attempt with ZIP CODE - ASIN: ${asin}`);
      
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

      const productUrl = `https://www.amazon.com/dp/${asin}`;
      console.error(`🌐 Opening USA URL: ${productUrl}`);
      
      try {
        await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.error('✅ USA PAGE LOADED SUCCESSFULLY');
      } catch (navError) {
        console.error(`⚠️ USA Navigation failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 90000 });
        console.error('✅ USA PAGE LOADED ON RETRY');
      }

      // Handle security page
      const pageContent = await page.content();
      if (pageContent.includes('security') || pageContent.includes('continue shopping')) {
        console.error('🔒 USA Security page detected, handling...');
        const continueButton = await page.$('input[type="submit"][value*="Continue"]');
        if (continueButton) {
          await continueButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.error('✅ USA Security page bypassed');
        }
      }

      // Go to product page first then set ZIP code
      console.error('🌍 USA Going directly to product page...');
      await page.goto(productUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      
      // Set ZIP code to 22102 while on product page
      console.error('🚚 USA Setting ZIP code to 22102 on product page...');
      try {
        // Click delivery location popup on product page
        const deliveryPopup = await page.$('#nav-global-location-popover-link');
        if (deliveryPopup) {
          console.error('🎯 USA Found delivery popup on product page, clicking...');
          await deliveryPopup.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Wait for zip input and enter 22102
          try {
            await page.waitForSelector('#GLUXZipUpdateInput', { visible: true, timeout: 10000 });
            console.error('✅ USA Found zip input field on product page');
            
            // Focus, clear and enter ZIP code
            await page.focus('#GLUXZipUpdateInput');
            await page.click('#GLUXZipUpdateInput', { clickCount: 3 }); // Select all
            await page.keyboard.press('Backspace'); // Clear
            await page.type('#GLUXZipUpdateInput', '22102');
            console.error('✅ USA Entered ZIP code 22102');
            
            // Click apply button
            const applyButton = await page.$('#GLUXZipUpdate > span > input');
            if (applyButton) {
              await applyButton.click();
              console.error('✅ USA Clicked apply button');
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              // Handle ZIP code confirmation popup
              try {
                console.error('🔍 USA Checking for ZIP confirmation popup...');
                
                // Try to find Continue button in confirmation popup (from screenshot)
                const continueSelectors = [
                  'button:contains("Continue")',
                  'input[value="Continue"]',
                  '.a-button-primary input',
                  'button[data-action="continue"]',
                  '[data-csa-c-content-id*="continue"]',
                  '.a-popover button:contains("Continue")',
                  '[role="dialog"] button:contains("Continue")'
                ];
                
                let continueButton = null;
                for (const selector of continueSelectors) {
                  try {
                    continueButton = await page.waitForSelector(selector, { timeout: 3000 });
                    if (continueButton) {
                      console.error(`🎯 USA Found Continue button with selector: ${selector}`);
                      break;
                    }
                  } catch (e) {
                    // Try next selector
                  }
                }
                
                if (continueButton) {
                  await continueButton.click();
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  console.error('✅ USA Clicked Continue in confirmation popup');
                } else {
                  console.error('ℹ️ USA No confirmation popup found, proceeding...');
                }
              } catch (popupError) {
                console.error('⚠️ USA Confirmation popup handling failed:', popupError.message);
              }
              
              console.error('🔄 USA ZIP code applied, continuing on same page...');
            }
            
          } catch (zipError) {
            console.error('⚠️ USA ZIP code setup failed:', zipError.message);
          }
        } else {
          console.error('ℹ️ USA No delivery location popup found on product page');
        }
        
      } catch (deliveryError) {
        console.error('⚠️ USA ZIP code setup failed:', deliveryError.message);
      }

      // USA page stability wait before data extraction
      console.error('⏳ USA Final page stability check...');
      await new Promise(resolve => setTimeout(resolve, 60000)); // 1 MINUTE for USA complex pages with zip codes
      
      console.error('✅ USA Page ready for data extraction');

      let data = null;
      try {
        data = await page.evaluate(() => {
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

          const titleElement = document.querySelector('#productTitle');
          const title = titleElement ? titleElement.innerText.trim() : null;
          
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
          
          const imageElement = document.querySelector('#landingImage');
          const imageUrl = imageElement ? imageElement.src : null;
          
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
            currency: 'USD',
            seller,
            imageUrl,
            productUrl: window.location.href,
            dataSource: 'usa_scraper',
            status: productStatus === 'unavailable' ? 'unavailable' : 'success'
          };
        });
        
      } catch (extractError) {
        console.error('⚠️ USA Data extraction failed:', extractError.message);
        data = {
          asin: asin,
          title: null,
          price: null,
          currency: 'USD',
          seller: null,
          imageUrl: null,
          productUrl: productUrl,
          dataSource: 'usa_scraper',
          status: 'failed'
        };
      }

      if (data) {
        data.asin = asin;
      }

      // Final data processing wait
      console.error('🔄 USA Final data processing...');
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds for USA data processing

      console.error(`✅ USA Scraping successful! Closing immediately after data extraction.`);
      
      console.error(`🔒 Closing USA browser...`);
      await browser.close();
      return data;
      
  } catch (err) {
    console.error(`❌ USA SINGLE ATTEMPT FAILED:`, err.message);
    
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error('USA Error closing browser:', closeErr);
      }
    }
    
    // Return error data immediately - no retries
    return {
      asin,
      title: null,
      price: null,
      currency: 'USD',
      seller: null,
      imageUrl: null,
      productUrl: null,
      dataSource: 'usa_scraper',
      status: 'failed',
      errorMessage: `USA single attempt failed: ${err.message}`
    };
  }
}

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: node usa_scraper.cjs <ASIN>');
  process.exit(1);
}

const asin = args[0];

if (!/^[A-Z0-9]{10}$/.test(asin)) {
  console.error('Error: Invalid ASIN format');
  process.exit(1);
}

scrapeUSA(asin)
  .then(result => {
    console.log(JSON.stringify(result));
  })
  .catch(error => {
    console.error('USA Fatal error:', error);
    const errorResult = {
      asin,
      title: null,
      price: null,
      currency: 'USD',
      seller: null,
      imageUrl: null,
      productUrl: null,
      dataSource: 'usa_scraper',
      status: 'failed',
      errorMessage: error.message
    };
    console.log(JSON.stringify(errorResult));
  }); 