# Backend Template

Express backend with Prisma and Better-Auth.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/template_db?schema=public"
   PORT=3001
   FRONTEND_URL="http://localhost:8100"
   BETTER_AUTH_URL="http://localhost:3001"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

3. Run Prisma migrations:
   ```bash
   npx prisma db push
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Endpoints
- `GET /api/health`: Healthcheck.
- `ALL /api/auth/*`: Better-Auth endpoints.
- `GET /api/protected`: Example protected route (requires authentication).

## Adding new routes
1. Create a new file in `src/routes/`.
2. Import and use it in `src/index.ts`.
