// Run: node theme/preview.cjs; open http://localhost:4173
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.md': 'text/plain', '.txt': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif' };
const server = http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400); response.end('Bad request'); return; }
  const filename = path.resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
  const relative = path.relative(root, filename);
  if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some(part => part.startsWith('.'))) {
    response.writeHead(403); response.end('Forbidden'); return;
  }
  fs.readFile(filename, (error, data) => {
    if (error) { response.writeHead(404); response.end('Not found'); return; }
    const type = types[path.extname(filename).toLowerCase()] || 'application/octet-stream';
    response.setHeader('Content-Type', type + (/^(text\/|image\/svg)/.test(type) ? '; charset=utf-8' : ''));
    response.setHeader('Cache-Control', 'no-store');
    response.end(data);
  });
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? 'Port 4173 is in use. Open http://localhost:4173 or stop the other preview first.' : error.message);
  process.exitCode = 1;
});
server.listen(4173, '127.0.0.1', () => console.log('Preview: http://localhost:4173 (Ctrl+C to stop)'));
