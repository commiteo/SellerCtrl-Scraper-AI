const puppeteer = require('puppeteer');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function scrapeGermany(asin) {
  console.error('=== GERMANY SCRAPER STARTING ===');
  let browser;
  
  try {
    console.error(`🇩🇪 Germany Single Attempt with POSTAL CODE - ASIN: ${asin}`);
      
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
      page.setDefaultNavigationTimeout(60000);
      page.setDefaultTimeout(30000);
      
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1'
      });

      const productUrl = `https://www.amazon.de/dp/${asin}`;
      console.error(`🌐 Opening Germany URL: ${productUrl}`);
      
      try {
        await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.error('✅ Germany PAGE LOADED SUCCESSFULLY');
      } catch (navError) {
        console.error(`⚠️ Germany Navigation failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 90000 });
        console.error('✅ Germany PAGE LOADED ON RETRY');
      }

      // Handle cookies consent for Germany
      console.error('🍪 Germany Checking for cookie consent...');
      try {
        const cookieButton = await page.$('#sp-cc-accept, button[id*="cookie"], button[data-action-type="ACCEPT"]');
        if (cookieButton) {
          await cookieButton.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.error('✅ Germany Cookie consent accepted');
        }
      } catch (cookieError) {
        console.error('⚠️ Germany Cookie handling failed:', cookieError.message);
      }

      // Handle security page
      const pageContent = await page.content();
      if (pageContent.includes('security') || pageContent.includes('continue shopping')) {
        console.error('🔒 Germany Security page detected, handling...');
        const continueButton = await page.$('input[type="submit"][value*="Continue"]');
        if (continueButton) {
          await continueButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.error('✅ Germany Security page bypassed');
        }
      }

      // Go to product page first then set postal code  
      console.error('🌍 Germany Going directly to product page...');
      await page.goto(productUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      
      // Accept cookies if present on product page
      try {
        const acceptBtn = await page.$('#sp-cc-accept');
        if (acceptBtn) {
          await acceptBtn.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.error('✅ Germany Cookie consent accepted on product page');
        }
      } catch (e) {
        console.error('ℹ️ Germany No cookies or cookie handling skipped');
      }
      
      // Set postal code to 34117 while on product page
      console.error('🚚 Germany Setting postal code to 34117 on product page...');
      try {
        // Click delivery location popup on product page
        const deliveryPopup = await page.$('#nav-global-location-popover-link');
        if (deliveryPopup) {
          console.error('🎯 Germany Found delivery popup on product page, clicking...');
          await deliveryPopup.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Wait for postal input and enter 34117
          try {
            await page.waitForSelector('#GLUXZipUpdateInput', { visible: true, timeout: 10000 });
            console.error('✅ Germany Found postal input field on product page');
            
            // Focus, clear and enter postal code
            await page.focus('#GLUXZipUpdateInput');
            await page.click('#GLUXZipUpdateInput', { clickCount: 3 }); // Select all
            await page.keyboard.press('Backspace'); // Clear
            await page.type('#GLUXZipUpdateInput', '34117');
            console.error('✅ Germany Entered postal code 34117');
            
            // Click apply button
            const applyButton = await page.$('#GLUXZipUpdate > span > input');
            if (applyButton) {
              await applyButton.click();
              console.error('✅ Germany Clicked apply button');
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              // Handle postal code confirmation popup
              try {
                console.error('🔍 Germany Checking for postal confirmation popup...');
                
                // Try to find Fortfahren/Continue button in confirmation popup (from screenshot)
                const continueSelectors = [
                  'button:contains("Fortfahren")',
                  'input[value="Fortfahren"]',
                  'button:contains("Continue")', 
                  'input[value="Continue"]',
                  '.a-button-primary input',
                  'button[data-action="continue"]',
                  '[data-csa-c-content-id*="continue"]',
                  '.a-popover button:contains("Fortfahren")',
                  '[role="dialog"] button:contains("Fortfahren")'
                ];
                
                let continueButton = null;
                for (const selector of continueSelectors) {
                  try {
                    continueButton = await page.waitForSelector(selector, { timeout: 3000 });
                    if (continueButton) {
                      console.error(`🎯 Germany Found Continue button with selector: ${selector}`);
                      break;
                    }
                  } catch (e) {
                    // Try next selector
                  }
                }
                
                if (continueButton) {
                  await continueButton.click();
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  console.error('✅ Germany Clicked Fortfahren/Continue in confirmation popup');
                } else {
                  console.error('ℹ️ Germany No confirmation popup found, proceeding...');
                }
              } catch (popupError) {
                console.error('⚠️ Germany Confirmation popup handling failed:', popupError.message);
              }
              
              console.error('🔄 Germany Postal code applied, continuing on same page...');
            }
            
          } catch (postalError) {
            console.error('⚠️ Germany Postal code setup failed:', postalError.message);
          }
        } else {
          console.error('ℹ️ Germany No delivery location popup found on product page');
        }
        
      } catch (deliveryError) {
        console.error('⚠️ Germany Postal code setup failed:', deliveryError.message);
      }

      // Germany page stability wait before data extraction
      console.error('⏳ Germany Final page stability check...');
      await new Promise(resolve => setTimeout(resolve, 60000)); // 1 MINUTE for Germany complex pages with postal codes
      
      console.error('✅ Germany Page ready for data extraction');

      // Check product status first (like Amazon scraper)
      const productStatus = await page.evaluate(() => {
        const pageText = document.body.innerText.toLowerCase();
        if (pageText.includes('currently unavailable') || 
            pageText.includes('derzeit nicht verfügbar') ||
            pageText.includes('nicht verfügbar') ||
            pageText.includes('out of stock')) {
          return 'unavailable';
        }
        return 'available';
      });
      
      console.error('Germany Product status:', productStatus);
      
      let data = {
        asin: asin,
        title: null,
        price: null,
        currency: 'EUR',
        seller: null,
        imageUrl: null,
        productUrl: productUrl,
        dataSource: 'main_page',
        status: productStatus
      };
      
      // Extract basic data
      try {
        const basicData = await page.evaluate(() => {
          const titleElement = document.querySelector('#productTitle');
          const title = titleElement ? titleElement.innerText.trim() : null;
          
          const imageElement = document.querySelector('#landingImage');
          const imageUrl = imageElement ? imageElement.src : null;
          
          return { title, imageUrl };
        });
        
        data.title = basicData.title;
        data.imageUrl = basicData.imageUrl;
        
      } catch (extractError) {
        console.error('⚠️ Germany Basic data extraction failed:', extractError.message);
      }
      
      let price = null;
      let seller = null;
      
      // Only extract price/seller if product is available
      if (productStatus === 'available') {
        // Extract price from main page (like Amazon scraper)
        price = await page.evaluate(() => {
          // Look for price in the correct location only
          const priceElement = document.querySelector('#corePrice_feature_div .a-price .a-offscreen');
          if (priceElement) {
            const priceText = priceElement.innerText.trim();
            // Check if price is valid (contains numbers)
            if (priceText && /\d/.test(priceText)) {
              return priceText;
            }
          }
          return null;
        });
        
        // Extract seller from main page (like Amazon scraper)
        seller = await page.evaluate(() => {
          // Clean seller name function
          const cleanSellerName = (sellerText) => {
            if (!sellerText) return null;
            
            let cleaned = sellerText.trim();
            
            // Remove extra texts (German)
            cleaned = cleaned.replace(/\s*und\s*versendet\s*von\s*Amazon\s*Fulfillment\.?/gi, '');
            cleaned = cleaned.replace(/\s*and\s*ships\s*from\s*Amazon\s*Fulfillment\.?/gi, '');
            cleaned = cleaned.replace(/\s*\+.*$/g, ''); 
            cleaned = cleaned.replace(/\s*Versand\s*durch\s*Amazon\.?/gi, '');
            cleaned = cleaned.replace(/\s*Ships\s*from\s*Amazon\.?/gi, '');
            cleaned = cleaned.replace(/\s*Verkauf\s*durch\s*/gi, '');
            cleaned = cleaned.replace(/\s*Sold\s*by\s*/gi, '');
            
            // Remove dots and commas
            cleaned = cleaned.replace(/^[.,\s]+|[.,\s]+$/g, '');
            
            if (cleaned && cleaned.length > 0 && cleaned.length < 100) {
              return cleaned;
            }
            
            return null;
          };
          
          // Try different seller selectors
          let sellerText = null;
          
          // 1. Try #sellerProfileTriggerId
          sellerText = document.querySelector('#sellerProfileTriggerId')?.innerText;
          if (sellerText) {
            const cleaned = cleanSellerName(sellerText);
            if (cleaned) return cleaned;
          }
          
          // 2. Try merchant info
          const merchantInfo = document.querySelector('[data-csa-c-content-id="desktop-merchant-info"] .offer-display-feature-text-message');
          if (merchantInfo) {
            sellerText = merchantInfo.innerText.trim();
            if (sellerText) {
              const cleaned = cleanSellerName(sellerText);
              if (cleaned) return cleaned;
            }
          }
          
          // 3. Try "Verkauf durch" text (German)
          const soldByElements = Array.from(document.querySelectorAll('*')).find(el => 
            el.textContent?.includes('Verkauf durch') || el.textContent?.includes('Sold by')
          );
          if (soldByElements) {
            const text = soldByElements.textContent;
            const match = text.match(/(?:Verkauf durch|Sold by)\s*([^,\n]+)/i);
            if (match && match[1]) {
              const cleaned = cleanSellerName(match[1]);
              if (cleaned) return cleaned;
            }
          }
          
          // 4. Try Amazon.de
          const amazonElements = Array.from(document.querySelectorAll('*')).find(el => 
            el.textContent?.includes('Amazon.de')
          );
          if (amazonElements) {
            return 'Amazon.de';
          }
          
          return null;
        });
        
        console.error('Germany Main page price:', price);
        console.error('Germany Main page seller:', seller);
        
        // If no price found, try "See All Buying Options" (like Amazon scraper)
        if (!price) {
          console.error('Germany Price not found on main page, trying See All Buying Options...');
          
          const buyingOptionsBtn = await page.$('span#buybox-see-all-buying-choices a.a-button-text');
          if (buyingOptionsBtn) {
            console.error('Germany Found See All Buying Options button, clicking...');
            try {
              await buyingOptionsBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
              await new Promise(resolve => setTimeout(resolve, 500));
              await buyingOptionsBtn.click();
              
              // Wait for offers to load
              await page.waitForSelector('div[id^="aod-offer"] .a-section.a-spacing-none.aok-align-center.aok-relative > span.aok-offscreen', { timeout: 15000 }).catch(() => {});
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Extract price and seller from buying options (like Amazon scraper)
              const buyingOptionsData = await page.evaluate(() => {
                const cleanSellerName = (sellerText) => {
                  if (!sellerText) return null;
                  let cleaned = sellerText.trim();
                  cleaned = cleaned.replace(/\s*und\s*versendet\s*von\s*Amazon\s*Fulfillment\.?/gi, '');
                  cleaned = cleaned.replace(/\s*\+.*$/g, '');
                  cleaned = cleaned.replace(/\s*Versand\s*durch\s*Amazon\.?/gi, '');
                  cleaned = cleaned.replace(/\s*Verkauf\s*durch\s*/gi, '');
                  cleaned = cleaned.replace(/^[.,\s]+|[.,\s]+$/g, '');
                  
                  if (cleaned && cleaned.length > 0 && cleaned.length < 100) {
                    return cleaned;
                  }
                  return null;
                };

                const offers = Array.from(document.querySelectorAll('div[id^="aod-offer"]'));
                for (const offer of offers) {
                  const priceEl = offer.querySelector('.a-section.a-spacing-none.aok-align-center.aok-relative > span.aok-offscreen');
                  let sellerEl = offer.querySelector('div#aod-offer-soldBy a.a-size-small.a-link-normal');
                  
                  if (!sellerEl) {
                    sellerEl = offer.querySelector('.aod-offer-soldBy .a-size-small');
                  }
                  if (!sellerEl) {
                    sellerEl = offer.querySelector('[data-csa-c-content-id="aod-offer-soldBy"] .a-size-small');
                  }
                  
                  if (priceEl) {
                    const priceText = priceEl.innerText.trim();
                    if (priceText && /\d/.test(priceText)) {
                      const sellerText = sellerEl ? sellerEl.innerText.trim() : null;
                      const cleanedSeller = cleanSellerName(sellerText);
                      return {
                        price: priceText,
                        seller: cleanedSeller
                      };
                    }
                  }
                }
                return { price: null, seller: null };
              });
              
              if (buyingOptionsData.price) {
                price = buyingOptionsData.price;
                data.dataSource = 'buying_options';
                console.error('Germany Price extracted from buying options');
              }
              if (buyingOptionsData.seller) {
                seller = buyingOptionsData.seller;
                if (data.dataSource === 'main_page') {
                  data.dataSource = 'buying_options';
                }
                console.error('Germany Seller extracted from buying options');
              }
              
            } catch (buyingOptionsError) {
              console.error('⚠️ Germany Buying options extraction failed:', buyingOptionsError.message);
            }
          } else {
            console.error('Germany No buying options button found');
          }
        }
        
        data.price = price;
        data.seller = seller;
        data.status = price ? 'success' : 'failed';
        
      } else {
        console.error('Germany Product unavailable, skipping price/seller extraction');
        data.status = 'unavailable';
      }

      if (data) {
        data.asin = asin;
      }

      // Final data processing wait
      console.error('🔄 Germany Final data processing...');
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds for Germany data processing

      console.error(`✅ Germany Scraping successful! Closing immediately after data extraction.`);
      
      console.error(`🔒 Closing Germany browser...`);
      await browser.close();
      return data;
      
  } catch (err) {
    console.error(`❌ Germany SINGLE ATTEMPT FAILED:`, err.message);
    
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error('Germany Error closing browser:', closeErr);
      }
    }
    
    // Return error data immediately - no retries
    return {
      asin,
      title: null,
      price: null,
      currency: 'EUR',
      seller: null,
      imageUrl: null,
      productUrl: null,
      dataSource: 'germany_scraper',
      status: 'failed',
      errorMessage: `Germany single attempt failed: ${err.message}`
    };
  }
}

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: node germany_scraper.cjs <ASIN>');
  process.exit(1);
}

const asin = args[0];

if (!/^[A-Z0-9]{10}$/.test(asin)) {
  console.error('Error: Invalid ASIN format');
  process.exit(1);
}

scrapeGermany(asin)
  .then(result => {
    console.log(JSON.stringify(result));
  })
  .catch(error => {
    console.error('Germany Fatal error:', error);
    const errorResult = {
      asin,
      title: null,
      price: null,
      currency: 'EUR',
      seller: null,
      imageUrl: null,
      productUrl: null,
      dataSource: 'germany_scraper',
      status: 'failed',
      errorMessage: error.message
    };
    console.log(JSON.stringify(errorResult));
  }); 