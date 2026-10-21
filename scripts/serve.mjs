// `npm run dev`: serves this folder at http://localhost:3001 so the page behaves as it will online.
// No dependencies, nothing to install. Port 3001 so it never clashes with the aod.co.in project on 3000;
// another port with `PORT=4000 npm run dev` (or `$env:PORT=4000; npm run dev` in PowerShell).
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { networkInterfaces } from "node:os";

const root = resolve(import.meta.dirname, "..");
const port = Number(process.env.PORT) || 3001;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
};

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = normalize(join(root, path));
  if (file !== root && !file.startsWith(root + sep)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  try {
    if (statSync(file).isDirectory()) file = join(file, "index.html");
    const stat = statSync(file);
    const type = types[extname(file).toLowerCase()] || "application/octet-stream";
    const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
    // Videos are fetched in ranges by browsers (Safari insists), so answer those properly.
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Number(range[2]) : stat.size - 1;
      res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Content-Length": end - start + 1, "Accept-Ranges": "bytes", "Cache-Control": "no-cache" });
      createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, { "Content-Type": type, "Content-Length": stat.size, "Accept-Ranges": "bytes", "Cache-Control": "no-cache" });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
  }
}).listen(port, () => {
  console.log(`\n  AOD for Exhibitors is running:\n\n  On this computer:  http://localhost:${port}`);
  // The same page on a phone on the same Wi-Fi, to try it as exhibitors will.
  for (const list of Object.values(networkInterfaces()))
    for (const net of list || []) if (net.family === "IPv4" && !net.internal) console.log(`  On your phone:     http://${net.address}:${port}`);
  console.log("\n  Stop it with Ctrl + C.\n");
});
