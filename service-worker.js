// This service worker file is for Progressive Web App (PWA) functionality.
// It allows the app to work offline by caching assets.

const CACHE_NAME = 'bidd-sports-cache-v4'; // Incremented cache version
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'HurunuiCollegeLogoRefresh-07%20large.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.autotable.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js',
  'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2' // Cache the font file
];

// Install the service worker and cache the core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching assets for offline use.');
        return Promise.all(
          urlsToCache.map(url => {
            // For cross-origin requests, we need to create a new Request object with no-cors mode.
            const request = (url.startsWith('http')) ? new Request(url, { mode: 'no-cors' }) : url;
            return cache.add(request).catch(error => {
              console.warn(`Failed to cache ${url}:`, error);
            });
          })
        );
      })
  );
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
});

// Serve content using a Cache First, then Network strategy
self.addEventListener('fetch', event => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }
  
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                // If we have a match in the cache, return it.
                if (response) {
                    return response;
                }

                // Otherwise, fetch from the network.
                return fetch(event.request).then(networkResponse => {
                    // Check if we received a valid response
                    if (networkResponse && networkResponse.status === 200) {
                         // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        const responseToCache = networkResponse.clone();
                        cache.put(event.request, responseToCache);
                    }
                    return networkResponse;
                });
            });
        })
    );
});


// Update the cache when the service worker is activated
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Become the active service worker for all clients immediately.
  );
});

