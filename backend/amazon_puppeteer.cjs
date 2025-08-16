const puppeteer = require('puppeteer');
const CHROME_PATH = process.env.CHROME_EXECUTABLE_PATH || process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome';
const fs = require('fs');

async function scrapeAmazon(asin, region) {
  console.error('=== STARTING AMAZON SCRAPER ===');
  let browser;
  try {
    console.error('Launching Chrome browser...');
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
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });
    const page = await browser.newPage();
    
    // تعيين headers إضافية لتجنب اكتشاف السكرابر
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
    // بناء الرابط حسب الدومين
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
    console.error('Opening product page:', productUrl);
    
    // انتظار تحميل الصفحة مع إعدادات أفضل
    await page.goto(productUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    
    // انتظار إضافي للتأكد من التحميل
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // انتظار body للتأكد من تحميل الصفحة
    await page.waitForSelector('body', { timeout: 10000 });
    
    console.error('PAGE LOADED');

    // التعامل مع صفحة الأمان في أمازون أمريكا
    if (region === 'com') {
      console.error('Checking for security page on Amazon.com...');
      const isSecurityPage = await page.evaluate(() => {
        // التحقق من وجود صفحة الأمان
        const securityText = document.body.innerText.toLowerCase();
        return securityText.includes('continue shopping') || 
               securityText.includes('automated test software') ||
               document.querySelector('button[data-action="continue-shopping"]') ||
               document.querySelector('a[href*="continue-shopping"]');
      });
      
      if (isSecurityPage) {
        console.error('Security page detected, attempting to bypass...');
        
        // محاولة الضغط على زر "Continue shopping"
        try {
          const continueButton = await page.$('button[data-action="continue-shopping"], a[href*="continue-shopping"], button:contains("Continue shopping")');
          if (continueButton) {
            console.error('Found continue shopping button, clicking...');
            await continueButton.click();
            await new Promise(resolve => setTimeout(resolve, 3000)); // انتظار تحميل الصفحة
          } else {
            // محاولة الضغط على أي زر يحتوي على "Continue shopping"
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
          
          // التحقق من أن الصفحة تم تحميلها بنجاح
          const isStillSecurityPage = await page.evaluate(() => {
            const securityText = document.body.innerText.toLowerCase();
            return securityText.includes('continue shopping') || 
                   securityText.includes('automated test software');
          });
          
          if (isStillSecurityPage) {
            console.error('Still on security page, trying alternative approach...');
            // محاولة إعادة تحميل الصفحة مع headers مختلفة
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.reload({ waitUntil: 'domcontentloaded' });
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error('Error handling security page:', error);
        }
      }
    }

    // احذف كل منطق تغيير البلد أو العنوان أو اللغة أو الرمز البريدي
    // ... أكمل مباشرة إلى خطوات استخراج البيانات ...

    // Debug: Save page HTML
    try {
      const html = await page.content();
      fs.writeFileSync('debug.html', html);
      console.error('Saved page HTML to debug.html');
    } catch (err) {
      console.error('Error saving debug.html:', err);
    }

    // Debug: Try to extract title and price directly
    try {
      const title = await page.$eval('#productTitle', el => el.innerText).catch(() => null);
      console.error('Title:', title);
      const price = await page.$eval('span.a-price span.a-offscreen', el => el.innerText).catch(() => null);
      console.error('Price:', price);
    } catch (err) {
      console.error('Error extracting title/price:', err);
    }

    // محاولة استخراج البيانات حتى لو لم تظهر كل العناصر الأساسية
    let selectorsFound = true;
    try {
      console.error('Waiting for essential selectors...');
      await Promise.all([
        page.waitForSelector('#productTitle', { timeout: 15000 }),
        page.waitForSelector('#landingImage', { timeout: 15000 }),
        page.waitForSelector('span.a-price span.a-offscreen, #priceblock_ourprice, #priceblock_dealprice, #priceblock_saleprice', { timeout: 15000 }),
      ]);
      console.error('All selectors found. Extracting product data...');
    } catch (e) {
      selectorsFound = false;
      console.error('Warning: لم يتم العثور على كل العناصر الأساسية (العنوان أو الصورة أو السعر)، سيتم استخراج ما يمكن فقط.');
      
      // انتظار إضافي للصفحة لتحميل
              await new Promise(resolve => setTimeout(resolve, 2000));
    }

    let data = {
      asin: asin,
      title: null,
      price: null,
      buyboxWinner: null,
      image: null,
      link: null,
      dataSource: 'main_page'
    };
    let price = null;
    let buyBoxWinner = null;
    let dataSource = 'main_page'; // تتبع مصدر البيانات - افتراضي من الصفحة الرئيسية
    
    // التحقق من حالة المنتج أولاً
    const productStatus = await page.evaluate(() => {
      // دالة للتحقق من حالة المنتج
      const checkAvailability = () => {
        // التحقق من حالة "Currently unavailable"
        const unavailableText = document.querySelector('span.a-size-medium.a-color-success')?.innerText;
        const outOfStockText = document.querySelector('#availability span')?.innerText;
        
        if (unavailableText?.includes('unavailable') || outOfStockText?.includes('unavailable')) {
          return 'unavailable';
        }
        
        // التحقق من وجود رسائل عدم التوفر
        const pageText = document.body.innerText.toLowerCase();
        const unavailableIndicators = [
          'currently unavailable',
          'out of stock',
          'we don\'t know when',
          'temporarily out of stock',
          'unavailable',
          'not available',
          'no longer available'
        ];
        
        for (const indicator of unavailableIndicators) {
          if (pageText.includes(indicator)) {
            return 'unavailable';
          }
        }
        
        // التحقق من وجود أزرار الشراء
        const buyButtons = document.querySelectorAll('button, input[type="submit"], a');
        const availableIndicators = [
          'add to cart',
          'buy now',
          'add to basket',
          'purchase'
        ];
        
        for (const button of buyButtons) {
          const buttonText = button.innerText.toLowerCase();
          for (const indicator of availableIndicators) {
            if (buttonText.includes(indicator)) {
              return 'available';
            }
          }
        }
        
        // التحقق من وجود سعر
        const priceElements = document.querySelectorAll('.a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice');
        if (priceElements.length > 0) {
          return 'available';
        }
        
        // إذا لم نجد مؤشرات واضحة، نفترض أن المنتج متوفر
        return 'available';
      };
      
      return checkAvailability();
    });
    
    console.error('Product status:', productStatus);
    
    // إذا كان المنتج غير متوفر، لا نحاول استخراج السعر
    if (productStatus === 'unavailable') {
      console.error('Product is currently unavailable, skipping price extraction');
      price = null;
      buyBoxWinner = null;
    } else {
    // جلب السعر من الصفحة الرئيسية بعدة طرق
    price = await page.evaluate(() => {
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
          if (priceText) return priceText;
        }
        
        // 2. محاولة أخرى من corePrice_desktop
        priceElement = document.querySelector('#corePrice_desktop .a-price .a-offscreen');
        if (priceElement) {
          const priceText = cleanPrice(priceElement.innerText);
          if (priceText) return priceText;
        }
        
        // 3. محاولة من أي عنصر سعر في الصفحة
        const allPriceElements = document.querySelectorAll('.a-price .a-offscreen');
        for (const el of allPriceElements) {
          const priceText = cleanPrice(el.innerText);
          if (priceText) return priceText;
        }
        
        // 4. محاولة من span يحتوي على السعر
        const priceSpans = document.querySelectorAll('span[class*="price"]');
        for (const span of priceSpans) {
          const priceText = cleanPrice(span.innerText);
          if (priceText) return priceText;
        }
        
        // 5. محاولة من priceblock selectors
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
            if (priceText) return priceText;
          }
        }
        
        // 6. محاولة من أي نص يحتوي على عملة
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
            if (priceText) return priceText;
          }
        }
        
        return null;
    });
      
    buyBoxWinner = await page.evaluate(() => {
        // محاولة العثور على البائع من عدة مصادر
        let seller = null;
        
        // دالة لتنظيف اسم البائع
        const cleanSellerName = (sellerText) => {
          if (!sellerText) return null;
          
          let cleaned = sellerText.trim();
          
          // إزالة النصوص الإضافية
          cleaned = cleaned.replace(/\s*and\s*ships\s*from\s*Amazon\s*Fulfillment\.?/gi, '');
          cleaned = cleaned.replace(/\s*\+.*$/g, ''); // إزالة كل شيء بعد +
          cleaned = cleaned.replace(/\s*Ships\s*from\s*Amazon\.?/gi, '');
          cleaned = cleaned.replace(/\s*Fulfilled\s*by\s*Amazon\.?/gi, '');
          cleaned = cleaned.replace(/\s*Sold\s*by\s*/gi, '');
          cleaned = cleaned.replace(/\s*Shipped\s*by\s*/gi, '');
          
          // إزالة النقاط والفواصل الزائدة
          cleaned = cleaned.replace(/^[.,\s]+|[.,\s]+$/g, '');
          
          // التحقق من أن النص ليس فارغاً
          if (cleaned && cleaned.length > 0 && cleaned.length < 100) {
            return cleaned;
          }
          
          return null;
        };
        
        // 1. محاولة من #sellerProfileTriggerId
        seller = document.querySelector('#sellerProfileTriggerId')?.innerText;
        if (seller) {
          const cleaned = cleanSellerName(seller);
          if (cleaned) {
            console.log('Found seller from #sellerProfileTriggerId:', cleaned);
            return cleaned;
          }
        }
        
        // 2. محاولة من offer-display-feature-text (Amazon.eg)
        const offerDisplayText = document.querySelector('.offer-display-feature-text-message');
        if (offerDisplayText) {
          seller = offerDisplayText.innerText.trim();
          if (seller) {
            const cleaned = cleanSellerName(seller);
            if (cleaned) {
              console.log('Found seller from offer-display-feature-text:', cleaned);
              return cleaned;
            }
          }
        }
        
        // 3. محاولة من "Sold by" text
        const soldByElements = Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent?.includes('Sold by')
        );
        if (soldByElements) {
          const text = soldByElements.textContent;
          const match = text.match(/Sold by\s*([^,\n]+)/i);
          if (match && match[1]) {
            const cleaned = cleanSellerName(match[1]);
            if (cleaned) {
              console.log('Found seller from Sold by text:', cleaned);
              return cleaned;
            }
          }
        }
        
        // 4. محاولة من merchant-info
        const merchantInfo = document.querySelector('[data-csa-c-content-id="desktop-merchant-info"] .offer-display-feature-text-message');
        if (merchantInfo) {
          seller = merchantInfo.innerText.trim();
          if (seller) {
            const cleaned = cleanSellerName(seller);
            if (cleaned) {
              console.log('Found seller from merchant-info:', cleaned);
              return cleaned;
            }
          }
        }
        
        // 5. محاولة من "Ships from" و "Sold by"
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
              return cleaned;
            }
          }
        }
        
        // 6. محاولة من أي نص يحتوي على Amazon
        const amazonElements = Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent?.includes('Amazon.eg') || el.textContent?.includes('Amazon.ae') || el.textContent?.includes('Amazon.sa') || el.textContent?.includes('Amazon.com')
        );
        if (amazonElements) {
          const text = amazonElements.textContent;
          const amazonMatch = text.match(/(Amazon\.(?:eg|ae|sa|com))/i);
          if (amazonMatch && amazonMatch[1]) {
            console.log('Found seller from Amazon elements:', amazonMatch[1]);
            return amazonMatch[1];
          }
        }
        
        // 7. محاولة من الصفحة بأكملها
        const pageText = document.body.innerText;
        const amazonRegex = /(Amazon\.(?:eg|ae|sa|com))/i;
        const match = pageText.match(amazonRegex);
        if (match && match[1]) {
          console.log('Found seller from page text:', match[1]);
          return match[1];
        }
        
        // 8. محاولة من أي نص يحتوي على "bareeq" أو أسماء بائعين معروفة
        const knownSellers = ['bareeq', 'noon', 'souq', 'amazon'];
        for (const knownSeller of knownSellers) {
          const sellerElements = Array.from(document.querySelectorAll('*')).find(el => 
            el.textContent?.toLowerCase().includes(knownSeller)
          );
          if (sellerElements) {
            const text = sellerElements.textContent;
            const sellerMatch = text.match(new RegExp(`(${knownSeller}[^\\s,\\n]*)`, 'i'));
            if (sellerMatch && sellerMatch[1]) {
              console.log('Found seller from known sellers:', sellerMatch[1]);
              return sellerMatch[1];
            }
          }
        }
        
        console.log('No seller found');
        return null;
      });
      
      console.error('Main page price:', price);
      console.error('Main page seller:', buyBoxWinner);
    }

    // إذا لم يوجد السعر أو البائع وكان المنتج متوفر، جرب الضغط على زر See All Buying Options
    if ((!price || !buyBoxWinner) && productStatus === 'available') {
      console.error('Price or seller not found on main page, trying See All Buying Options...');
      
      // محاولة عدة selectors للزر
      const btnSelectors = [
        'span#buybox-see-all-buying-choices a.a-button-text',
        'a[href*="buying-choices"]',
        '#buybox-see-all-buying-choices-ubb',
        'span[data-action="a-popover"]',
        'a[aria-label*="buying options"]'
      ];
      
      let btn = null;
      for (const selector of btnSelectors) {
        try {
          btn = await page.$(selector);
          if (btn) {
            console.error(`Found See All Buying Options button with selector: ${selector}`);
            break;
          }
        } catch (error) {
          console.error(`Error with selector ${selector}:`, error.message);
          continue;
        }
      }
      
      // إذا لم نجد الزر، جرب البحث بالنص
      if (!btn) {
        try {
          btn = await page.evaluateHandle(() => {
            const elements = Array.from(document.querySelectorAll('span, a, button'));
            return elements.find(el => 
              el.textContent.includes('See All Buying Options') ||
              el.textContent.includes('See all buying options') ||
              el.textContent.includes('buying options')
            );
          });
          if (btn && await btn.asElement()) {
            console.error('Found See All Buying Options button by text content');
          } else {
            btn = null;
          }
        } catch (error) {
          console.error('Error searching by text content:', error.message);
          btn = null;
        }
      }
      
      if (btn) {
        console.error('Found See All Buying Options button, clicking...');
        await btn.evaluate(b => b.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await new Promise(r => setTimeout(r, 1000));
        await btn.click();
        
        // انتظار تحميل الـ sidebar
        try {
          await page.waitForSelector('div[id^="aod-offer"]', { timeout: 10000 });
          await new Promise(r => setTimeout(r, 3000)); // انتظار إضافي لتحميل باقي العروض
        } catch (error) {
          console.error('Timeout waiting for buying options sidebar:', error);
        }
        // جلب السعر والبائع من كل العروض في الـ sidebar
        const sidebarData = await page.evaluate(() => {
          // دالة لتنظيف اسم البائع
          const cleanSellerName = (sellerText) => {
            if (!sellerText) return null;
            
            let cleaned = sellerText.trim();
            
            // إزالة النصوص الإضافية
            cleaned = cleaned.replace(/\s*and\s*ships\s*from\s*Amazon\s*Fulfillment\.?/gi, '');
            cleaned = cleaned.replace(/\s*\+.*$/g, ''); // إزالة كل شيء بعد +
            cleaned = cleaned.replace(/\s*Ships\s*from\s*Amazon\.?/gi, '');
            cleaned = cleaned.replace(/\s*Fulfilled\s*by\s*Amazon\.?/gi, '');
            cleaned = cleaned.replace(/\s*Sold\s*by\s*/gi, '');
            cleaned = cleaned.replace(/\s*Shipped\s*by\s*/gi, '');
            
            // إزالة النقاط والفواصل الزائدة
            cleaned = cleaned.replace(/^[.,\s]+|[.,\s]+$/g, '');
            
            // التحقق من أن النص ليس فارغاً
            if (cleaned && cleaned.length > 0 && cleaned.length < 100) {
              return cleaned;
            }
            
            return null;
          };

          const offers = Array.from(document.querySelectorAll('div[id^="aod-offer"]'));
          console.log('Found', offers.length, 'offers in sidebar');
          
          for (const offer of offers) {
            // محاولة عدة طرق لجلب السعر
            let priceEl = offer.querySelector('.a-section.a-spacing-none.aok-align-center.aok-relative > span.aok-offscreen');
            if (!priceEl) {
              priceEl = offer.querySelector('.a-price .a-offscreen');
            }
            if (!priceEl) {
              priceEl = offer.querySelector('span[class*="price"]');
            }
            if (!priceEl) {
              priceEl = offer.querySelector('.a-price-whole');
            }
            
            // محاولة عدة طرق لجلب البائع
            let sellerEl = offer.querySelector('div#aod-offer-soldBy a.a-size-small.a-link-normal');
            if (!sellerEl) {
              sellerEl = offer.querySelector('.aod-offer-soldBy .a-size-small');
            }
            if (!sellerEl) {
              sellerEl = offer.querySelector('[data-csa-c-content-id="aod-offer-soldBy"] .a-size-small');
            }
            if (!sellerEl) {
              sellerEl = offer.querySelector('.aod-offer-soldBy');
            }
            if (!sellerEl) {
              sellerEl = offer.querySelector('a[href*="seller"]');
            }
            if (!sellerEl) {
              sellerEl = offer.querySelector('span:contains("Sold by")');
            }
            
            if (priceEl) {
              const priceText = priceEl.innerText.trim();
              // التحقق من أن السعر صالح
              if (priceText && /\d/.test(priceText)) {
                const sellerText = sellerEl ? sellerEl.innerText.trim() : null;
                const cleanedSeller = cleanSellerName(sellerText);
                console.log('Found valid offer:', { price: priceText, seller: cleanedSeller });
                return {
                  price: priceText,
                  buyboxWinner: cleanedSeller,
                };
              }
            }
          }
          
          // إذا لم نجد عرض صالح، حاول جلب أي سعر من الصفحة
          const anyPrice = document.querySelector('.a-price .a-offscreen');
          if (anyPrice) {
            const priceText = anyPrice.innerText.trim();
            if (priceText && /\d/.test(priceText)) {
              console.log('Found fallback price:', priceText);
              return {
                price: priceText,
                buyboxWinner: null,
              };
            }
          }
          
          return { price: null, buyboxWinner: null };
        });
        if (sidebarData.price) {
          price = sidebarData.price;
          dataSource = 'buying_options'; // تحديث مصدر البيانات
          console.error('Data extracted from See All Buying Options sidebar');
        }
        if (sidebarData.buyboxWinner) {
          buyBoxWinner = sidebarData.buyboxWinner;
          if (dataSource === 'main_page') {
            dataSource = 'buying_options'; // تحديث مصدر البيانات
            console.error('Seller data extracted from See All Buying Options sidebar');
          }
        }
      }
    }
    data.price = price;
    data.buyboxWinner = buyBoxWinner;
    data.dataSource = dataSource; // إضافة مصدر البيانات للبيانات المُخرجة
    
    // إذا لم يتم العثور على السعر بعد كل المحاولات
    if (!price) {
      console.error('No valid price found for this product');
      // التحقق من أن المنتج غير متوفر فعلاً
      const finalStatusCheck = await page.evaluate(() => {
        const pageText = document.body.innerText.toLowerCase();
        return pageText.includes('currently unavailable') || 
               pageText.includes('out of stock') || 
               pageText.includes('we don\'t know when');
      });
      
      if (finalStatusCheck) {
        console.error('Confirmed: Product is unavailable');
        price = null;
        buyBoxWinner = null;
      } else {
        console.error('Product appears available but no price found - this might be an error');
        // لا نضع سعر خاطئ، نتركه null
      }
      
      await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
      const sidebar = await page.$('div#aod-offer');
      if (sidebar) {
        const sidebarHtml = await page.evaluate(el => el.outerHTML, sidebar);
        fs.writeFileSync('debug-sidebar.html', sidebarHtml);
      }
    } else {
      console.error('Valid price found:', price);
    }

    // بعد استخراج السعر والبائع
    const extracted = await page.evaluate(() => {
      // Try landingImage first
      let image = document.querySelector('#landingImage')?.src;
      // Fallback: first img inside #imgTagWrapperId
      if (!image) {
        const img = document.querySelector('#imgTagWrapperId img');
        if (img) image = img.src;
      }
      // Fallback: data-old-hires
      if (!image) {
        const img = document.querySelector('img[data-old-hires]');
        if (img) image = img.getAttribute('data-old-hires');
      }
      // Fallback: largest from data-a-dynamic-image
      if (!image) {
        const img = document.querySelector('#imgTagWrapperId img');
        if (img && img.dataset && img.dataset.aDynamicImage) {
          try {
            const imgs = JSON.parse(img.dataset.aDynamicImage);
            const largest = Object.keys(imgs).sort((a, b) => imgs[b][0] - imgs[a][0])[0];
            if (largest) image = largest;
          } catch {}
        }
      }
      return {
        title: document.querySelector('#productTitle')?.innerText?.trim() || null,
        image: image || null,
        buyboxWinner: document.querySelector('#sellerProfileTriggerId')?.innerText?.trim() || null,
        link: window.location.href,
      };
    });
    data = {
      ...extracted,
      price: price || null,
      buyboxWinner: buyBoxWinner || extracted.buyboxWinner || null,
      dataSource: dataSource || 'main_page', // إضافة مصدر البيانات
      asin: asin
    };
    console.error('Extracted data:', data);
    console.error('Data source:', dataSource);

    // Always output whatever data is found
    if (!data.price) {
      console.error('Warning: Price not found! Saving partial data.');
      await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
      const sidebar = await page.$('div#aod-offer');
      if (sidebar) {
        const sidebarHtml = await page.evaluate(el => el.outerHTML, sidebar);
        fs.writeFileSync('debug-sidebar.html', sidebarHtml);
      }
      // Do not throw or exit, just continue
    }

    console.error('Scraping successful (partial or full)!');
    console.log(JSON.stringify(data, null, 2));
    console.error('Closing browser after scrape...');
    await browser.close();
  } catch (err) {
    console.error('UNEXPECTED ERROR:', err);
    if (browser) {
      await browser.close();
    }
    // Return error data structure instead of exiting
    const errorData = {
      asin: asin,
      title: null,
      price: null,
      buyboxWinner: null,
      image: null,
      link: null,
      dataSource: 'error',
      error: err.message
    };
    console.log(JSON.stringify(errorData, null, 2));
    process.exit(1);
  }
}

const asin = process.argv[2];
const region = process.argv[3] || 'eg';
if (!asin) {
  console.error('Usage: node amazon_puppeteer.cjs <ASIN> [region]');
  process.exit(1);
}
scrapeAmazon(asin, region); 