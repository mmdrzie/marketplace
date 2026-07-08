# Deployment

## Local Development
1. Start infrastructure: `docker compose up -d`
2. Install deps: `npm install`
3. Run migrations: Apply SQL files from `backend/migrations/` to database
4. Start backend: `npm run dev:backend`
5. Start frontend: `npm run dev:frontend`

## Production (Vercel)
- Backend deploys as Vercel Edge Functions
- Frontend deploys as Vercel static + serverless
- Environment variables configured in Vercel dashboard
- Database: Supabase production project
