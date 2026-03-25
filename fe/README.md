# Frontend Template

Vite + React frontend with Tailwind CSS and Shadcn/UI.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (optional for local dev):
   - `VITE_API_URL`: Backend API URL (default: http://localhost:3001)

3. Start development server:
   ```bash
   npm run dev
   ```

## Key Features
- **Better-Auth Integration**: Pre-configured `authClient` in `src/lib/auth-client.ts`.
- **Styling**: Tailwind CSS with Shadcn variables in `src/index.css`.
- **Components**: Ready for Shadcn/UI components.

## Adding Shadcn components
```bash
npx shadcn@latest add [component-name]
```
