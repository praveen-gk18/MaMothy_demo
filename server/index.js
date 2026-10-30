import 'dotenv/config';
import { timingSafeEqual } from 'node:crypto';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 3001);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));
const eventClients = new Set();
const smsAttempts = new Map();
const pinFailures = new Map();

app.get('/api/events', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.flushHeaders();
  res.write('retry: 3000\n\n');
  eventClients.add(res);
  const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 25000);
  req.on('close', () => { clearInterval(heartbeat); eventClients.delete(res); });
});

app.post('/api/alerts', (req, res) => {
  const alert = {
    title: 'Safety alert sent to all users',
    detail: typeof req.body?.detail === 'string' ? req.body.detail.slice(0, 200) : 'Elephant sighting near Kaveri east boundary',
    time: 'Just now', type: 'warning', recipients: eventClients.size
  };
  for (const client of eventClients) client.write(`data: ${JSON.stringify(alert)}\n\n`);
  res.json({ ok: true, recipients: eventClients.size, audience: 128 });
});

function getMsg91Config() {
  const authKey = process.env.MSG91_AUTH_KEY?.trim();
  const templateId = process.env.MSG91_TEMPLATE_ID?.trim();
  const adminPin = process.env.SMS_ADMIN_PIN?.trim();
  const missing = [
    !authKey || /your_|placeholder|\.\.\./i.test(authKey) ? 'MSG91_AUTH_KEY' : null,
    !templateId || /your_|placeholder|\.\.\./i.test(templateId) ? 'MSG91_TEMPLATE_ID' : null,
    !adminPin || adminPin.length < 8 ? 'SMS_ADMIN_PIN (use at least 8 characters)' : null
  ].filter(Boolean);
  return { authKey, templateId, adminPin, missing, mode: missing.length ? 'demo' : 'live' };
}

function matchesAdminPin(provided, expected) {
  const actual = Buffer.from(provided || '', 'utf8');
  const secret = Buffer.from(expected || '', 'utf8');
  return actual.length === secret.length && actual.length > 0 && timingSafeEqual(actual, secret);
}

app.get('/api/status', (_req, res) => {
  const { missing, mode } = getMsg91Config();
  res.json({ provider: 'MSG91', mode, missing });
});

function checkSmsRateLimit(ip, phone) {
  const now = Date.now();
  const key = `${ip}:${phone}`;
  const recent = (smsAttempts.get(key) || []).filter(time => now - time < 60 * 60 * 1000);
  if (recent.length >= 5) return false;
  recent.push(now);
  smsAttempts.set(key, recent);
  return true;
}

function allowPinAttempt(ip) {
  const now = Date.now();
  const recent = (pinFailures.get(ip) || []).filter(time => now - time < 15 * 60 * 1000);
  if (recent.length >= 10) return false;
  recent.push(now);
  pinFailures.set(ip, recent);
  return true;
}

app.post('/api/sms', async (req, res) => {
  const { phone } = req.body || {};
  if (typeof phone !== 'string' || !/^\+[1-9]\d{7,14}$/.test(phone)) {
    return res.status(400).json({ error: 'Enter a valid phone number in international format, for example +919876543210.' });
  }
  const { authKey, templateId, adminPin, missing, mode } = getMsg91Config();
  if (missing.length) {
    return res.json({ mode: 'demo', message: `Demo SMS queued locally. Missing server settings: ${missing.join(', ')}.` });
  }
  const ip = req.ip || 'unknown';
  if (!matchesAdminPin(req.get('x-sms-admin-pin'), adminPin)) {
    if (!allowPinAttempt(ip)) return res.status(429).json({ error: 'Too many incorrect PIN attempts. Try again in 15 minutes.' });
    return res.status(401).json({ error: 'Incorrect SMS admin PIN.' });
  }
  if (!checkSmsRateLimit(ip, phone)) {
    return res.status(429).json({ error: 'SMS test limit reached for this number. Try again in an hour.' });
  }

  try {
    const payload = {
      template_id: templateId,
      short_url: '0',
      realTimeResponse: '1',
      recipients: [{ mobiles: phone.replace(/\D/g, '') }]
    };
    const response = await fetch('https://control.msg91.com/api/v5/flow', {
      method: 'POST',
      headers: { authkey: authKey, accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000)
    });
    const data = await response.json().catch(() => ({}));
    const providerError = data?.type?.toLowerCase() === 'error';
    if (!response.ok || providerError) {
      const detail = data?.message || data?.error || 'MSG91 rejected the request.';
      return res.status(502).json({ error: typeof detail === 'string' ? detail : JSON.stringify(detail) });
    }
    return res.json({
      mode,
      requestId: typeof data?.message === 'string' ? data.message : undefined,
      message: 'MSG91 accepted the SMS request. Check MSG91 SMS Logs for delivery status.'
    });
  } catch (error) {
    const timeout = error?.name === 'TimeoutError';
    return res.status(502).json({ error: timeout ? 'MSG91 request timed out. Check MSG91 Logs before retrying.' : 'Could not reach MSG91. Please try again.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(__dirname, '../dist');
  app.use(express.static(dist));
  app.get(/.*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}
app.listen(port, '0.0.0.0', () => console.log(`MaMothy API listening on ${port}; SMS provider: MSG91`));
