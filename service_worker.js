const cacheName = 'restaurant-reviews-v2';

// Cache vital assets while waiting to install
self.addEventListener('install', event => {
    event.waitUntil(caches
        .open(cacheName)
        .then(cache =>
            cache.addAll([
                '/',
                '/restaurant.html',
                'css/styles.css',
                'data/restaurants.json',
                'js/dbhelper.js',
                'js/main.js',
                'js/restaurant_info.js'
            ])
        )
    )
})

// Returns the response cached or fetches the request and adds it to the cache
// if there was no response cached.
self.addEventListener('fetch', event => {
    const response = caches
        .open(cacheName)
        .then(cache => cache
            .match(event.request)
            .then(response => {
                if (response) { return response; }

                return fetch(event.request).then(networkResponse => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                })
            })
        )

    event.respondWith(response);
})