const puppeteer = require('puppeteer');
const CHROME_PATH = process.env.CHROME_EXECUTABLE_PATH || process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome';

async function scrapeMultiDomain(asin, domain) {
  // Use stderr for all debug messages to keep stdout clean for JSON
  console.error(`=== STARTING MULTI-DOMAIN SCRAPER FOR ${domain.toUpperCase()} ===`);
  let browser;
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      console.error(`🔄 Attempt ${retryCount + 1}/${maxRetries} - Launching Chrome browser for ${domain}...`);
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: false, // VISIBLE FOR DEBUGGING
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
        '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set longer timeouts for slow connections
    page.setDefaultNavigationTimeout(60000); // 60 seconds
    page.setDefaultTimeout(30000); // 30 seconds
    
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

    // Build URL based on domain
    let productUrl;
    if (domain === 'ae') {
      productUrl = `https://www.amazon.${domain}/dp/${asin}?language=en_AE`;
    } else if (domain === 'sa') {
      productUrl = `https://www.amazon.${domain}/dp/${asin}?language=en_AE`;
    } else if (domain === 'de') {
      productUrl = `https://www.amazon.${domain}/dp/${asin}?language=en_AE`;
    } else if (domain === 'eg') {
      productUrl = `https://www.amazon.eg/en/dp/${asin}?language=en_AE`;
    } else {
      productUrl = `https://www.amazon.${domain}/dp/${asin}?language=en_AE`;
    }

    console.error(`Opening product page: ${productUrl}`);
    
    // Try to load page with retries for network issues
    try {
      await page.goto(productUrl, { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
      console.error('✅ PAGE LOADED SUCCESSFULLY');
    } catch (navError) {
      console.error(`⚠️ Navigation failed, retrying... Error: ${navError.message}`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.goto(productUrl, { 
        waitUntil: 'networkidle2', 
        timeout: 90000 
      });
      console.error('✅ PAGE LOADED ON RETRY');
    }

    // Handle security page and delivery location for Amazon.com and Amazon.de
    if (domain === 'com' || domain === 'de') {
              console.error(`Checking for security page on Amazon.${domain}...`);
              const isSecurityPage = await page.evaluate((domain) => {
          const securityText = document.body.innerText.toLowerCase();
          if (domain === 'de') {
            return securityText.includes('weiter einkaufen') || 
                   securityText.includes('continue shopping') ||
                   securityText.includes('automatisierte test-software') ||
                   securityText.includes('automated test software') ||
                   document.querySelector('button[data-action="continue-shopping"]') ||
                   document.querySelector('a[href*="continue-shopping"]');
          } else {
            return securityText.includes('continue shopping') || 
                   securityText.includes('automated test software') ||
                   document.querySelector('button[data-action="continue-shopping"]') ||
                   document.querySelector('a[href*="continue-shopping"]');
          }
        }, domain);
      
      if (isSecurityPage) {
        console.error('Security page detected, attempting to bypass...');
        try {
          const continueButton = await page.$('button[data-action="continue-shopping"], a[href*="continue-shopping"], button:contains("Continue shopping")');
          if (continueButton) {
            console.error('Found continue shopping button, clicking...');
            await continueButton.click();
            await new Promise(resolve => setTimeout(resolve, 3000));
          } else {
            await page.evaluate(() => {
              const buttons = Array.from(document.querySelectorAll('button, a'));
              const continueBtn = buttons.find(btn => 
                btn.textContent.toLowerCase().includes('continue shopping')
              );
              if (continueBtn) {
                continueBtn.click();
              }
            });
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
          
          const isStillSecurityPage = await page.evaluate(() => {
            const securityText = document.body.innerText.toLowerCase();
            return securityText.includes('continue shopping') || 
                   securityText.includes('automated test software');
          });
          
          if (isStillSecurityPage) {
            console.error('Still on security page, trying alternative approach...');
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.reload({ waitUntil: 'domcontentloaded' });
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error('Error handling security page:', error);
        }
      }

      // Fast delivery location detection and handling
      console.error(`🚀 Fast-checking for delivery issues (${domain})...`);
      try {
        // Set the appropriate postal code based on domain
        const postalCode = domain === 'de' ? '34117' : '22102';
        console.error(`🇩🇪 Using postal code: ${postalCode} for domain: ${domain}`);
        console.error(`✓ Confirmed: ${domain === 'de' ? 'German postal code 34117' : 'US zip code 22102'}`);
        
        // Immediate check without waiting
        const needsLocationSetup = await page.evaluate(() => {
          const pageText = document.body.innerText.toLowerCase();
          return document.querySelector('#nav-global-location-popover-link') !== null ||
                 document.querySelector('#GLUXZipInputSection') !== null ||
                 document.querySelector('input[id*="zip"], input[id*="postal"]') !== null ||
                 pageText.includes('cannot be shipped') ||
                 pageText.includes('delivery location') ||
                 pageText.includes('choose a different delivery location') ||
                 pageText.includes('lieferung nach') || // German: delivery to
                 pageText.includes('lieferort') || // German: delivery location
                 pageText.includes('postleitzahl'); // German: postal code
        });

        if (needsLocationSetup) {
          console.error('Location setup needed, handling...');
          
          // Handle cookies for Germany first
          if (domain === 'de') {
            try {
              console.error('⚡ Checking for German cookie consent...');
              const cookieButton = await page.$('#sp-cc-accept, button:contains("Akzeptieren"), button:contains("Alle akzeptieren")');
              if (cookieButton) {
                console.error('✓ Accepting German cookies...');
                await cookieButton.click();
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            } catch (e) {
              console.error('No cookie consent needed');
            }
          }
          
          // Ultra-fast delivery location handling
          console.error('⚡ Rapid delivery link handling...');
          
          // Try immediate click without waiting
          const deliveryLink = await page.$('#nav-global-location-popover-link');
          if (deliveryLink) {
            console.error('✓ Delivery link found instantly, clicking...');
            await deliveryLink.click();
            
            // Race condition: either popup appears quickly or we move on
            const popupPromise = page.waitForSelector('#GLUXZipUpdateInput, input[id*="zip"]', { timeout: 1500 });
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 1000));
            
            const result = await Promise.race([popupPromise, timeoutPromise]);
            if (result) {
              console.error('✓ Popup appeared instantly!');
            } else {
              console.error('⚡ Moving fast, popup might be slow...');
              await new Promise(resolve => setTimeout(resolve, 1500)); // Minimal wait
            }
          } else {
            console.error('⚡ No delivery link, trying direct approach...');
          }

                                // Lightning-fast postal code handling
          try {
            console.error(`⚡ Lightning postal code entry for ${domain}...`);
            
                      // Try to find postal code input with network resilience
          let postalInput = null;
          try {
            postalInput = await page.$('#GLUXZipUpdateInput, input[id*="zip"], input[id*="postal"], input[placeholder*="Postleitzahl"]');
          } catch (e) {
            console.error('⚠️ Initial postal input search failed:', e.message);
          }
          
          if (!postalInput) {
            // Extended race to find the input with better timeout handling
            try {
              const inputPromise = page.waitForSelector('#GLUXZipUpdateInput, input[id*="zip"], input[id*="postal"], input[placeholder*="Postleitzahl"]', { timeout: 10000 });
              const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 8000));
              postalInput = await Promise.race([inputPromise, timeoutPromise]);
              
              if (!postalInput) {
                console.error('⚠️ Postal input not found after extended wait, trying alternative selectors...');
                postalInput = await page.$('input[type="text"]').catch(() => null);
              }
            } catch (e) {
              console.error('⚠️ Extended postal input search failed:', e.message);
            }
          }
            
            if (postalInput) {
              console.error(`✓ Postal input found, rapid entry of ${postalCode}...`);
              
              // Parallel operations for speed
              await Promise.all([
                postalInput.focus(),
                postalInput.click({ clickCount: 3 })
              ]);
              
              await postalInput.type(postalCode, { delay: 20 }); // Ultra-fast typing
              
              // Instant verification
              const enteredValue = await postalInput.evaluate(el => el.value);
              if (enteredValue === postalCode) {
                console.error(`✓ ${postalCode} entered instantly!`);
              } else {
                console.error('⚡ Quick retry...');
                await postalInput.type(postalCode, { delay: 30 });
              }
              
              // Turbo Apply button handling
              console.error(`⚡ Turbo Apply button search for ${domain}...`);
              
              const applySelectors = ['#GLUXZipUpdate', '#GLUXZipUpdate > span > input', '.a-button-input[type="submit"]'];
              
              let applyClicked = false;
              
              // Parallel button search for maximum speed
              const buttonPromises = applySelectors.map(async (selector) => {
                const button = await page.$(selector);
                return button ? { button, selector } : null;
              });
              
              const buttons = (await Promise.all(buttonPromises)).filter(Boolean);
              
              if (buttons.length > 0) {
                const { button, selector } = buttons[0];
                console.error(`⚡ Apply button found instantly: ${selector}`);
                await button.click();
                
                // Ultra-fast response check (supports both English and German)
                const continueSelectors = domain === 'de' 
                  ? 'button:contains("Weiter"), button:contains("Fertig"), button:contains("Continue"), #GLUXConfirmClose'
                  : 'button:contains("Continue"), button:contains("Done"), #GLUXConfirmClose';
                  
                const responsePromise = page.waitForSelector(continueSelectors, { timeout: 1000 });
                const quickTimeout = new Promise(resolve => setTimeout(() => resolve(null), 800));
                
                const result = await Promise.race([responsePromise, quickTimeout]);
                if (result) {
                  console.error(`⚡ Continue appeared instantly (${domain})!`);
                } else {
                  console.error('⚡ Apply processing, moving on...');
                }
                applyClicked = true;
              }
              
              if (applyClicked) {
                
                // Lightning Continue button handling
                console.error(`⚡ Lightning Continue search for ${domain}...`);
                
                // Select appropriate continue selectors based on domain
                const continueSelectors = domain === 'de' 
                  ? ['#GLUXConfirmClose', 'button:contains("Weiter")', 'button:contains("Fertig")', 'button:contains("Continue")', 'button:contains("Done")']
                  : ['#GLUXConfirmClose', 'button:contains("Continue")', 'button:contains("Done")'];
                
                // Parallel search for Continue buttons
                const continuePromises = continueSelectors.map(async (selector) => {
                  try {
                    const button = await page.$(selector);
                    return button ? { button, selector } : null;
                  } catch (e) {
                    return null;
                  }
                });
                
                // Race to find any Continue button quickly
                const continueSearch = Promise.all(continuePromises);
                const quickTimeout = new Promise(resolve => setTimeout(() => resolve([]), 1500));
                
                const continueButtons = (await Promise.race([continueSearch, quickTimeout])).filter(Boolean);
                
                if (continueButtons.length > 0) {
                  const { button, selector } = continueButtons[0];
                  console.error(`⚡ Continue found instantly: ${selector}`);
                  await button.click();
                  
                  // Instant popup close check (supports both English and German)
                  const popupCheckFunction = domain === 'de'
                    ? () => !document.querySelector('div:contains("Sie kaufen jetzt für Lieferung nach:"), div:contains("You\'re now shopping for delivery to:")')
                    : () => !document.querySelector('div:contains("You\'re now shopping for delivery to:")');
                    
                  const closePromise = page.waitForFunction(popupCheckFunction, { timeout: 1000 });
                  const quickCheck = new Promise(resolve => setTimeout(() => resolve(null), 800));
                  
                  const result = await Promise.race([closePromise, quickCheck]);
                  if (result) {
                    console.error(`⚡ Popup closed instantly (${domain})!`);
                  } else {
                    console.error('⚡ Continue processed, moving on...');
                  }
                } else {
                  console.error('⚡ No Continue needed, proceeding...');
                }
              } else {
                console.error('Apply button not found with any selector!');
              }
                
              // Instant completion check
              console.error(`⚡ Instant completion verification for ${domain}...`);
              
              // Immediate check without waiting (supports both English and German)
              const stillHasIssue = await page.evaluate((domain) => {
                const text = document.body.innerText.toLowerCase();
                if (domain === 'de') {
                  return text.includes('kann nicht versendet werden') || 
                         text.includes('lieferort ändern') ||
                         text.includes('postleitzahl ändern') ||
                         text.includes('cannot be shipped') || 
                         text.includes('choose a different delivery location');
                } else {
                  return text.includes('cannot be shipped') || 
                         text.includes('choose a different delivery location');
                }
              }, domain);
              
              if (!stillHasIssue) {
                console.error(`⚡ Location fixed instantly for ${domain}, proceeding!`);
              } else {
                console.error('⚡ Quick final check...');
                // Ultra-short wait then proceed anyway
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            } else {
              console.error('Zip code input not found!');
            }
          } catch (e) {
            console.error('Error in zip code handling:', e);
          }

          // Enhanced popup handling with better interaction using page.evaluate
          console.error(`Trying alternative approach with page.evaluate for ${domain}...`);
          await page.evaluate((postalCode, domain) => {
            // Enhanced postal code input handling (supports both US zip and German postal codes)
            const inputSelectors = domain === 'de' 
              ? '#GLUXZipUpdateInput, input[id*="zip"], input[id*="postal"], input[placeholder*="Postleitzahl"], input[placeholder*="PLZ"], input[type="text"]'
              : '#GLUXZipUpdateInput, input[id*="zip"], input[id*="postal"], input[type="text"]';
              
            const postalInputs = document.querySelectorAll(inputSelectors);
            console.log(`Found ${postalInputs.length} postal inputs for ${domain}`);
            
            postalInputs.forEach(postalInput => {
              if (postalInput && (
                postalInput.id.toLowerCase().includes('zip') ||
                postalInput.id.toLowerCase().includes('postal') ||
                postalInput.placeholder && (postalInput.placeholder.toLowerCase().includes('zip') || 
                                           postalInput.placeholder.toLowerCase().includes('postleitzahl') ||
                                           postalInput.placeholder.toLowerCase().includes('plz')) ||
                postalInput.name && (postalInput.name.toLowerCase().includes('zip') || 
                                   postalInput.name.toLowerCase().includes('postal'))
              )) {
                console.log(`Filling postal input for ${domain}:`, postalInput.id, 'with code:', postalCode);
                postalInput.focus();
                postalInput.select();
                postalInput.value = postalCode;
                postalInput.dispatchEvent(new Event('input', { bubbles: true }));
                postalInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            });
          }, postalCode, domain);

          // Wait and try multiple button clicks in sequence
          await new Promise(resolve => setTimeout(resolve, 1000));

          // First: Try Apply buttons with multiple methods
          console.error('Phase 1: Looking for Apply buttons...');
          let applyClicked = false;
          
          // Method 1: Direct puppeteer click
          try {
            const applySelectors = [
              '#GLUXZipUpdate',
              '#GLUXZipUpdate > span > input',
              '.a-button-input[type="submit"]',
              'button[aria-label*="Apply"]',
              'input[value*="Apply"]'
            ];
            
            for (const selector of applySelectors) {
              const applyButton = await page.$(selector);
              if (applyButton) {
                console.error(`Found Apply button with ${selector}, clicking...`);
                await applyButton.click();
                applyClicked = true;
                await new Promise(resolve => setTimeout(resolve, 3000));
                break;
              }
            }
          } catch (e) {
            console.error('Direct Apply button click failed:', e);
          }
          
          // Method 2: JavaScript click if direct click failed
          if (!applyClicked) {
            try {
              await page.evaluate(() => {
                const applySelectors = [
                  '#GLUXZipUpdate',
                  '#GLUXZipUpdate > span > input',
                  '.a-button-input[type="submit"]',
                  'button[aria-label*="Apply"]',
                  'input[value*="Apply"]',
                  'button:contains("Apply")'
                ];
                
                for (const selector of applySelectors) {
                  const btn = document.querySelector(selector);
                  if (btn) {
                    console.log('Found Apply button via JS:', selector);
                    btn.click();
                    return true;
                  }
                }
                return false;
              });
              applyClicked = true;
              console.error('Apply button clicked via JavaScript');
            } catch (e) {
              console.error('JavaScript Apply button click failed:', e);
            }
          }

          console.error('Waiting between phases...');
          await new Promise(resolve => setTimeout(resolve, 5000));

          // Second: Try Confirm/Continue buttons with multiple methods
          console.error('Phase 2: Looking for Confirm/Continue buttons...');
          let continueClicked = false;
          
          // Method 1: Direct puppeteer click for Continue
          try {
            const continueSelectors = [
              '#GLUXConfirmClose',
              'button[data-action*="continue"]',
              'button[aria-label*="Continue"]',
              'input[value*="Continue"]',
              'button[aria-label*="Done"]',
              'input[value*="Done"]'
            ];
            
            for (const selector of continueSelectors) {
              const continueButton = await page.$(selector);
              if (continueButton) {
                console.error(`Found Continue button with ${selector}, clicking...`);
                await continueButton.click();
                continueClicked = true;
                await new Promise(resolve => setTimeout(resolve, 3000));
                break;
              }
            }
          } catch (e) {
            console.error('Direct Continue button click failed:', e);
          }
          
          // Method 2: JavaScript click for Continue if direct click failed
          if (!continueClicked) {
            try {
              await page.evaluate(() => {
                const continueSelectors = [
                  '#GLUXConfirmClose',
                  'button:contains("Continue")',
                  'button:contains("Done")',
                  'input[value*="Continue"]',
                  'input[value*="Done"]',
                  'button[data-action*="continue"]'
                ];
                
                for (const selector of continueSelectors) {
                  const btn = document.querySelector(selector);
                  if (btn) {
                    console.log('Found Continue button via JS:', selector);
                    btn.click();
                    return true;
                  }
                }
                return false;
              });
              continueClicked = true;
              console.error('Continue button clicked via JavaScript');
            } catch (e) {
              console.error('JavaScript Continue button click failed:', e);
            }
          }

          console.error('Waiting between phases...');
          await new Promise(resolve => setTimeout(resolve, 5000));

          // Additional phase: Try to handle specific Amazon popups
          console.error('Phase 2.5: Checking for specific Amazon popups...');
          try {
            // Check for "You're now shopping for delivery to:" popup
            const deliveryPopup = await page.$('div:contains("You\'re now shopping for delivery to:")');
            if (deliveryPopup) {
              console.error('Found delivery confirmation popup');
              const continueInPopup = await page.$('button:contains("Continue")');
              if (continueInPopup) {
                await continueInPopup.click();
                console.error('Clicked Continue in delivery popup');
                await new Promise(resolve => setTimeout(resolve, 3000));
              }
            }
          } catch (e) {
            console.error('Error handling delivery popup:', e);
          }

          // Third: Try to close any remaining popups
          console.error('Phase 3: Looking for Close buttons...');
          try {
            const closeButtons = await page.$$('button[aria-label*="Close"], .a-button-close, .a-popover-close, button[class*="close"], [data-action*="close"]');
            console.error(`Found ${closeButtons.length} Close buttons`);
            for (const btn of closeButtons) {
              console.error('Clicking Close button...');
              await btn.click();
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (e) {
            console.error('Close button click failed:', e);
          }

          // Final comprehensive button clicking attempt
          console.error('Phase 4: Final comprehensive button clicking...');
          try {
            await page.evaluate(() => {
              // Find and click any remaining buttons
              const allButtons = document.querySelectorAll('button, input[type="submit"], .a-button');
              let clickedCount = 0;
              
              allButtons.forEach(btn => {
                const text = btn.textContent || btn.value || btn.getAttribute('aria-label') || '';
                if (text.toLowerCase().includes('apply') ||
                    text.toLowerCase().includes('continue') ||
                    text.toLowerCase().includes('done') ||
                    text.toLowerCase().includes('submit')) {
                  console.log('Final attempt clicking button:', text);
                  btn.click();
                  clickedCount++;
                }
              });
              
              console.log('Final phase clicked', clickedCount, 'buttons');
              return clickedCount;
            });
          } catch (e) {
            console.error('Final button clicking failed:', e);
          }

          console.error('Final wait after all button clicks...');
          await new Promise(resolve => setTimeout(resolve, 8000));

          // Final check and reload if needed
          try {
            const stillHasLocationIssue = await page.evaluate(() => {
              const pageText = document.body.innerText.toLowerCase();
              return pageText.includes('cannot be shipped') || 
                     pageText.includes('choose a different delivery location') ||
                     document.querySelector('#GLUXZipInputSection') !== null;
            });

            if (stillHasLocationIssue) {
              console.error('Location issue still exists, trying page reload...');
              await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
              console.error('Waiting after reload...');
              await new Promise(resolve => setTimeout(resolve, 8000));
            } else {
              console.error('Location setup completed successfully!');
              console.error('Final wait before proceeding to data extraction...');
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
          } catch (e) {
            console.error('Final location check failed:', e);
          }
        }
      } catch (error) {
        console.error('Error handling delivery location:', error);
      }
    }

    // Additional delivery location handling for Amazon.com
    if (domain === 'com') {
      console.error('Additional delivery location handling...');
      try {
        // Check for shipping restrictions and try to resolve them
        const hasShippingRestriction = await page.evaluate(() => {
          const pageText = document.body.innerText.toLowerCase();
          return pageText.includes('cannot be shipped') || 
                 pageText.includes('delivery location') ||
                 pageText.includes('choose a different delivery location');
        });

        if (hasShippingRestriction) {
          console.error('Shipping restriction detected, attempting to resolve...');
          
          // Try multiple approaches to set delivery location
          await page.evaluate((postalCode, domain) => {
            // Method 1: Try to find and click any delivery location related elements
            const deliveryElements = document.querySelectorAll('a[href*="location"], button[onclick*="location"], .nav-a[role="button"]');
            deliveryElements.forEach(el => {
              if (el.textContent.toLowerCase().includes('deliver') || el.textContent.toLowerCase().includes('location') ||
                  (domain === 'de' && (el.textContent.toLowerCase().includes('lieferung') || el.textContent.toLowerCase().includes('lieferort')))) {
                el.click();
              }
            });

            // Method 2: Try to find postal code inputs and fill them
            const postalInputs = document.querySelectorAll('input[type="text"]');
            postalInputs.forEach(input => {
              if (input.placeholder && (input.placeholder.toLowerCase().includes('zip') || 
                                       input.placeholder.toLowerCase().includes('postleitzahl') ||
                                       input.placeholder.toLowerCase().includes('plz')) ||
                  input.id && (input.id.toLowerCase().includes('zip') || 
                             input.id.toLowerCase().includes('postal')) ||
                  input.name && (input.name.toLowerCase().includes('zip') || 
                               input.name.toLowerCase().includes('postal'))) {
                console.log(`Found postal input for ${domain}, filling with:`, postalCode);
                input.value = postalCode;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Simulate Enter key press
                input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
              }
            });

            // Method 3: Try to click any Apply, Update, or Submit buttons
            const applyButtons = document.querySelectorAll('button, input[type="submit"], .a-button-input[type="submit"]');
            applyButtons.forEach(btn => {
              const btnText = btn.textContent ? btn.textContent.toLowerCase() : '';
              if (btnText.includes('apply') || btnText.includes('update') || btnText.includes('submit') ||
                  (domain === 'de' && (btnText.includes('anwenden') || btnText.includes('aktualisieren')))) {
                console.log(`Clicking button for ${domain}:`, btnText);
                btn.click();
              }
            });
          }, postalCode, domain);

          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error('Error in additional delivery location handling:', error);
      }
    }

    // Smart page readiness check with network resilience
    console.error('🔍 Checking page readiness for data extraction...');
    
    let essentialElements = null;
    try {
      // Quick check if essential elements are already there
      essentialElements = await page.evaluate(() => {
        return {
          hasTitle: !!document.querySelector('#productTitle'),
          hasImage: !!document.querySelector('#landingImage'),
          hasPrice: !!document.querySelector('span.a-price span.a-offscreen, #priceblock_ourprice, #priceblock_dealprice, #priceblock_saleprice')
        };
      });
    } catch (evalError) {
      console.error('⚠️ Page evaluation failed, assuming elements not ready:', evalError.message);
      essentialElements = { hasTitle: false, hasImage: false, hasPrice: false };
    }

    if (essentialElements.hasTitle && essentialElements.hasImage) {
      console.error('✓ Essential elements already loaded, proceeding quickly...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Short wait since elements are ready
    } else {
      console.error('⚠ Elements not ready, waiting for them to load...');
      
      // Wait for missing elements with smart timeout
      const promises = [];
      if (!essentialElements.hasTitle) {
        promises.push(page.waitForSelector('#productTitle', { timeout: 15000 }).catch(() => console.error('✗ Product title not found')));
      }
      if (!essentialElements.hasImage) {
        promises.push(page.waitForSelector('#landingImage', { timeout: 15000 }).catch(() => console.error('✗ Product image not found')));
      }
      if (!essentialElements.hasPrice) {
        promises.push(page.waitForSelector('span.a-price span.a-offscreen, #priceblock_ourprice, #priceblock_dealprice, #priceblock_saleprice', { timeout: 15000 }).catch(() => console.error('✗ Price not found')));
      }
      
      await Promise.all(promises);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Longer wait since we had to wait for elements
    }

    console.error('✅ Page ready for data extraction');

    // Extract product data with error handling
    let data = null;
    try {
      data = await page.evaluate(() => {
      // Product status check
      const productStatus = (() => {
        const unavailableText = document.querySelector('span.a-size-medium.a-color-success')?.innerText;
        const outOfStockText = document.querySelector('#availability span')?.innerText;
        if (unavailableText?.includes('unavailable') || outOfStockText?.includes('unavailable')) {
          return 'unavailable';
        }
        const pageText = document.body.innerText.toLowerCase();
        if (pageText.includes('currently unavailable') || pageText.includes('out of stock') || pageText.includes('we don\'t know when') || pageText.includes('temporarily out of stock')) {
          return 'unavailable';
        }
        
        // Check for shipping restrictions
        if (pageText.includes('cannot be shipped') || pageText.includes('cannot be dispatched') || pageText.includes('choose a different delivery location')) {
          return 'shipping_restricted';
        }
        
        return 'available';
      })();

      if (productStatus === 'unavailable') {
        return {
          asin: null,
          title: null,
          price: null,
          currency: null,
          seller: null,
          imageUrl: null,
          productUrl: null,
          dataSource: 'unavailable',
          status: 'unavailable'
        };
      }

      if (productStatus === 'shipping_restricted') {
        return {
          asin: null,
          title: null,
          price: null,
          currency: null,
          seller: null,
          imageUrl: null,
          productUrl: null,
          dataSource: 'shipping_restricted',
          status: 'shipping_restricted'
        };
      }

      // Extract title
      const titleElement = document.querySelector('#productTitle');
      const title = titleElement ? titleElement.innerText.trim() : null;

      // Extract price
      let price = null;
      let currency = 'USD';
      
      const priceElement = document.querySelector('#corePrice_feature_div .a-price .a-offscreen');
      if (priceElement) {
        const priceText = priceElement.innerText.trim();
        if (priceText && /\d/.test(priceText)) {
          price = priceText;
          // Extract currency from price
          const currencyMatch = priceText.match(/[^\d\s.,]+/);
          if (currencyMatch) {
            currency = currencyMatch[0];
          }
        }
      }

      // Extract seller (buybox winner)
      let seller = null;
      
      // Try multiple selectors for seller information
      const sellerSelectors = [
        'span.offer-display-feature-text-message',
        'div#merchant-info a',
        'span.a-size-small.a-color-secondary:contains("Sold by")',
        'div#merchant-info',
        'span.a-size-small.a-color-secondary'
      ];

      for (const selector of sellerSelectors) {
        try {
          const sellerElement = document.querySelector(selector);
          if (sellerElement) {
            const sellerText = sellerElement.innerText.trim();
            if (sellerText && sellerText.length > 0 && sellerText.length < 100) {
              seller = sellerText;
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }

      // If no seller found, try to extract from page text
      if (!seller) {
        const pageText = document.body.innerText;
        const soldByMatch = pageText.match(/Sold by[:\s]+([^\n\r]+)/i);
        if (soldByMatch) {
          seller = soldByMatch[1].trim();
        }
      }

      // Clean seller name
      if (seller) {
        seller = seller.replace(/and ships from Amazon Fulfillment/i, '').trim();
        seller = seller.replace(/\+[^+]+$/, '').trim();
      }

      // Extract image
      const imageElement = document.querySelector('#landingImage');
      const imageUrl = imageElement ? imageElement.src : null;

      // Extract product URL
      const productUrl = window.location.href;

      return {
        asin: null, // Will be set by the calling function
        title,
        price,
        currency,
        seller,
        imageUrl,
        productUrl,
        dataSource: 'main_page',
        status: 'success'
      };
    });
    
    } catch (extractError) {
      console.error('⚠️ Data extraction failed, using fallback data:', extractError.message);
      data = {
        asin: asin,
        title: null,
        price: null,
        currency: domain === 'de' ? 'EUR' : 'USD',
        seller: null,
        imageUrl: null,
        productUrl: productUrl,
        dataSource: 'error',
        status: 'failed'
      };
    }

    // Set ASIN (in case extraction succeeded)
    if (data) {
      data.asin = asin;
    }

    // Handle shipping restricted status
    if (data.status === 'shipping_restricted') {
      console.error(`Product ${asin} is shipping restricted for domain ${domain}`);
      data.title = data.title || 'Product Available (Shipping Restricted)';
      data.price = null;
      data.seller = null;
    }

    // Set domain-specific currency if not detected
    if (!data.currency || data.currency === 'USD') {
      const currencyMap = {
        'eg': 'EGP',
        'sa': 'SAR',
        'ae': 'AED',
        'com': 'USD',
        'de': 'EUR',
        'uk': 'GBP'
      };
      data.currency = currencyMap[domain] || 'USD';
    }

    console.error(`✅ Scraping successful for ${domain}!`);
    console.error(`Closing browser for ${domain}...`);
    await browser.close();
    
    return data;
    
    } catch (err) {
      console.error(`❌ ATTEMPT ${retryCount + 1} FAILED for ${domain}:`, err.message);
      
      if (browser) {
        try {
          await browser.close();
        } catch (closeErr) {
          console.error('Error closing browser:', closeErr);
        }
        browser = null;
      }
      
      retryCount++;
      
      if (retryCount >= maxRetries) {
        console.error(`💀 ALL ${maxRetries} ATTEMPTS FAILED for ${domain}`);
        const errorData = {
          asin,
          title: null,
          price: null,
          currency: null,
          seller: null,
          imageUrl: null,
          productUrl: null,
          dataSource: null,
          status: 'failed',
          errorMessage: `Failed after ${maxRetries} attempts: ${err.message}`
        };
        return errorData;
      }
      
      console.error(`🔄 Retrying in 5 seconds... (${retryCount}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
     }
   
   // This should never be reached
   throw new Error('Unexpected end of retry loop');
  }

// Handle command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node multi_domain_scraper.cjs <ASIN> <DOMAIN>');
  process.exit(1);
}

const asin = args[0];
const domain = args[1];

// Validate ASIN
if (!/^[A-Z0-9]{10}$/.test(asin)) {
  console.error('Error: Invalid ASIN format');
  process.exit(1);
}

// Validate domain
const validDomains = ['eg', 'sa', 'ae', 'com', 'de'];
if (!validDomains.includes(domain)) {
  console.error('Error: Invalid domain. Supported domains:', validDomains.join(', '));
  process.exit(1);
}

// Run the scraper
scrapeMultiDomain(asin, domain)
  .then(result => {
    // Print only the JSON result to stdout (for parsing)
    console.log(JSON.stringify(result));
    process.exit(0);
  })
  .catch(error => {
    const errorData = {
      asin,
      title: null,
      price: null,
      currency: null,
      seller: null,
      imageUrl: null,
      productUrl: null,
      dataSource: null,
      status: 'failed',
      errorMessage: error.message
    };
    
    // Print only the JSON result to stdout (for parsing)
    console.log(JSON.stringify(errorData));
    process.exit(1);
  }); 