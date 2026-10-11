const base64ToUint8Array = (value: string) => {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
};

const getServiceWorkerRegistration = async () => {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
};

export const getNotificationPermission = () =>
  typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;

export async function syncPinkmessPushSubscription(userId: string) {
  if (!userId || typeof Notification === 'undefined' || Notification.permission !== 'granted') return false;
  if (!('PushManager' in window)) return false;

  const registration = await getServiceWorkerRegistration();
  if (!registration) return false;

  const keyResponse = await fetch('/api/push/public-key');
  if (!keyResponse.ok) return false;
  const keyData = (await keyResponse.json()) as { enabled?: boolean; publicKey?: string };
  if (!keyData.enabled || !keyData.publicKey) return false;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(keyData.publicKey)
    });
  }

  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, subscription: subscription.toJSON() })
  });
  return response.ok;
}

export async function requestPinkmessNotifications(userId: string) {
  if (typeof Notification === 'undefined') return false;
  const permission = Notification.permission === 'default'
    ? await Notification.requestPermission()
    : Notification.permission;
  if (permission !== 'granted') return false;
  return syncPinkmessPushSubscription(userId);
}

export async function showPinkmessNotification(
  title: string,
  body: string,
  data: { conversationId?: string } = {}
) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  const options: NotificationOptions = {
    body,
    icon: '/assets/pinkmess-iphone-wallpaper.png',
    badge: '/assets/pinkmess-iphone-wallpaper.png',
    tag: data.conversationId ? `pinkmess-${data.conversationId}` : 'pinkmess-message',
    data
  };
  const registration = await getServiceWorkerRegistration();
  if (registration?.showNotification) {
    await registration.showNotification(title, options);
  } else {
    new Notification(title, options);
  }
}
