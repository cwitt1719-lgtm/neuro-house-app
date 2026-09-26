const CACHE = "neuro-house-v1";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "index.html", "styles.css", "app.js", "manifest.json", "icon.svg"])));
  self.skipWaiting();
});
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(h => h || fetch(e.request)));
});
