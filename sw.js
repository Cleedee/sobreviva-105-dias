const CACHE_NAME = 'sobreviva-105-v2';
const ASSETS = [
    './',
    './jogo/index.html',
    './jogo/css/style.css',
    './jogo/js/utils.js',
    './jogo/js/input.js',
    './jogo/js/touch.js',
    './jogo/js/time.js',
    './jogo/js/inventory.js',
    './jogo/js/crafting.js',
    './jogo/js/cabin.js',
    './jogo/js/player.js',
    './jogo/js/world.js',
    './jogo/js/ui.js',
    './jogo/js/game.js',
    './jogo/js/main.js',
    './jogo/assets/icons/icon-192.png',
    './jogo/assets/icons/icon-512.png'
];

// Instalar - cache dos assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Ativar - limpar caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Buscar - cache first, network fallback
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cached) => {
                if (cached) return cached;
                return fetch(event.request).then((response) => {
                    // Cache de novos recursos automaticamente
                    if (response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, clone);
                        });
                    }
                    return response;
                });
            })
            .catch(() => {
                // Fallback offline para navegação
                if (event.request.mode === 'navigate') {
                    return caches.match('./jogo/index.html');
                }
            })
    );
});
