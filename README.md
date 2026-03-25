# App Skeleton Template

This is a full-stack monorepo skeleton. It includes:
- **Backend**: Express, Prisma, Better-Auth (Google Provider).
- **Frontend**: Vite, React, Tailwind CSS, Shadcn/UI.

## Getting Started

### Prerequisites
- Node.js (current lts)
- Google Cloud Console credentials (for Auth)

### Setup
1. Clone this template into your new project directory.
2. Configure `.env` files in `be/` and `fe/` (see their respective READMEs).
3. You should have postgres running already (not part of this project). 

## Structure
- `be/`: Express backend with authentication.
- `fe/`: Vite/React frontend with dashboard and auth integration.
