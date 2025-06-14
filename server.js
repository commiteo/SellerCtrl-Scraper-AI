const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.API_PORT || 3001;

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

        const scriptPath = path.join(__dirname, 'amazon_scrape.py');
        const args = [scriptPath, asin, JSON.stringify({
          title: !!options?.includeTitle,
          image: !!options?.includeImage,
          price: !!options?.includePrice,
          buybox: !!options?.includeBuyboxWinner,
          link: !!options?.includeLink,
        })];

        const py = spawn('python3', args);
        let stdout = '';
        py.stdout.on('data', d => (stdout += d.toString()));
        let stderr = '';
        py.stderr.on('data', d => (stderr += d.toString()));

        py.on('close', code => {
          if (code !== 0 && !stdout) {
            return sendJSON(res, 500, { error: stderr || 'Scraper failed' });
          }
          try {
            const result = JSON.parse(stdout);
            if (result.error) {
              return sendJSON(res, 500, { error: result.error });
            }
            sendJSON(res, 200, { data: result });
          } catch (err) {
            sendJSON(res, 500, { error: 'Invalid response from scraper' });
          }
        });
      } catch (err) {
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
