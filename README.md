# MaMothy Village Safety Simulator

An interactive village-and-elephant safety demo with a live-feeling illustrated map, simulated sensor and patrol locations, community alerts, and an optional SMS test flow.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. The Vite client runs on port 5173 and proxies `/api` requests to the Express API on port 3001. The map and 128-member audience are demo data. The broadcast action uses server-sent events to reach every currently connected demo browser session, updates the activity feed, and shows a browser notification where permission is granted. It does not contact a real village user directory or emergency service.

## Deploy on Render

The repository includes `render.yaml` for a Singapore-region Render web service. In Render, choose **New → Blueprint**, connect this GitHub repository and the `arena/f6e117f3-mamothy-demo` branch, then apply the blueprint. Render runs `npm ci && npm run build`, starts `npm start`, and uses `/api/status` as its health check. The first deployment stays in demo SMS mode. Do not add Twilio credentials to a public service until the SMS endpoint has authentication and rate limiting.

## SMS behavior

SMS is **demo-only until Twilio credentials are configured**. Copy `.env.example` to `.env`, add your Account SID, Auth Token, and the Twilio trial number, then restart the server. For Render, set the same variables in the service's Environment settings.

Trial mode is on by default (`TWILIO_TRIAL_MODE=true`). It sends Twilio's fixed `sms_event_notifications` trial template rather than the custom MaMothy text. Twilio's trial SMS flow is limited to verified U.S. (`+1`) recipients; an Indian `+91` destination requires upgrading the Twilio account. Verify the test recipient in Twilio first. See [Twilio trial SMS instructions](https://www.twilio.com/docs/usage/trials/try-out-sms).

After upgrading, set `TWILIO_TRIAL_MODE=false` to send the custom alert body. SMS can incur charges; message only recipients who consented. The public SMS endpoint currently has no authentication or rate limit, so secure it before enabling paid credentials on a public service. Never commit or share credentials.

For a production build, run `npm run build`, then start the API/static server with `NODE_ENV=production npm start`.
