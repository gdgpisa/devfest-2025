// This service worker immediately unregisters itself.
// Needed to fix the Hoverboard bug.

self.addEventListener('install', function(event) {
    // Skip waiting so this service worker becomes active immediately
    self.skipWaiting();
  });
  
  self.addEventListener('activate', function(event) {
    event.waitUntil(
      // Unregister all service workers including itself
      self.registration.unregister()
        .then(function() {
          // Tell to all clients to refresh
          return self.clients.matchAll();
        })
        .then(function(clients) {
          clients.forEach(client => client.postMessage({ type: 'REFRESH' }));
        })
    );
  });