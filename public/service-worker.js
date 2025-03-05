// This service worker immediately unregisters itself.
// Needed to fix the Hoverboard bug.

self.addEventListener('install', function(event) {
    // Detect if there was a previous service worker
    self.hadPreviousSW = !!self.registration.active;
    // Skip waiting so this service worker becomes active immediately
    self.skipWaiting();
  });
  
  self.addEventListener('activate', function(event) {
    event.waitUntil(
      self.clients.claim()
        // Unregister all service workers including itself
        .then(() => self.registration.unregister())
        .then(() => {
          // Only reload clients if there was a previous service worker
          if (self.hadPreviousSW) {
            return self.clients.matchAll();
          } else {
            return []; // Skip reload
          }
        })
        .then(clients => {
          clients.forEach(client => client.navigate(client.url));
        })
    );
  });
