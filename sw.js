const CACHE_NAME = 'experto-inmobiliario-v1';
const urlsToCache = [
    './',
    './index.html',
    './assets/css/style.css',
    './assets/js/script.js',
    './assets/img/avatar.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
