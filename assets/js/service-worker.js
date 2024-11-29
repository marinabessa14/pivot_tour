const CACHE_NAME = 'pivot-tour-cache-v1';
const OFFLINE_URL = '/offline.html'; // Crie esta página HTML de fallback

// Lista de recursos essenciais para cache
const ESSENTIAL_CACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/main.css',
  '/js/main.js',
  '/img/logo-pivot.png',
  '/img/img-home.avif',
  // Adicione aqui os caminhos para imagens, ícones e outros recursos essenciais
  '/img/maceio.jpg',
  '/img/rj.webp',
  '/img/natal.jpg',
  '/img/joaopessoa.jpg',
  '/img/MSV-Armonia.jpeg',
  '/img/MSV-CostaDiadema.jpg',
  '/img/MSV-CostaFavo.jpeg',
  '/img/MSV-Seaview.jpg',
  '/img/hotel-windsor.jpg',
  '/img/hotel-hardman.jpg',
  '/img/resort-caucaia.jpg',
  '/img/resort-touros.jpg',
  '/img/foto-sobre.jpg',
  '/img/foto-sobre2.jpg'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Precache recursos essenciais
        return cache.addAll(ESSENTIAL_CACHE_URLS);
      })
      .catch((error) => {
        console.error('Falha no precache:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Limpa caches antigos
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições de rede
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não são GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Resposta em cache encontrada
        if (response) {
          return response;
        }

        // Tenta buscar da rede
        return fetch(event.request)
          .then((networkResponse) => {
            // Verifica se é uma resposta válida
            if (!networkResponse || networkResponse.status !== 200) {
              return caches.match(OFFLINE_URL);
            }

            // Adiciona nova resposta ao cache
            return caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
          })
          .catch(() => {
            // Sem conexão de rede
            return caches.match(OFFLINE_URL);
          });
      })
  );
});

// Tratamento de notificações push (opcional)
self.addEventListener('push', (event) => {
  const title = 'Pivot Tour';
  const options = {
    body: 'Novas ofertas de viagem disponíveis!',
    icon: '/img/logo-pivot.png',
    badge: '/img/logo-pivot.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});