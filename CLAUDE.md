# Flight Tracker App

Personal flight tracking web app. Monorepo with `be/` (backend) and `fe/` (frontend).

## Tech Stack

- **Backend**: Express.js + TypeScript, Prisma ORM, PostgreSQL, Better-Auth (Google OAuth)
- **Frontend**: React 19 + Vite, Tailwind CSS v4, Shadcn UI (new-york), React Router v7, Leaflet.js
- **APIs**: AeroDataBox (RapidAPI) for flight data. OpenSky deferred to v1.5.
- **Testing**: Vitest + Supertest (`be/tests/`)
- **Design**: Liquid glass aesthetic, dark theme. Fonts: Outfit (headings), DM Sans (body).

## Project Structure

```
flights/
├── be/                    # Backend
│   ├── src/
│   │   ├── app.ts         # Express app (importable for tests)
│   │   ├── index.ts       # Server entry + cron jobs
│   │   ├── lib/           # prisma.ts, auth.ts
│   │   ├── middleware/     # auth.ts (requireAuth)
│   │   ├── routes/        # flights.ts, airports.ts
│   │   └── services/      # aerodatabox.ts, flight-updater.ts, archiver.ts, opensky.ts (stub)
│   ├── prisma/
│   │   ├── schema.prisma  # Models: User, Session, Account, Verification, Airport, Airline, Flight
│   │   └── seed.ts        # Seeds 85 airports + 56 airlines
│   └── tests/             # api.test.ts (11 tests)
├── fe/                    # Frontend
│   ├── src/
│   │   ├── App.jsx        # Router + glass layout shell
│   │   ├── pages/         # Dashboard, AddFlight, FlightDetail, Archive
│   │   ├── components/    # StatusBadge, FlightCard, ErrorBoundary + ui/ (shadcn)
│   │   └── lib/           # api.js (fetch wrapper), auth-client.ts
│   └── index.css          # Glass theme CSS (.glass, .glass-card, .atmosphere, .glow-*)
└── docker-compose.yml
```

## Commands

```bash
# Backend
cd be && npm run dev          # Start dev server (port 3001)
cd be && npm test             # Run vitest tests
cd be && npx prisma studio    # Browse database

# Frontend
cd fe && npm run dev          # Start Vite dev server (port 8100)
cd fe && npx vite build       # Production build

# Database
cd be && npx prisma migrate dev --name <name>   # New migration
cd be && npx prisma db seed                       # Re-seed airports/airlines
```

## Key Patterns

- `app.ts` is separated from `index.ts` so supertest can import the Express app without starting the server.
- Flight routes use per-route `requireAuth` middleware (not global router middleware) to avoid blocking other routers.
- AeroDataBox responses are cached in the `apiCache` JSON column with `lastApiFetchAt` for staleness checks.
- Cron: flight status polling every 90s, auto-archive every 10min.
- Frontend uses CSS classes `.glass` (nav), `.glass-card` (content cards), `.atmosphere` (background).
- All times stored as UTC in the database.

## Environment Variables

Backend (`be/.env`):
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth
- `AERODATABOX_API_KEY` - RapidAPI key
- `FRONTEND_URL` - CORS origin (default: http://localhost:8100)

Frontend: `VITE_API_URL` (default: http://localhost:3001)
