/* AI-bulletin service worker.
   App shell: cache with network update. news.json: network first, cache as fallback.
   Bump VERSION whenever index.html, the icons or the manifest change. */
const VERSION = "v4";
const SHELL_CACHE = "shell-" + VERSION;
const DATA_CACHE = "data";
const FONT_CACHE = "fonts";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((k) => k.startsWith("shell-") && k !== SHELL_CACHE)
        .map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function newsFirst(request) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const fresh = await fetch(request, { cache: "no-store" });
    if (fresh.ok) {
      await cache.put("news.json", fresh.clone());
      return fresh;
    }
    throw new Error("HTTP " + fresh.status);
  } catch (err) {
    const cached = await cache.match("news.json");
    if (!cached) throw err;
    const headers = new Headers(cached.headers);
    headers.set("X-From-Cache", "1");
    return new Response(await cached.blob(), { status: 200, headers });
  }
}

async function pageFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) cache.put("./index.html", fresh.clone());
    return fresh;
  } catch (err) {
    return (await cache.match("./index.html")) || (await cache.match("./")) || Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok || res.type === "opaque") cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.endsWith("/news.json")) {
      event.respondWith(newsFirst(req));
    } else if (req.mode === "navigate") {
      event.respondWith(pageFirst(req));
    } else {
      event.respondWith(cacheFirst(req, SHELL_CACHE));
    }
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(cacheFirst(req, FONT_CACHE));
  }
});
