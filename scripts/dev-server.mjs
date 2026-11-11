// Local development server that mimics the Vercel setup:
//   static files from public/  +  /api/<name> → api/<name>.js (Node req/res handler)
// Usage: npm run dev   (PORT=3000 by default)
// Real data locally: NORMA_FIN_DATA_FILE=/secure/path/financials.b64 npm run dev
// (keep that file outside the repository).
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const PUBLIC = join(ROOT, "public");
const PORT = Number(process.env.PORT || 3000);
process.env.FIN_DEV_INSECURE_COOKIE = "1"; // plain http locally – see api/_lib/auth.js
if (process.env.NORMA_FIN_DATA_FILE) process.env.NORMA_FIN_DATA = readFileSync(process.env.NORMA_FIN_DATA_FILE, "utf8");

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".ico": "image/x-icon" };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    const api = url.pathname.match(/^\/api\/([a-z0-9-]+)$/);
    if (api) {
      const file = join(ROOT, "api", `${api[1]}.js`);
      await stat(file);
      const mod = await import(pathToFileURL(file).href);
      return await mod.default(req, res);
    }
    let p = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
    if (p.endsWith("/")) p += "index.html";
    const file = join(PUBLIC, p);
    if (!file.startsWith(PUBLIC)) throw Object.assign(new Error("forbidden"), { code: "ENOENT" });
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(body);
  } catch (e) {
    if (e.code === "ENOENT") { res.writeHead(404, { "Content-Type": "text/plain" }); res.end("Not found"); }
    else { console.error(e); res.writeHead(500); res.end("Server error"); }
  }
});
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
