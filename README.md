# MaMothy Village Safety Simulator

An interactive village-and-elephant safety demo with a live-feeling illustrated map, simulated sensor and patrol locations, community alerts, and an optional SMS test flow.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. The Vite client runs on port 5173 and proxies `/api` requests to the Express API on port 3001. The map and 128-member audience are demo data. The broadcast action uses server-sent events to reach every currently connected demo browser session, updates the activity feed, and shows a browser notification where permission is granted. It does not contact a real village user directory or emergency service.

## Deploy on Render

The repository includes `render.yaml` for a Singapore-region Render web service. In Render, choose **New → Blueprint**, connect this GitHub repository and the `arena/f1b67c16-mamothy-demo` branch, then apply the blueprint. Render runs `npm ci && npm run build`, starts `npm start`, and uses `/api/status` as its health check. The first deployment stays in demo SMS mode.

## SMS behavior (MSG91)

SMS remains **demo-only until MSG91 is configured**. Create a DLT-approved SMS content template and map it to an MSG91 SMS Flow. Copy `.env.example` to `.env` and set `MSG91_AUTH_KEY` and `MSG91_TEMPLATE_ID` (the Flow/template ID from MSG91). For Render, add these two keys under the service's **Environment** settings. The API uses MSG91's [Flow Send SMS endpoint](https://docs.msg91.com/sms/send-sms); the DLT-approved Flow controls the message text, so the app does not send arbitrary custom SMS content. See MSG91's [template mapping guidance](https://msg91.com/help/dlt-registration-in-india/map-sms-content-template-on-msg91-api-panel).

Enter the recipient in international format, such as `+919876543210`. The API sends India-format digits to MSG91 and limits repeat tests to five sends per recipient/IP per hour. MSG91 accepting a request is not proof of delivery; check SMS Logs. SMS can incur charges, and the public endpoint still has no authentication. Secure it before putting live MSG91 credentials on a public service. Never commit or share credentials.

For a production build, run `npm run build`, then start the API/static server with `NODE_ENV=production npm start`.
