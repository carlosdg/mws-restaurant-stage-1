const cacheName = "restaurant-reviews-v2";

// Cache vital assets on install
self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(cacheName)
      .then(cache =>
        cache.addAll([
          "/",
          "img/icons/icon16.png",
          "css/styles.css",
          "index.js",
          "restaurant.js",
          "https://unpkg.com/leaflet@1.3.1/dist/leaflet.js"
        ])
      )
  );
});

// When the service worker activates -> delete old caches so we don't fill
// the user memory with unused data
self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(
              key => key.startsWith("restaurant-reviews") && key != cacheName
            )
            .map(key => caches.delete(key))
        )
      )
  );
});

// Returns the response cached or fetches the request.
// If the request is from our origin we also keep it in the cache
self.addEventListener("fetch", event => {
  const requestUrl = new URL(event.request.url);
  let response;

  if (requestUrl.origin !== location.origin) {
    // If the request is not from our origin and it is not in the cache ->
    // do not store it in the cache, just fetch it
    response = caches
      .match(event.request)
      .then(cacheResponse => cacheResponse || fetch(event.request));
  } else {
    // If the request is for a resource of our origin and it is not cached ->
    // fetch it and add it to the cache
    response = caches.open(cacheName).then(cache =>
      caches.match(event.request).then(cacheResponse => {
        if (cacheResponse) {
          return cacheResponse;
        }

        return fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
    );
  }

  event.respondWith(response);
});
