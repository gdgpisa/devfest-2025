// This service worker immediately unregisters itself.
// Needed to fix the Hoverboard bug.

self.addEventListener('install', function(event) {
    // Skip waiting so this service worker becomes active immediately
    self.skipWaiting();
  });
  
  self.addEventListener('activate', function(event) {
    event.waitUntil(
      // Claim all clients
      self.clients.claim()
        .then(function() {
          // Unregister all service workers including itself
          return self.registration.unregister();
        })
        .then(function() {
          // Get all the clients
          return self.clients.matchAll();
        })
        .then(function(clients) {
          // Force each client to reload to see the new website
          clients.forEach(function(client) {
            client.navigate(client.url);
          });
        })
    );
  });
  