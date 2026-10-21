// Mochi's House on phones: lets the installed app open even without internet.
// It always tries the internet first, so updates show up straight away; the saved copy is only
// used when there's no connection. Only this website's own files are saved (never sign-in or sync).
const CACHE = "mochi-v1";
const FIRST = ["./", "lib/sync.js", "lib/app-192.png", "lib/app-512.png", "manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FIRST)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/music/")) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r.mode === "navigate" ? "./" : r, copy)); }
      return res;
    }).catch(() => caches.match(r.mode === "navigate" ? "./" : r).then(m => m || caches.match("./")))
  );
});
