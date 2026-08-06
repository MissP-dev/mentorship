# MConnect — Mentorship Platform

A mentorship platform that pairs ambitious professionals with world-class mentors.

## Project structure

```
frontend/   React + Vite + Tailwind CSS app (the web UI)
backend/    Express API on http://localhost:3002
scripts/    Dev tooling (combined dev launcher)
```

## Run the app (recommended)

From the repo root or the `frontend/` folder, one command starts **both** the API and the web app:

```bash
cd frontend
npm install       # first time only
npm run dev
```

This launches:

- Web app → http://localhost:5173
- API → http://localhost:3002

## Run separately (optional)

```bash
# Terminal 1 — API
cd backend
npm install
npm run dev

# Terminal 2 — web app
cd frontend
npm install
npm run dev:vite
```

## Production build

```bash
cd frontend
npm run build
npm run preview    # also proxies /api to localhost:3002
```

## Configuration

The frontend calls the API at `/api`. In dev and preview this is proxied to
`http://localhost:3002`. To point the app at a different API server (e.g. a
deployed backend), set the `VITE_API_URL` environment variable:

```bash
VITE_API_URL=https://api.example.com npm run dev:vite
```

## Troubleshooting: "Failed to fetch"

This message means the browser could not reach the API. Check that:

1. The backend is running — `curl http://localhost:3002/api/health` should return `{"status":"ok"}`.
2. You're on http://localhost:5173 (the Vite dev server), not a static file server.
3. If you built the app, use `npm run preview` (which proxies `/api`), or set `VITE_API_URL`.

## Demo login

Use a seeded account: `sarah@mconnect.com` / `password123`
