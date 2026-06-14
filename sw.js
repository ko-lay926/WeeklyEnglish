const CACHE_NAME = "weeklyenglish-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./quizzes.json",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

/* Install */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))

  );

  self.skipWaiting();
});

/* Activate */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys.map(key => {

          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }

        })

      );

    })

  );

  self.clients.claim();
});

