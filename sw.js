// Bvmbino Pro — Service Worker v2
// Strategy: cache-first for shell/assets, network-only for all AI API calls

const CACHE = 'bvmbino-v2';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// These origins are never cached — always hit network live
const NETWORK_ONLY_HOSTS = [
  'api.openai.com',
  'api.anthropic.com',
  'api.groq.com',
  'api.mistral.ai',
  'openrouter.ai',
  'api.cerebras.ai',
  'generativelanguage.googleapis.com',
  'r.jina.ai',
  'html.duckduckgo.com',
  'api.stability.ai',
];

// ── Install: precache the app shell ──────────────────────────────
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

// ── Activate: delete stale caches ────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: smart routing ──────────────────────────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return; // skip POST (AI calls, webhooks)

  const url = new URL(e.request.url);

  // Never intercept AI API / search calls
  if (NETWORK_ONLY_HOSTS.some(h => url.hostname.includes(h))) return;

  // For same-origin requests: stale-while-revalidate
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.open(CACHE).then(async cache => {
        const cached = await cache.match(e.request);
        const fetchPromise = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => null);
        return cached || (await fetchPromise);
      })
    );
    return;
  }

  // For CDN resources (fonts, libraries): cache-first
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com') ||
      url.hostname.includes('cdnjs.cloudflare.com')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        });
      })
    );
  }
});
