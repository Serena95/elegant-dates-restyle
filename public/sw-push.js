// Custom service worker for push notifications
// This file is loaded alongside the Workbox-generated SW

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "My Pilates Plan";
    const options = {
      body: data.body || "Hai un promemoria!",
      icon: data.icon || "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: "workout-reminder",
      data: { url: data.url || "/" },
      actions: [
        { action: "open", title: "Apri App" },
        { action: "dismiss", title: "Ignora" },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    // Fallback for non-JSON payloads
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("My Pilates Plan", {
        body: text,
        icon: "/pwa-192x192.png",
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
