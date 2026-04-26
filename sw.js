const CACHE = 'cacao-v1';
const ARCHIVOS = [
    '/',
    '/index.html',
    '/script.js',
    '/styles.css',
    '/logo.png'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(ARCHIVOS))
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});