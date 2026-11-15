/* Konee's English: push notifications only. No fetch interception or cache replacement. */
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  event.waitUntil(self.registration.showNotification(data.title || "Konee's English", {
    body: data.body || '오늘도 영어 표현 10분! 공부할 시간이에요 📚',
    icon: './icon-192.png', badge: './icon-192.png',
    tag: 'konee-daily-reminder', renotify: true,
    data: { url: new URL('./', self.registration.scope).href }
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = new URL('./', self.registration.scope).href;
  event.waitUntil((async () => {
    const windows = await clients.matchAll({type:'window', includeUncontrolled:true});
    const existing = windows.find(w => w.url.startsWith(url));
    if (existing) return existing.focus();
    return clients.openWindow(url);
  })());
});
