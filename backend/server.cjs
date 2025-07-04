const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.API_PORT || 3002;

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
            return sendJSON(res, 500, { error: stderr || 'Scraper failed' });
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
          
          if (code !== 0 && !stdout) {
            return sendJSON(res, 500, { error: stderr || 'Scraper failed' });
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
  } else {
    sendJSON(res, 404, { error: 'Not Found' });
  }
});

server.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
