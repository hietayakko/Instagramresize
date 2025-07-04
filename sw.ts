/// <reference lib="webworker" />

// This service worker can be customized
// https://developers.google.com/web/tools/workbox/modules/workbox-sw
import { clientsClaim } from "workbox-core"
import { ExpirationPlugin } from "workbox-expiration"
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching"
import { registerRoute } from "workbox-routing"
import { StaleWhileRevalidate } from "workbox-strategies"

declare const self: ServiceWorkerGlobalScope

clientsClaim()

// Precache all of the assets generated by your build process.
// Their URLs are injected into the manifest variable below.
// This variable must be present somewhere in your service worker file,
// even if you decide not to use precaching. See https://cra.link/PWA
precacheAndRoute(self.__WB_MANIFEST)

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = /\/[^/?]+\.[^/]+$/
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({ request, url }: { request: Request; url: URL }) => {
    // If this isn't a navigation, skip.
    if (request.mode !== "navigate") {
      return false
    }

    // If this is a URL that starts with /_, skip.
    if (url.pathname.startsWith("/_")) {
      return false
    }

    // If this looks like a URL for a resource, because it contains
    // a file extension, skip.
    if (fileExtensionRegexp.test(url.pathname)) {
      return false
    }

    // Return true to signal that we want to use the handler.
    return true
  },
  createHandlerBoundToURL("/"),
)

// Cache images with a Cache First strategy
registerRoute(
  // Check to see if the request's destination is style for stylesheets, script for JavaScript, or image for images
  ({ request }) => request.destination === "image",
  // Use a Cache First caching strategy
  new StaleWhileRevalidate({
    // Put all cached files in a cache named 'images'
    cacheName: "images",
    plugins: [
      // Ensure that only requests that result in a 200 status are cached
      // new CacheableResponsePlugin({
      //   statuses: [200],
      // }),
      // Don't cache more than 50 items, and expire them after 30 days
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
      }),
    ],
  }),
)

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
