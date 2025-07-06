require('dotenv').config();
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const PORT = process.env.PORT || 3002;
console.log('PORT from env:', process.env.PORT);

const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8';
const supabase = createClient(supabaseUrl, supabaseKey);

const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
};

async function crawlUrl(url) {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'accept-language': 'en-US,en;q=0.9' });
    await page.setJavaScriptEnabled(true);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    const pageText = await page.evaluate(() => document.body.innerText);
    await browser.close();

    if (!GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY');
    const prompt = `Extract the most important content from the following text and summarize it as a well-structured Markdown document. If the text contains a list of products, show them as a Markdown list with title, price, and description if possible.\n\nTEXT:\n${pageText}`;
    const gemRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    const gemJson = await gemRes.json();
    const markdown = gemJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { text: pageText, markdown };
  } catch (err) {
    console.error('crawlUrl error:', err);
    throw err;
  }
}

// --- SYNC COMPETITORS LOGIC ---
async function syncCompetitors() {
  // Amazon sellers
  const { data: amazonSellers, error: amazonErr } = await supabase
    .from('amazon_scraping_history')
    .select('current_seller, asin')
    .neq('current_seller', null);
  if (amazonErr) throw amazonErr;
  const amazonMap = {};
  (amazonSellers || []).forEach(row => {
    if (!row.current_seller) return;
    if (!amazonMap[row.current_seller]) amazonMap[row.current_seller] = [];
    amazonMap[row.current_seller].push(row.asin);
  });
  // Noon sellers
  const { data: noonSellers, error: noonErr } = await supabase
    .from('noon_scraping_history')
    .select('seller, product_code')
    .neq('seller', null);
  if (noonErr) throw noonErr;
  const noonMap = {};
  (noonSellers || []).forEach(row => {
    if (!row.seller) return;
    if (!noonMap[row.seller]) noonMap[row.seller] = [];
    noonMap[row.seller].push(row.product_code);
  });
  // Upsert Amazon competitors
  for (const seller in amazonMap) {
    await supabase.from('competitors').upsert([
      {
        seller_name: seller,
        platform: 'Amazon',
        product_count: amazonMap[seller].length,
        product_codes: amazonMap[seller],
        is_ignored: false
      }
    ], { onConflict: 'seller_name,platform' });
  }
  // Upsert Noon competitors
  for (const seller in noonMap) {
    await supabase.from('competitors').upsert([
      {
        seller_name: seller,
        platform: 'Noon',
        product_count: noonMap[seller].length,
        product_codes: noonMap[seller],
        is_ignored: false
      }
    ], { onConflict: 'seller_name,platform' });
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/api/scrape') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { asin, options } = JSON.parse(body);
        if (!asin) {
          return sendJSON(res, 400, { error: 'ASIN is required' });
        }

        const scriptPath = path.join(__dirname, 'amazon_puppeteer.cjs');
        const args = [scriptPath, asin];

        console.log(`Starting Amazon scraper for ASIN: ${asin}`);
        const py = spawn('node', args);
        let stdout = '';
        py.stdout.on('data', d => (stdout += d.toString()));
        let stderr = '';
        py.stderr.on('data', d => (stderr += d.toString()));

        py.on('close', code => {
          console.log(`Amazon scraper finished with code: ${code}`);
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
          if (code !== 0 && !stdout) {
            const userError = stderr?.split('\n').find(line => line.startsWith('Error:')) || 'Scraper failed';
            return sendJSON(res, 500, { error: userError.replace('Error:', '').trim() });
          }
          try {
            const jsonMatch = stdout.match(/{[\s\S]*}/);
            if (!jsonMatch) return sendJSON(res, 500, { error: 'No JSON output' });
            const result = JSON.parse(jsonMatch[0]);
            sendJSON(res, 200, { data: result });
          } catch (err) {
            console.error('JSON parse error:', err);
            sendJSON(res, 500, { error: 'Invalid response from scraper' });
          }
        });
      } catch (err) {
        console.error('Request parse error:', err);
        sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/noon-scrape') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { productCode, options } = JSON.parse(body);
        if (!productCode) {
          return sendJSON(res, 400, { error: 'Product code is required' });
        }

        const scriptPath = path.join(__dirname, 'noon_puppeteer.cjs');
        const args = [scriptPath, productCode];

        console.log(`Starting Noon scraper for product: ${productCode}`);
        const py = spawn('node', args);
        let stdout = '';
        py.stdout.on('data', d => (stdout += d.toString()));
        let stderr = '';
        py.stderr.on('data', d => (stderr += d.toString()));

        py.on('close', code => {
          console.log(`Noon scraper finished with code: ${code}`);
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
          try {
            const jsonMatch = stdout.match(/{[\s\S]*}/);
            if (!jsonMatch) return sendJSON(res, 500, { error: 'No JSON output' });
            const result = JSON.parse(jsonMatch[0]);
            const allBlank = Object.values(result).every(v => !v);
            if (allBlank) return sendJSON(res, 500, { error: 'No data scraped from Noon product.' });
            sendJSON(res, 200, { data: result });
          } catch (err) {
            console.error('JSON parse error:', err);
            sendJSON(res, 500, { error: 'Invalid response from scraper' });
          }
        });
      } catch (err) {
        console.error('Request parse error:', err);
        sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/crawl') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { url } = JSON.parse(body);
        if (!url) return sendJSON(res, 400, { error: 'URL is required' });
        const result = await crawlUrl(url);
        sendJSON(res, 200, { data: result });
      } catch (err) {
        console.error('crawl error:', err);
        sendJSON(res, 500, { error: 'Failed to crawl url' });
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/sync-competitors') {
    syncCompetitors()
      .then(() => sendJSON(res, 200, { success: true }))
      .catch(err => {
        console.error('syncCompetitors error:', err);
        sendJSON(res, 500, { error: 'Failed to sync competitors' });
      });
  } else {
    sendJSON(res, 404, { error: 'Not Found' });
  }
});

server.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
