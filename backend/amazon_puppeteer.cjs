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
    try {
      data = await page.evaluate(() => ({
        title: document.querySelector('#productTitle')?.innerText.trim(),
        price: document.querySelector('span.a-price span.a-offscreen')?.innerText ||
               document.querySelector('#priceblock_ourprice')?.innerText ||
               document.querySelector('#priceblock_dealprice')?.innerText ||
               document.querySelector('#priceblock_saleprice')?.innerText,
        image: document.querySelector('#landingImage')?.src,
        buyboxWinner: document.querySelector('#sellerProfileTriggerId')?.innerText,
        link: window.location.href,
      }));
      console.error('Extracted data:', data);
    } catch (err) {
      console.error('Error extracting product data:', err);
    }

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