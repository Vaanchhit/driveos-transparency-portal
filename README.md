# Health Credit Score Engine

Next.js prototype that converts biometric inputs into a 0-100 fatigue and injury proxy score, explains the main drivers, and maps the result to a mock insurance action.

## What it includes

- Biometric input controls for RHR, HRV, sleep, consistency, strain, and age
- Derived signals for recovery, strain load, and baseline deviation
- Deterministic risk scoring engine shared by UI and API
- Explainability layer that decomposes the score into key drivers
- 7-day trend chart and what-if simulator
- Mock insurer API at `POST /api/health-score`

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Recharts
- TypeScript

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API example

`POST /api/health-score`

```json
{
  "restingHeartRate": 64,
  "hrv": 52,
  "sleepHours": 6.3,
  "sleepConsistency": 71,
  "activityStrain": 7,
  "age": 36
}
```

Returns score, risk band, recommended action, derived signals, and ranked drivers.
