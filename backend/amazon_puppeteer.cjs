const puppeteer = require('puppeteer');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const fs = require('fs');

async function scrapeAmazon(asin) {
  console.error('=== STARTING AMAZON SCRAPER ===');
  let browser;
  try {
    console.error('Launching Edge browser...');
    browser = await puppeteer.launch({
      executablePath: EDGE_PATH,
      headless: false,
      defaultViewport: null,
    });
    const page = await browser.newPage();
    console.error('Opening product page:', `https://www.amazon.eg/dp/${asin}?language=en_AE`);
    await page.goto(`https://www.amazon.eg/dp/${asin}?language=en_AE`, { waitUntil: 'domcontentloaded' });
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
      const title = await page.$eval('#productTitle', el => el.innerText).catch(() => null);
      console.error('Title:', title);
      const price = await page.$eval('span.a-price span.a-offscreen', el => el.innerText).catch(() => null);
      console.error('Price:', price);
    } catch (err) {
      console.error('Error extracting title/price:', err);
    }

    try {
      console.error('Waiting for essential selectors...');
      await Promise.all([
        page.waitForSelector('#productTitle', { timeout: 10000 }),
        page.waitForSelector('#landingImage', { timeout: 10000 }),
        page.waitForSelector('span.a-price span.a-offscreen, #priceblock_ourprice, #priceblock_dealprice, #priceblock_saleprice', { timeout: 10000 }),
      ]);
      console.error('All selectors found. Extracting product data...');
    } catch (e) {
      console.error('Error: لم يتم العثور على كل العناصر الأساسية (العنوان أو الصورة أو السعر)');
      console.error('Closing browser due to error...');
      await browser.close();
      process.exit(1);
    }

    let data = {};
    let price = null;
    let buyBoxWinner = null;
    // جلب السعر من الصفحة الرئيسية فقط بالسلكتور الدقيق
    price = await page.evaluate(() => {
      const priceElement = document.querySelector('#corePrice_feature_div .a-price .a-offscreen');
      return priceElement ? priceElement.innerText : null;
    });
    buyBoxWinner = await page.evaluate(() => {
      return document.querySelector('#sellerProfileTriggerId')?.innerText || null;
    });

    // إذا لم يوجد السعر أو البائع، جرب الضغط على زر See All Buying Options
    if (!price || !buyBoxWinner) {
      const btnSelector = 'span#buybox-see-all-buying-choices a.a-button-text';
      const btn = await page.$(btnSelector);
      if (btn) {
        await btn.evaluate(b => b.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await new Promise(r => setTimeout(r, 500));
        await btn.click();
        // انتظر حتى ظهور أول عرض في الـ sidebar
        await page.waitForSelector('div[id^="aod-offer"] .a-section.a-spacing-none.aok-align-center.aok-relative > span.aok-offscreen', { timeout: 15000 });
        await new Promise(r => setTimeout(r, 2000)); // انتظار إضافي لتحميل باقي العروض
        // جلب السعر والبائع من كل العروض في الـ sidebar
        const sidebarData = await page.evaluate(() => {
          const offers = Array.from(document.querySelectorAll('div[id^="aod-offer"]'));
          for (const offer of offers) {
            const priceEl = offer.querySelector('.a-section.a-spacing-none.aok-align-center.aok-relative > span.aok-offscreen');
            const sellerEl = offer.querySelector('div#aod-offer-soldBy a.a-size-small.a-link-normal');
            if (priceEl && sellerEl) {
              return {
                price: priceEl.innerText,
                buyboxWinner: sellerEl.innerText,
              };
            }
          }
          return { price: null, buyboxWinner: null };
        });
        if (sidebarData.price) price = sidebarData.price;
        if (sidebarData.buyboxWinner) buyBoxWinner = sidebarData.buyboxWinner;
      }
    }
    data.price = price;
    data.buyboxWinner = buyBoxWinner;
    // إذا لم يتم العثور على السعر بعد كل المحاولات
    if (!price) {
      await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
      const sidebar = await page.$('div#aod-offer');
      if (sidebar) {
        const sidebarHtml = await page.evaluate(el => el.outerHTML, sidebar);
        fs.writeFileSync('debug-sidebar.html', sidebarHtml);
      }
      throw new Error('لم يتم العثور على السعر! تم حفظ صورة وHTML للمراجعة.');
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
        title: document.querySelector('#productTitle')?.innerText.trim(),
        image,
        buyboxWinner: document.querySelector('#sellerProfileTriggerId')?.innerText,
        link: window.location.href,
      };
    });
    data = {
      ...extracted,
      price,
      buyboxWinner: buyBoxWinner || extracted.buyboxWinner,
      asin
    };
    console.error('Extracted data:', data);

    if (!data.price) {
      console.error('Error: لم يتم العثور على السعر!');
      console.error('Closing browser due to missing price...');
      await browser.close();
      process.exit(1);
    }

    console.error('Scraping successful!');
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

const asin = process.argv[2];
if (!asin) {
  console.error('Usage: node amazon_puppeteer.cjs <ASIN>');
  process.exit(1);
}
scrapeAmazon(asin); 