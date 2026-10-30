import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 3001);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({ limit: '20kb' }));
const eventClients = new Set();

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

app.get('/api/status', (_req, res) => {
  res.json({ mode: process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER ? 'live' : 'demo' });
});

app.post('/api/sms', async (req, res) => {
  const { phone, message } = req.body || {};
  if (typeof phone !== 'string' || !/^\+[1-9]\d{7,14}$/.test(phone)) {
    return res.status(400).json({ error: 'Enter a valid phone number in international format, e.g. +919876543210.' });
  }
  if (typeof message !== 'string' || message.trim().length < 3 || message.length > 300) {
    return res.status(400).json({ error: 'Message must be between 3 and 300 characters.' });
  }
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_FROM_NUMBER: from } = process.env;
  if (!sid || !token || !from) {
    return res.json({ mode: 'demo', message: 'Demo SMS queued locally. Add Twilio environment variables to send a real SMS.' });
  }
  try {
    const body = new URLSearchParams({ To: phone, From: from, Body: message.trim() });
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body
    });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error: data.message || 'SMS provider rejected the request.' });
    return res.json({ mode: 'live', sid: data.sid, message: 'SMS sent through Twilio.' });
  } catch {
    return res.status(502).json({ error: 'Could not reach the SMS provider. Please try again.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(__dirname, '../dist');
  app.use(express.static(dist));
  app.get(/.*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}
app.listen(port, '0.0.0.0', () => console.log(`MaMothy API listening on ${port}`));
