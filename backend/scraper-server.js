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
const redisHost = process.env.REDIS_HOST || 'localhost';
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
  const { asin, options } = req.body;
  if (!asin) {
    return res.status(400).json({ error: 'ASIN is required' });
  }
  try {
    const job = await scrapeQueue.add({ asin, options });
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
    const { asin, options } = job.data;
    const browser = await connectToBrowser();
    const result = await scrapeProductDetails(asin, browser, options);
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

async function scrapeProductDetails(asin, browser, options = {}) {
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

      // Set zoom to 75% for better content display
      await page.evaluate(() => {
        document.body.style.zoom = '75%';
        document.body.style.transform = 'scale(0.75)';
        document.body.style.transformOrigin = 'top left';
      });
      console.log(`🔍 Zoom set to 75% for better content display`);

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
        const getText = (selector) => document.querySelector(selector) ? document.querySelector(selector).innerText.trim() : undefined;
        const getAttribute = (selector, attribute) => document.querySelector(selector) ? document.querySelector(selector).getAttribute(attribute) : undefined;
        return {
          title: getText('#productTitle'),
          price: getText('div.a-section.a-spacing-micro span.a-price span.a-offscreen') || getText('#priceblock_ourprice') || getText('#priceblock_dealprice') || getText('#priceblock_saleprice'),
          image: getAttribute('#landingImage', 'src'),
          buyboxWinner: getText('#sellerProfileTriggerId'),
          link: window.location.href,
        };
      });
      success = true;
    } catch (error) {
      console.error(`Error scraping ASIN ${asin}, attempt ${attempt} of ${maxRetries}:`, error);
    }
  }
  await page.close();
  // Always include asin, only include requested fields
  const filtered = { asin };
  if (options?.includeTitle && productDetails.title) filtered.title = productDetails.title;
  if (options?.includeImage && productDetails.image) filtered.image = productDetails.image;
  if (options?.includePrice && productDetails.price) filtered.price = productDetails.price;
  if (options?.includeBuyboxWinner && productDetails.buyboxWinner) filtered.buyboxWinner = productDetails.buyboxWinner;
  if (options?.includeLink && productDetails.link) filtered.link = productDetails.link;
  return filtered;
}

async function connectToBrowser() {
  const maxRetries = 5;
  let attempt = 0;
  let browser = null;
  
  // Try to connect to existing browser first (for Docker setup)
  if (process.env.BROWSER_WS) {
    while (attempt < maxRetries && !browser) {
      attempt++;
      try {
        browser = await puppeteer.connect({ browserWSEndpoint: process.env.BROWSER_WS, timeout: 120000 });
        console.log('Connected to existing browser instance');
        return browser;
      } catch (error) {
        console.error(`Error connecting to browser, attempt ${attempt} of ${maxRetries}:`, error);
        if (attempt >= maxRetries) {
          console.log('Failed to connect to existing browser, launching new one...');
          break;
        }
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }
  
  // Launch new browser instance (for local development)
  try {
    console.log('Launching new browser instance...');
    browser = await puppeteer.launch({
      headless: false, // VISIBLE BROWSER
      defaultViewport: null,
      slowMo: 50, // Reduced slowMo for better performance
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
        '--window-size=800,600', // SMALL WINDOW FOR DISPLAY ONLY
        '--disable-web-security', // Disable web security
        '--disable-features=VizDisplayCompositor', // Fix display issues
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });
    console.log('Browser launched successfully');
    return browser;
  } catch (error) {
    console.error('Error launching browser:', error);
    throw new Error('Failed to launch browser');
  }
}

