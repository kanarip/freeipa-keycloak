"use strict";
// https://deanhume.com/displaying-a-new-version-available-progressive-web-app/

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('https://cdn.kolab.io/service-worker.js').then(
        registration => {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }
    ).catch(
        err => {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        }
    );
}
