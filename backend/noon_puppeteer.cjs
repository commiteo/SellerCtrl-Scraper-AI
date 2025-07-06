const puppeteer = require('puppeteer');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const fs = require('fs');

async function scrapeNoon(productCode) {
  console.error('=== STARTING NOON SCRAPER ===');
  let browser;
  try {
    console.error('Launching Edge browser...');
    browser = await puppeteer.launch({
      executablePath: EDGE_PATH,
      headless: false,
      defaultViewport: null,
    });
    const page = await browser.newPage();
    const url = `https://www.noon.com/egypt-en/${productCode}/p`;
    console.error('Opening product page:', url);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    console.error('PAGE LOADED');
    console.error('Waiting 5 seconds...');
    await new Promise(r => setTimeout(r, 5000));
    console.error('WAIT DONE');

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
      const title = await page.$eval('h1[data-qa="pdp-title"]', el => el.innerText).catch(() => null);
      console.error('Title:', title);
      const price = await page.$eval('div[data-qa="pdp-price"]', el => el.innerText).catch(() => null);
      console.error('Price:', price);
    } catch (err) {
      console.error('Error extracting title/price:', err);
    }

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

    let data = {
      title: '',
      price: '',
      image: '',
      seller: '',
      url: ''
    };
    try {
      data = await page.evaluate(() => {
        // العنوان
        let title = document.querySelector('span.ProductTitle_title__vjUBn')?.innerText.trim() || '';
        // الصورة
        let image = document.querySelector('img.imageMagnify')?.src || '';
        if (!image) {
          // جرب أول صورة كبيرة في الجاليري
          const galleryImg = document.querySelector('.GalleryV2_imageContainer___p_v2 img')?.src;
          if (galleryImg) image = galleryImg;
          else {
            // جرب صورة الميني فيو
            const miniImg = document.querySelector('.GalleryV2_miniImg__JACNf')?.src;
            if (miniImg) image = miniImg;
          }
        }
        // السعر والبائع كما هما
        const price = document.querySelector('span.PriceOfferV2_priceNowText__fk5kK')?.innerText.trim() || '';
        const seller = document.querySelector('strong.PartnerRatingsV2_soldBy__IOCr1')?.innerText.trim() || '';
        return { title, price, image, seller, url: window.location.href };
      });
    } catch (e) {
      // لا ترمي خطأ، فقط أكمل
    }
    // أرسل البيانات حتى لو ناقصة
    console.log(JSON.stringify(data, null, 2));
    console.error('Closing browser after successful scrape...');
    await browser.close();
  } catch (err) {
    console.error('UNEXPECTED ERROR:', err);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

const productCode = process.argv[2];
if (!productCode) {
  console.error('Usage: node noon_puppeteer.cjs <PRODUCT_CODE>');
  process.exit(1);
}
scrapeNoon(productCode); 