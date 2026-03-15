# DriveOS Transparency Portal

DriveOS Transparency Portal is a Vercel-ready Next.js prototype that presents autonomous driving progress in a public mission-control dashboard. It uses mock telemetry APIs, incident logs, interactive charts, and a lightweight Three.js perception demo to show how the system learns from mistakes.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- ShadCN-style UI primitives
- Recharts
- Three.js via `@react-three/fiber`
- Mock JSON datasets served through Next.js API routes

## Project Structure

```text
app/
  api/
    incidents/route.ts
    improvements/route.ts
    metrics/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  ui/
  charts-panel.tsx
  dashboard-shell.tsx
  incident-explorer.tsx
  latest-fix-panel.tsx
  live-progress-counter.tsx
  metric-card.tsx
  perception-visualizer.tsx
data/
  incidents.json
  improvements.json
  metrics.json
lib/
  types.ts
  utils.ts
```

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000).

## Deploy To Vercel

1. Push the project to a Git repository.
2. Import the repository into [Vercel](https://vercel.com/).
3. Use the default Next.js build settings.
4. Deploy. No extra environment variables are required.

## Mock APIs

- `GET /api/metrics`
- `GET /api/incidents`
- `GET /api/improvements`

Each endpoint serves realistic mock telemetry from `/Users/vaanchhitagarwal/Documents/New project/data`.
# driveos-transparency-portal
