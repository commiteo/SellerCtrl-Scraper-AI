import express from 'express';
import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import util from 'util';
import NetworkSpeed from 'network-speed';
import Queue from 'bull';
import Redis from 'ioredis';

const execPromise = util.promisify(exec);
const testNetworkSpeed = new NetworkSpeed();
const app = express();

const port = process.env.PORT || 3001;
app.use(express.json());

// Redis configuration
const redisHost = process.env.REDIS_HOST || 'redis';
const redisPort = process.env.REDIS_PORT || 6379;

const redis = new Redis({ host: redisHost, port: redisPort });
const scrapeQueue = new Queue('scrapeQueue', { redis: { host: redisHost, port: redisPort } });

// Endpoint to check network speed
app.get('/check-network-speed', async (_req, res) => {
  try {
    const speedMbps = await checkNetworkSpeed();
    res.json({ speedMbps });
  } catch (error) {
    console.error('Error checking network speed:', error);
    res.status(500).json({ error: 'Failed to check network speed' });
  }
});

// Endpoint to enqueue a scrape job for a single ASIN
app.post('/api/scrape', async (req, res) => {
  const { asin } = req.body;
  if (!asin) {
    return res.status(400).json({ error: 'ASIN is required' });
  }
  try {
    const job = await scrapeQueue.add({ asin });
    res.json({ jobId: job.id });
  } catch (error) {
    console.error('Error adding job to the queue:', error);
    res.status(500).json({ error: 'Failed to add job' });
  }
});

// Endpoint to check job status
app.get('/job-status/:id', async (req, res) => {
  try {
    const job = await scrapeQueue.getJob(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const state = await job.getState();
    res.json({ id: job.id, state, result: job.returnvalue });
  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

app.listen(port, () => {
  console.log(`Scraper server running on http://localhost:${port}`);
});

// Worker to process the scrape queue
scrapeQueue.process(async (job, done) => {
  try {
    const { asin } = job.data;
    const browser = await connectToBrowser();
    const result = await scrapeProductDetails(asin, browser);
    await browser.close();
    done(null, result);
  } catch (error) {
    console.error('Error processing job:', error);
    done(error);
  }
});

async function solveCaptcha(captchaUrl) {
  try {
    const { stdout } = await execPromise(`python solve_captcha.py "${captchaUrl}"`);
    return stdout.trim();
  } catch (error) {
    console.error('Error solving CAPTCHA:', error);
    throw error;
  }
}

async function checkNetworkSpeed() {
  try {
    const baseUrl = 'https://eu.httpbin.org/stream-bytes/500000';
    const fileSizeInBytes = 500000;
    const speed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes);
    return speed.mbps;
  } catch (error) {
    console.error('Error checking network speed:', error);
    return 0;
  }
}

async function scrapeProductDetails(asin, browser) {
  const page = await browser.newPage();
  const maxRetries = 3;
  let attempt = 0;
  let success = false;
  let productDetails;

  while (attempt < maxRetries && !success) {
    attempt++;
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      const url = `https://www.amazon.eg/dp/${asin}?language=en_AE`;
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });

      if (await page.$('#captchacharacters')) {
        const captchaImageElement = await page.$('div.a-row.a-text-center img');
        if (captchaImageElement) {
          const captchaUrl = await captchaImageElement.evaluate(img => img.src);
          const captchaSolution = await solveCaptcha(captchaUrl);
          await page.type('#captchacharacters', captchaSolution);
          await page.click('button[type="submit"]');
          await page.waitForNavigation({ waitUntil: 'networkidle2' });
        }
      }

      productDetails = await page.evaluate(() => {
        const getText = (selector) => document.querySelector(selector) ? document.querySelector(selector).innerText.trim() : 'Not found';
        const getAttribute = (selector, attribute) => document.querySelector(selector) ? document.querySelector(selector).getAttribute(attribute) : 'Not found';
        const priceElement = document.querySelector('div.a-section.a-spacing-micro span.a-price span.a-offscreen');
        let price = priceElement ? priceElement.innerText : 'Not found';
        if (price !== 'Not found') {
          price = parseFloat(price.replace(/[^\d.-]/g, ''));
        }
        const title = getText('#productTitle');
        const imageUrl = getAttribute('#landingImage', 'src');
        const brandText = getText('#bylineInfo');
        const brand = brandText.includes('Brand:') ? brandText.split('Brand:')[1].trim() : brandText.trim();
        const buyBoxWinner = getText('#sellerProfileTriggerId');
        const category = getText('ul.a-unordered-list.a-horizontal.a-size-small li span.a-list-item a.a-link-normal.a-color-tertiary');
        const rankElements = document.querySelectorAll('tr');
        let categoryRank = 'Not found';
        let subCategoryRank = 'Not found';
        rankElements.forEach((el) => {
          const th = el.querySelector('th');
          if (th && th.innerText.includes('Best Sellers Rank')) {
            const spans = el.querySelectorAll('td span span');
            if (spans.length > 0) {
              categoryRank = spans[0] ? spans[0].innerText.split('(')[0].trim() : 'Not found';
              subCategoryRank = spans[1] ? spans[1].innerText.split('(')[0].trim() : 'Not found';
            }
          }
        });
        if (categoryRank !== 'Not found') {
          const match = categoryRank.match(/#\d+(,\d{3})*/);
          if (match) categoryRank = match[0];
        }
        if (subCategoryRank !== 'Not found') {
          const match = subCategoryRank.match(/#\d+(,\d{3})*/);
          if (match) subCategoryRank = match[0];
        }
        return { price, title, imageUrl, brand, buyBoxWinner, category, categoryRank, subCategoryRank };
      });

      if (productDetails.price === 'Not found' || productDetails.buyBoxWinner === 'Not found') {
        const buyingOptionsButton = await page.$('span#buybox-see-all-buying-choices a.a-button-text');
        if (buyingOptionsButton) {
          await buyingOptionsButton.click();
          await page.waitForSelector('div#aod-offer-price span.a-price span.a-offscreen', { timeout: 60000 });
          productDetails = await page.evaluate(() => {
            const getText = (selector) => document.querySelector(selector) ? document.querySelector(selector).innerText.trim() : 'Not found';
            const getAttribute = (selector, attribute) => document.querySelector(selector) ? document.querySelector(selector).getAttribute(attribute) : 'Not found';
            const priceElement = document.querySelector('div#aod-offer-price span.a-price span.a-offscreen');
            let price = priceElement ? priceElement.innerText : 'Not found';
            if (price !== 'Not found') {
              price = parseFloat(price.replace(/[^\d.-]/g, ''));
            }
            const title = getText('#productTitle');
            const imageUrl = getAttribute('#landingImage', 'src');
            const brandText = getText('#bylineInfo');
            const brand = brandText.includes('Brand:') ? brandText.split('Brand:')[1].trim() : brandText.trim();
            const buyBoxWinner = getText('div#aod-offer-soldBy a');
            const category = getText('ul.a-unordered-list.a-horizontal.a-size-small li span.a-list-item a.a-link-normal.a-color-tertiary');
            const rankElements = document.querySelectorAll('tr');
            let categoryRank = 'Not found';
            let subCategoryRank = 'Not found';
            rankElements.forEach((el) => {
              const th = el.querySelector('th');
              if (th && th.innerText.includes('Best Sellers Rank')) {
                const spans = el.querySelectorAll('td span span');
                if (spans.length > 0) {
                  categoryRank = spans[0] ? spans[0].innerText.split('(')[0].trim() : 'Not found';
                  subCategoryRank = spans[1] ? spans[1].innerText.split('(')[0].trim() : 'Not found';
                }
              }
            });
            if (categoryRank !== 'Not found') {
              const match = categoryRank.match(/#\d+(,\d{3})*/);
              if (match) categoryRank = match[0];
            }
            if (subCategoryRank !== 'Not found') {
              const match = subCategoryRank.match(/#\d+(,\d{3})*/);
              if (match) subCategoryRank = match[0];
            }
            return { price, title, imageUrl, brand, buyBoxWinner, category, categoryRank, subCategoryRank };
          });
        }
      }
      success = true;
    } catch (error) {
      console.error(`Error scraping ASIN ${asin}, attempt ${attempt} of ${maxRetries}:`, error);
    }
  }
  if (!success) {
    productDetails = { asin, price: 'Error', title: 'Error', brand: 'Error', buyBoxWinner: 'Error', imageUrl: 'Error', category: 'Error', categoryRank: 'Error', subCategoryRank: 'Error', date: new Date().toISOString() };
  }
  await page.close();
  return productDetails;
}

async function connectToBrowser() {
  const maxRetries = 5;
  let attempt = 0;
  let browser = null;
  while (attempt < maxRetries && !browser) {
    attempt++;
    try {
      browser = await puppeteer.connect({ browserWSEndpoint: process.env.BROWSER_WS || 'ws://chrome:3000', timeout: 120000 });
    } catch (error) {
      console.error(`Error connecting to browser, attempt ${attempt} of ${maxRetries}:`, error);
      if (attempt >= maxRetries) {
        throw new Error('Failed to connect to browser');
      }
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  return browser;
}

