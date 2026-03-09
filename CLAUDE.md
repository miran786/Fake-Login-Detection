# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fake Login Detection System — an ML-powered authentication security platform that detects suspicious login activity through risk assessment and sends email alerts. Full-stack: React frontend, Express.js backend, PostgreSQL database, Docker containerization.

## Development Commands

### Frontend (root directory)
```bash
npm start          # Dev server via Craco (http://localhost:3000)
npm run build      # Production build
npm test           # Jest tests (none exist yet)
```

### Backend (`backend/` directory)
```bash
npm start          # Dev server via ts-node (http://localhost:5000)
npm run build      # npx prisma generate && tsc → dist/
npm run start:prod # Run compiled JS from dist/
```

### Docker (full stack)
```bash
docker-compose up --build -d   # Start all services (frontend:80, backend:5000, postgres:5432)
docker-compose down            # Stop all services
```

### Prisma (from `backend/`)
```bash
npx prisma db push      # Push schema to database
npx prisma generate     # Generate Prisma client
```

## Architecture

### Frontend (`src/`)
- **React 18 + TypeScript**, styled with **Tailwind CSS v4** and **Shadcn UI** (Radix primitives)
- Build tool: **Craco** (CRA wrapper with PostCSS config for Tailwind v4)
- `App.tsx` — Root component, routes between login/signup/dashboard views
- `context/AuthContext.tsx` — Central state management (user auth, login history, signup/logout). Uses localStorage for persistence
- `utils/risk-engine.ts` — Client-side risk scoring (mirrors backend logic)
- `utils/email-service.ts` — EmailJS integration for OTP and suspicious login alerts
- `hooks/useLocationData.ts` — IP/geolocation fetching via ipapi.co
- `components/ui/` — Shadcn component library (do not edit manually; use shadcn CLI)
- Path alias: `@/*` maps to `src/*` (configured in tsconfig)

### Backend (`backend/src/`)
- **Express.js 5 + TypeScript**
- `server.ts` — Entry point, CORS + JSON middleware
- `routes/auth.ts` — POST `/api/auth/login`, POST `/api/auth/signup`
- `routes/user.ts` — GET `/api/user/history?email=`, GET `/api/user/failed-attempts?email=`
- `utils/risk-engine.ts` — Server-side risk scoring (must stay in sync with frontend version)
- `prisma/schema.prisma` — Database schema: `User`, `LoginHistory`, `FailedAttempt` models

### Risk Engine (dual implementation: `src/utils/risk-engine.ts` and `backend/src/utils/risk-engine.ts`)
Both must stay in sync. Scoring: new device (+40), new IP (+20), late night login (+15), rapid velocity (+10), random noise (0-10). Risk levels: Low (0-39), Medium (40-69), High (70-100).

### Auth Flow
1. User submits credentials → frontend fetches IP/location via ipapi.co
2. Device fingerprinting via user agent → backend calculates risk score
3. Valid credentials + low/medium risk → success; high risk → blocked
4. 3 failed attempts → suspicious login alert email via EmailJS

### Infrastructure
- `Dockerfile` — Multi-stage build: Node builder → Nginx static serve
- `docker-compose.yml` — Services: `db` (postgres:15), `backend`, `frontend`
- `nginx/nginx.conf` — Reverse proxy config

## Methodology

This project follows the **GSD (Get Shit Done)** methodology. Canonical rules are in `PROJECT_RULES.md`. Key points:

- **Workflow**: SPEC → PLAN → EXECUTE → VERIFY → COMMIT
- **Commit format**: `type(scope): description` (feat, fix, docs, refactor, test, chore)
- **One task = one commit**, always verify before committing
- **Search before reading** — grep/search first, then targeted file reads
- **Proof required** — every change needs empirical verification (curl output, screenshot, test result)
- **State persistence** — use `.gsd/STATE.md` for cross-session memory
- Style conventions detailed in `GSD-STYLE.md`
