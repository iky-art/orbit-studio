/* Orbit Studio — service worker
   Strategi:
   - navigasi  : network-first, jatuh ke cache, lalu halaman luring
   - aset statis: stale-while-revalidate
   - font/CDN  : cache-first dengan batas jumlah
   Tidak ada langkah build; daftar precache statis. */

const VERSION = 'orbit-v3'
const SHELL = `${VERSION}-shell`
const ASSETS = `${VERSION}-assets`
const FONTS = `${VERSION}-fonts`

const SHELL_URLS = [
  '/',
  '/app',
  '/offline.html',
  '/manifest.webmanifest',
  '/logo-mark.png',
  '/icons/favicon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

const isFont = (url) => /fonts\.(googleapis|gstatic)\.com/.test(url.hostname)
const isAsset = (url) =>
  url.origin === self.location.origin &&
  /\.(?:js|css|png|jpg|jpeg|svg|webp|ico|json|webmanifest|woff2?)$/.test(
    url.pathname,
  )

async function trimCache(name, max) {
  const cache = await caches.open(name)
  const keys = await cache.keys()
  if (keys.length <= max) return
  await Promise.all(keys.slice(0, keys.length - max).map((key) => cache.delete(key)))
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // Navigasi halaman
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(SHELL).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached
          const app = await caches.match('/app')
          if (app) return app
          return caches.match('/offline.html')
        }),
    )
    return
  }

  // Font pihak ketiga
  if (isFont(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone()
            caches
              .open(FONTS)
              .then((cache) => cache.put(request, copy))
              .then(() => trimCache(FONTS, 24))
            return response
          }),
      ),
    )
    return
  }

  // Aset milik sendiri
  if (isAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            const copy = response.clone()
            caches
              .open(ASSETS)
              .then((cache) => cache.put(request, copy))
              .then(() => trimCache(ASSETS, 120))
            return response
          })
          .catch(() => cached)
        return cached || network
      }),
    )
  }
})

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})
