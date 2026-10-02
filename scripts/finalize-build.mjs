import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url)),
  dist = root + "dist";
const pkg = JSON.parse(await fs.readFile(root + "package.json", "utf8"));
const files = [
  "index.html",
  "favicon.svg",
  "fallback-art.svg",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  ...(await fs.readdir(dist + "/assets")).map((f) => "assets/" + f),
];
const html = await fs.readFile(dist + "/index.html", "utf8");
const entry = html.match(/src="[^\"]*\/([^/\"]+\.js)"/)?.[1];
const revision = createHash("sha256")
  .update(html + files.join("|"))
  .digest("hex")
  .slice(0, 12);
await fs.writeFile(
  dist + "/index.html",
  html.replace(
    "</head>",
    `<meta name="vibe-build" content="${revision}" /></head>`,
  ),
);
await fs.writeFile(
  dist + "/version.json",
  JSON.stringify({
    version: pkg.version,
    revision,
    entry,
    publishedAt: new Date().toISOString(),
  }),
);
const sw = `const CACHE='vibe-${revision}',FILES=${JSON.stringify(files)};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('vibe-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.endsWith('/catalog.json')||u.pathname.endsWith('/version.json')||u.pathname.endsWith('/sw.js'))return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match(new URL('index.html',self.registration.scope))));return;}if(u.pathname.includes('/assets/')||/favicon.svg|fallback-art.svg|manifest.webmanifest/.test(u.pathname))e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request)));});`;
await fs.writeFile(dist + "/sw.js", sw);
console.log("Vibe update manifest and offline app shell ready", revision);
