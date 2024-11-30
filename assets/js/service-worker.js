const CACHE_NAME = 'pivot-tour-cache-v1';
const OFFLINE_URL = './offline.html'; // Página de fallback offline

// Lista de recursos essenciais para cache com caminhos relativos
const ESSENTIAL_CACHE_URLS = [
  './',
  './index.html',
  './offline.html',
  './css/main.css',
  './js/main.js',
  './img/logo-pivot.png',
  './img/img-home.avif',
  // Imagens de pacotes
  './img/maceio.jpg',
  './img/rj.webp',
  './img/natal.jpg',
  './img/joaopessoa.jpg',
  // Imagens de cruzeiros
  './img/MSV-Armonia.jpeg',
  './img/MSV-CostaDiadema.jpg',
  './img/MSV-CostaFavo.jpeg',
  './img/MSV-Seaview.jpg',
  // Imagens de hotéis e resorts
  './img/hotel-windsor.jpg',
  './img/hotel-hardman.jpg',
  './img/resort-caucaia.jpg',
  './img/resort-touros.jpg',
  './img/foto-sobre.jpg',
  './img/foto-sobre2.jpg'
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

// Estratégia de cache com Network First
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não são GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Verifica se é uma resposta válida
        if (!networkResponse || networkResponse.status !== 200) {
          return caches.match(event.request)
            .then((cachedResponse) => cachedResponse || caches.match(OFFLINE_URL));
        }

        // Atualiza o cache em segundo plano
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });

        return networkResponse;
      })
      .catch(() => {
        // Sem conexão de rede, busca no cache
        return caches.match(event.request)
          .then((cachedResponse) => cachedResponse || caches.match(OFFLINE_URL));
      })
  );
});

// Tratamento de notificações push (opcional)
self.addEventListener('push', (event) => {
  const title = 'Pivot Tour';
  const options = {
    body: 'Novas ofertas de viagem disponíveis!',
    icon: './img/logo-pivot.png',
    badge: './img/logo-pivot.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Script de registro do Service Worker (a ser incluído em um arquivo separado, como main.js)
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js', { scope: './' })
        .then(registration => {
          console.log('Service Worker registrado com sucesso:', registration);
        })
        .catch(error => {
          console.error('Falha no registro do Service Worker:', error);
        });
    });
  }
}

// Chamar esta função quando a página carregar
registerServiceWorker();