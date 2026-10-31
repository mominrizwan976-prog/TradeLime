// TradeLime – phone notifications (Firebase Cloud Messaging web push).
// Keep this file next to index.html (same folder). Do not rename it.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var p = {};
  try { p = e.data ? e.data.json() : {}; } catch (x) { p = { data: { body: e.data ? e.data.text() : '' } }; }
  var d = Object.assign({}, p.notification || {}, p.data || {});
  var opt = {
    body: d.body || '',
    icon: '/icon-512.png',
    badge: '/icon-512.png',
    vibrate: [200, 100, 200],
    data: { url: d.url || '/' }
  };
  if (d.tag) { opt.tag = d.tag; opt.renotify = true; }
  e.waitUntil(self.registration.showNotification(d.title || 'TradeLime', opt));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = new URL((e.notification.data && e.notification.data.url) || '/', self.location.origin).href;
  var path = (e.notification.data && e.notification.data.url) || '/';
  // Website already open: bring it to the front and open that order / product inside it.
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].url.indexOf(self.location.origin) === 0 && 'focus' in list[i]) {
        try { list[i].postMessage({ open: path }); } catch (x) {}
        return list[i].focus();
      }
    }
    return self.clients.openWindow(url);
  }));
});
