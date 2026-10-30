# MaMothy Village Safety Simulator

An interactive village-and-elephant safety demo with a live-feeling illustrated map, simulated sensor and patrol locations, community alerts, and an optional SMS test flow.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. The Vite client runs on port 5173 and proxies `/api` requests to the Express API on port 3001. The map and 128-member audience are demo data. The broadcast action uses server-sent events to reach every currently connected demo browser session, updates the activity feed, and shows a browser notification where permission is granted. It does not contact a real village user directory or emergency service.

## Deploy on Render

The repository includes `render.yaml` for a Singapore-region Render web service. In Render, choose **New → Blueprint**, connect this GitHub repository and the `arena/5be8b11c-mamothy-demo` branch, then apply the blueprint. Render runs `npm ci && npm run build`, starts `npm start`, and uses `/api/status` as its health check. The first deployment stays in demo SMS mode. Do not add Twilio credentials to a public service until the SMS endpoint has authentication and rate limiting.

## SMS behavior

SMS is **demo-only by default**: the API validates the number and message, then returns a local queue confirmation without contacting a mobile network. For real delivery, create/configure a Twilio account, copy `.env.example` to `.env`, and fill in the three Twilio values in that private file. The server loads `.env` automatically:

```bash
cp .env.example .env
# Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in .env
```

Restart the server after setting them. The SMS form currently accepts a 10-digit Indian mobile number and adds the `+91` country code. Live SMS can incur charges; use it only for recipients who have consented to receive messages. Twilio account status, sender permissions, and local SMS rules can also affect delivery. Never commit or share real credentials.

For a production build, run `npm run build`, then start the API/static server with `NODE_ENV=production npm start`.
