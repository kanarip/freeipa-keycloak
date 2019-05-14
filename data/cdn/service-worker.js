"use strict";
// https://deanhume.com/displaying-a-new-version-available-progressive-web-app/

// cache names from version.json?
const src_jquery = '3.3.0';

self.addEventListener('install',
    event => {
        event.waitUntil(
            caches.open(cacheName).then(
                cache => cache.addAll(
                    [
                        'https://cdn.kolab.io/jquery.js'
                    ]
                )
            )
        );
    }
);

self.addEventListener('fetch',
    event => {
        event.respondWith(
            caches.match(event.request).then(
                response => {
                    if (response) {
                        return response;
                    }

                    return fetch(event.request);
                }
            )
        );
    }
);
