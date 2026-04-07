const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:stephankuesel@protonmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = async (req, res) => {
  // CORS — GitHub Pages origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subscription, message } = req.body;

  if (!subscription || !message) {
    return res.status(400).json({ error: 'Missing subscription or message' });
  }

  const payload = JSON.stringify({
    title: 'Mahlzeiten-Planer',
    body: message,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'mahlzeiten-update',
    renotify: false
  });

  try {
    await webpush.sendNotification(subscription, payload);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Push send failed:', error.statusCode, error.message);
    // 410 = subscription expired/unsubscribed — not an error per se
    if (error.statusCode === 410) {
      return res.status(200).json({ success: false, reason: 'subscription_expired' });
    }
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};
