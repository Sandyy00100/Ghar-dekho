// Deliberately minimal: this service worker caches NOTHING except the
// offline page. The app loads React/Babel/Firebase from CDNs and changes
// often — caching index.html here would leave users stuck on old versions.
// It exists so Android (Play Store / installed app) shows a friendly
// "you're offline" screen instead of Chrome's dinosaur page.
const OFFLINE_CACHE = "gd-offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(OFFLINE_CACHE).then((c) => c.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== OFFLINE_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Only page navigations are touched; every other request (Firebase,
  // Cloudinary, CDNs) goes straight to the network as if no SW existed.
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL))
  );
});
