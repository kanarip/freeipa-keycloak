"use strict";

const version = '0.0.1';
const cacheName = 'kolab4-v' + version;
const path = 'https://cdn.example.local';
const prefetch = [
    path,
    path + '/jquery.js',
    path + '/app.js'
];

/*
 * Worker installation handler
 */
self.addEventListener('install', event => {
    console.log('[Service Worker] Install');

    event.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log('[Service Worker] Cache Name: ' + cacheName);
            // FIXME: Will that fetch files from the old cache?
            // TODO: I guess we should cache resources using per-resource version
            //       not per-service-worker version, so a resource that didn't
            //       change in a new version of the app can still be fetched from cache.
            return cache.addAll(prefetch)
        })
    );
});

/*
 * Worker activation handler
 */
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activate');

    event.waitUntil(
        // Remove older version caches
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (cacheName.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

/*
 * Resources fetch handler (proxy)
 */
self.addEventListener('fetch', event => {
    console.log('[Service Worker] Fetch ' + event.request.url);

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

/*
 * postMessage handler
 */
self.addEventListener('message', event => {
    console.log('[Service Worker] Message ' + event.data.action);

    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
