<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# OmniStock

OmniStock is a warehouse and inventory management demo with a React frontend and an Express API.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies with `npm install`.
2. Set `GEMINI_API_KEY` to enable Gemini-powered API features. In production, also configure a unique `JWT_SECRET`.
3. Run the frontend and API together with `npm run dev`.
4. Create a production build with `npm run build`, then serve it with `npm start`.

The demo API is available under `/api`; `/api/health` reports server status. Demo accounts and credentials are shown on the sign-in page. Demo data is held in memory and resets when the server restarts; use a persistent database before deploying this demo for real operations.
