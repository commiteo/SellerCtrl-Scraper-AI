const puppeteer = require('puppeteer');
const CHROME_PATH = process.env.CHROME_EXECUTABLE_PATH || process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome';
const fs = require('fs');

async function scrapeNoon(productCode) {
  console.error('=== STARTING NOON SCRAPER ===');
  let browser;
  try {
    console.error('Launching Chrome browser...');
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
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    const page = await browser.newPage();
    const url = `https://www.noon.com/egypt-en/${productCode}/p`;
    console.error('Opening product page:', url);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    console.error('PAGE LOADED');
    console.error('Waiting 5 seconds...');
    await new Promise(r => setTimeout(r, 5000));
    console.error('WAIT DONE');

    // تبسيط: إزالة debug code والتركيز على البيانات المطلوبة

    // لا تنتظر كل العناصر الأساسية، انتقل مباشرة لاستخراج البيانات
    // try {
    //   console.error('Waiting for essential selectors...');
    //   await Promise.all([
    //     page.waitForSelector('span.ProductTitle_title__vjUBn', { timeout: 10000 }),
    //     page.waitForSelector('img.imageMagnify', { timeout: 10000 }),
    //     page.waitForSelector('span.PriceOfferV2_priceNowText__fk5kK', { timeout: 10000 }),
    //     page.waitForSelector('strong.PartnerRatingsV2_soldBy__IOCr1', { timeout: 10000 }),
    //   ]);
    //   console.error('All selectors found. Extracting product data...');
    // } catch (e) {
    //   console.error('Error: Essential elements (title, image, price, or seller) not found.');
    //   console.error('Closing browser due to error...');
    //   await browser.close();
    //   process.exit(1);
    // }

    // استخراج البيانات مع محاولات متعددة
    console.error('Starting data extraction...');
    
    let data = {
      title: 'N/A',
      price: 'N/A', 
      image: '',
      seller: 'N/A',
      url: `https://www.noon.com/egypt-en/${productCode}/p`
    };
    
    try {
      data = await page.evaluate(() => {
        // محاولة متعددة للعنوان
        let title = document.querySelector('span.ProductTitle_title__vjUBn')?.innerText?.trim() ||
                   document.querySelector('h1[data-qa="pdp-title"]')?.innerText?.trim() ||
                   document.querySelector('.productName')?.innerText?.trim() ||
                   document.querySelector('h1')?.innerText?.trim() ||
                   'N/A';
        
        // محاولة متعددة للسعر
        let price = document.querySelector('span.PriceOfferV2_priceNowText__fk5kK')?.innerText?.trim() ||
                   document.querySelector('div[data-qa="pdp-price"]')?.innerText?.trim() ||
                   document.querySelector('.price')?.innerText?.trim() ||
                   document.querySelector('[class*="price"]')?.innerText?.trim() ||
                   'N/A';
        
        // محاولة متعددة للصورة
        let image = document.querySelector('img.imageMagnify')?.src ||
                   document.querySelector('.GalleryV2_imageContainer___p_v2 img')?.src ||
                   document.querySelector('.GalleryV2_miniImg__JACNf')?.src ||
                   document.querySelector('.productImage img')?.src ||
                   document.querySelector('img[alt*="product"]')?.src ||
                   '';
        
        // محاولة متعددة للبائع
        let seller = document.querySelector('strong.PartnerRatingsV2_soldBy__IOCr1')?.innerText?.trim() ||
                     document.querySelector('.sellerName')?.innerText?.trim() ||
                     document.querySelector('[class*="seller"]')?.innerText?.trim() ||
                     'N/A';
        
        return { title, price, image, seller, url: window.location.href };
      });
      
      console.error('Data extracted successfully:', JSON.stringify(data));
    } catch (e) {
      console.error('Error during data extraction:', e);
    }
    // أرسل البيانات حتى لو ناقصة
    if (data && typeof data === 'object') {
      console.log(JSON.stringify(data, null, 2));
    } else {
      // في حالة فشل استخراج البيانات، أرسل بيانات فارغة
      console.log(JSON.stringify({
        title: 'N/A',
        price: 'N/A',
        image: '',
        seller: 'N/A',
        url: `https://www.noon.com/egypt-en/${productCode}/p`
      }, null, 2));
    }
    console.error('Closing browser after successful scrape...');
    await browser.close();
  } catch (err) {
    console.error('UNEXPECTED ERROR:', err);
    // حتى في حالة الخطأ، أرسل JSON ليتمكن server من معالجته
    console.log(JSON.stringify({
      title: 'N/A',
      price: 'N/A', 
      image: '',
      seller: 'N/A',
      url: `https://www.noon.com/egypt-en/${productCode || 'unknown'}/p`,
      error: err.message
    }, null, 2));
    if (browser) {
      await browser.close();
    }
    process.exit(0); // خروج طبيعي مع JSON
  }
}

const productCode = process.argv[2];
if (!productCode) {
  console.error('Usage: node noon_puppeteer.cjs <PRODUCT_CODE>');
  process.exit(1);
}
scrapeNoon(productCode); 