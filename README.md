# SGW Operational Resilience — MVP Demo

An AECOM-branded decision-support web app for **Southeastern Grid & Water (SGW)**, built
from the [PRD](docs/SGW_Operational_Resilience_PRD.md). It brings the Phase-1 MVP to life with
**mock data** while keeping the real technical capabilities: explainable asset-risk scoring,
impact forecasting, constrained crew optimisation, a cross-domain dependency cascade, and a
read-only GenAI copilot.

The whole demo is anchored on a **Category-3 hurricane making landfall in 48 hours**. A global
**scenario clock** (play / pause / scrub in the top bar) drives everything in "real time" — as
it advances, hazard exposure rises, risk scores recompute, the dashboard priority queue
re-orders, and the impact forecast updates. It's deterministic, so you can rewind and replay.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

`npm run build` produces a static bundle in `dist/`.

## Pages

| Route | What it shows |
|-------|---------------|
| `/` | Marketing-grade landing / context |
| `/dashboard` | EOC risk view — interactive map, filters, **live priority queue**, asset detail with explainability + dependency cascade. Tops out with a **live NWS weather-alert feed** (real `api.weather.gov` data, cached last-good with staleness) |
| `/forecasting` | Customers-affected & restoration time-series with confidence bands |
| `/dependencies` | **Cross-domain cascade graph** (F6 differentiator) — interactive grid→water dependency network; click an asset to trace downstream impact and customers exposed |
| `/aerial` | Aerial / computer-vision damage detection (Phase-2 preview) |
| `/deployment` | Human-approvable crew plan (Approve / Reject), routing-fallback toggle, audit log |
| `/copilot` | NL queries over live state that cite assets & scores (also a floating panel everywhere) |

## How it's built

- **React + Vite + React Router**, **Recharts** (forecasts), **react-leaflet** (map).
- **AECOM design system** in `src/theme/` (brand tokens + control-surface layer).
- **Mock data + simulation** in `src/data/` and `src/lib/`:
  - `lib/risk.js` — explainable, time-varying risk engine (pure functions of asset + clock)
  - `lib/forecast.js` — impact / outage projection
  - `lib/optimise.js` — crew assignment + zone-staging fallback
  - `lib/ScenarioContext.jsx` — the global clock + audit log
  - `data/assets.js` — unified grid + water asset model with cross-domain dependencies

> Demo data is illustrative. Risk severity uses a functional red/amber/teal ramp; AECOM brand
> green is reserved for actions and CTAs.
