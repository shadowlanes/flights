# Flight

Personal flight tracker. Track upcoming flights, monitor delays and gate changes in real time, and browse past flights on a map.

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL running on localhost:5432
- Google OAuth credentials ([console.cloud.google.com](https://console.cloud.google.com))
- AeroDataBox API key ([rapidapi.com/aedbx-aedbx/api/aerodatabox](https://rapidapi.com/aedbx-aedbx/api/aerodatabox))

### Setup

```bash
# 1. Install dependencies
cd be && npm install
cd ../fe && npm install

# 2. Configure backend environment
cp be/.env.example be/.env
# Edit be/.env with your DATABASE_URL, Google OAuth, and AeroDataBox keys

# 3. Create database and run migrations
cd be
npx prisma migrate dev
npx prisma db seed

# 4. Start both servers
cd be && npm run dev    # Backend on :3001
cd fe && npm run dev    # Frontend on :8100
```

### Docker

```bash
# Set env vars in .env or export them
export GOOGLE_CLIENT_ID=...
export GOOGLE_CLIENT_SECRET=...
export AERODATABOX_API_KEY=...

docker compose up --build
```

## Stack

| Layer    | Tech |
|----------|------|
| Backend  | Express, TypeScript, Prisma, PostgreSQL, Better-Auth |
| Frontend | React 19, Vite, Tailwind CSS v4, Shadcn UI, React Router v7 |
| Maps     | Leaflet.js + OpenStreetMap |
| Flight Data | AeroDataBox (RapidAPI) |
| Auth     | Google OAuth via Better-Auth |
