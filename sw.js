const CACHE = 'liga-oriental-v1';
const FILES = [
  '/index-v2.html',
  '/index-auth-google.html',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/js/supabase-config.js',
  '/js/tournaments.js',
  '/js/stats.js',
  '/js/export.js',
  '/js/script-v2.js',
  '/js/admin-users.js',
  '/js/auth.js',
  '/js/auth-google.js',
  '/js/app-template.js',
  '/assets/img/liga.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => new Response('Offline', { status: 503 })))
  );
});
