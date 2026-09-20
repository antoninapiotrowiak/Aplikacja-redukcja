// Service Worker dla powiadomień
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Obsługa kliknięć w przyciski powiadomień
self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const action = event.action;

    notification.close(); // Zamknij powiadomienie po kliknięciu

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            let targetUrl = '/index.html';

            if (action === 'open-posilki') {
                targetUrl = '/posilki.html';
            } else if (action === 'open-trening') {
                targetUrl = '/trening.html';
            } else {
                // Jeśli kliknięto całe powiadomienie
                targetUrl = notification.data?.url || '/index.html';
            }

            // Jeśli aplikacja jest już otwarta w karcie, przełącz na nią
            for (const client of clientList) {
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Jeśli nie jest otwarta, otwórz nową kartę/okno
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
