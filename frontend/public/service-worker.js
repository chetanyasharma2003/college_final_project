self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.delete('schemes-analytics-v1'),
      caches.delete('schemes-api-v1'),
      self.clients.claim(),
      self.registration.unregister(),
    ]),
  )
})
