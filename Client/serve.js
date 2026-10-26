import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const REMOTE_API = 'https://skillbridge-hackathon-api.onrender.com';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  // ── Proxy /api requests to backend to avoid CORS restrictions ──
  if (req.url.startsWith('/api/') || req.url === '/api') {
    const targetUrl = new URL(req.url, REMOTE_API);
    const headers = { ...req.headers };
    // Strip headers that trigger CORS restrictions on Render
    delete headers.host;
    delete headers.origin;
    delete headers.referer;

    const proxyReq = https.request(targetUrl, {
      method: req.method,
      headers
    }, proxyRes => {
      res.writeHead(proxyRes.statusCode, {
        ...proxyRes.headers,
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'access-control-allow-headers': 'Content-Type, Authorization'
      });
      proxyRes.pipe(res);
    });

    proxyReq.on('error', err => {
      console.error('[API Proxy Error]', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json', 'access-control-allow-origin': '*' });
      res.end(JSON.stringify({ success: false, message: 'Cannot reach backend API: ' + err.message }));
    });

    req.pipe(proxyReq);
    return;
  }

  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.join(__dirname, reqPath);

  // Security: prevent path traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n===========================================`);
  console.log(` SkillBridge Client running locally at:`);
  console.log(` http://localhost:${PORT}`);
  console.log(` http://localhost:${PORT}/pages/skill-arena.html`);
  console.log(`===========================================\n`);
});
