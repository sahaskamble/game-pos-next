// public/service-worker.js
self.addEventListener('install', (event) => {
	event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', function(event) {
	if (event.data) {
		const data = event.data.json();

		const options = {
			body: data.body,
			icon: '/notification-icon.png',
			badge: '/badge-icon.png',
			vibrate: [100, 50, 100],
			data: {
				url: data.url || '/'
			}
		};

		event.waitUntil(
			self.registration.showNotification(data.title, options)
		);
	}
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
	event.notification.close();

	event.waitUntil(
		clients.matchAll({ type: 'window' }).then(windowClients => {
			// Check if there is already a window open with the target URL
			const url = event.notification.data.url;

			for (const client of windowClients) {
				if (client.url === url && 'focus' in client) {
					return client.focus();
				}
			}

			// If no window is already open, open a new one
			if (clients.openWindow) {
				return clients.openWindow(url);
			}
		})
	);
});
