// service-worker.js self.addEventListener('install', (e) => { e.waitUntil( caches.open('led-scale-mapper-cache').then((cache) => { return cache.addAll([ './', './index.html', './manifest.json' ]); }) ); });

self.addEventListener('fetch', (e) => { e.respondWith( caches.match(e.request).then((response) => { return response || fetch(e.request); }) ); });

