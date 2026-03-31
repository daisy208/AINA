# AINA – Women Safety & Legal Evidence App

## Overview
AINA is a mission-critical, privacy-first safety platform backend. It provides a Node.js + Express REST API with PostgreSQL via Prisma ORM.

## Architecture
- **Backend**: Node.js + Express (API server)
- **Database**: PostgreSQL + Prisma ORM
- **Mobile**: React Native (Expo) — client-side code lives in `mobile/`, `screens/`, `components/`

## Running the App
The server runs on port 5000. Start with:
```bash
node server.js
```

## Key Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (auto-set by Replit DB)
- `JWT_SECRET` — Secret for JWT signing (set in Replit Secrets)
- `PORT` — Server port (default: 5000)
- `NODE_ENV` — `development` or `production`
- `RATE_LIMIT_MAX` — Max requests per 15 min window (default: 300)
- `CORS_ORIGIN` — Comma-separated allowed origins
- `GEMINI_API_KEY` — Optional: Google Gemini AI key
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Optional: for file storage
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` — Optional: for real SMS alerts

## Project Structure
```
server.js           — Entry point (http + socket.io server)
app.js              — Express app setup
config/env.js       — Env var validation
controllers/        — Route handlers
middleware/         — Express middleware (validate, sanitize, error handling, security)
middlewares/        — Auth middleware (uses JWT sub/issuer/audience claims)
routes/             — Express routers
services/           — Business logic (AI, storage, notifications, realtime)
validations/        — Zod schemas
prisma/schema.prisma — Database schema
prisma/migrations/  — Applied DB migrations
prisma/seed.js      — Demo data seeder
utils/asyncHandler.js — Async route wrapper
```

## API Endpoints
- `GET /health` — Health check
- `POST /auth/register` — User registration (email + password, min 8 chars)
- `POST /auth/login` — Login → returns JWT
- `POST /incident/analyze` — AI analysis of incident text
- `POST /incident` — Create incident (replay-protected, encrypted evidence)
- `GET /incident` — Get user's incidents
- `GET /incident/:id` — Get single incident
- `GET /incidents/nearby` — Get nearby incidents by lat/lng
- `POST /contacts` — Add trusted contact
- `GET /contacts` — Get trusted contacts
- `POST /sos/trigger` — Trigger SOS alert (replay-protected)
- `GET /report/summary` — Legal report summary
- `GET /report/export/json` — Export incidents as JSON
- `GET /report/export/pdf` — Export incidents as PDF
- `POST /notifications/device-token` — Register push notification token
- `GET /ai/insights` — AI-powered incident pattern analysis

## WebSocket Events (Socket.IO)
- `incident:created` — Emitted when a new incident is logged
- `sos:triggered` — Emitted when SOS is activated

## Database Setup
Run migrations with:
```bash
npx prisma migrate dev
npx prisma generate
```
Seed demo data:
```bash
node prisma/seed.js
```

## Merge Conflict Resolution (PRs #1 & #2)
Both open PRs were merged into main:
- **PR #1** (`codex/upgrade-aina-app-to-production-ready`): Replay protection, offline queues, legal exports
- **PR #2** (`codex/upgrade-aina-app-to-production-ready-506bhx`): AI insights, real-time Socket.IO, Twilio SMS, map support, dark UI, sanitization, structured error responses

Key resolved conflicts:
- `middlewares/authMiddleware.js` now uses JWT `sub` claim + issuer/audience validation
- All routes use `middlewares/authMiddleware` (upgraded token format)
- `app.js` sets `trust proxy = 1` to fix rate-limiter behind Replit proxy
- `middleware/errorMiddleware.js` and `middleware/validate.js` use structured `{ success, error }` responses
- `prisma/schema.prisma` adds `latitude` and `longitude` to `Incident` model
- `validations/schemas.js` adds `authRegisterSchema`, `authLoginSchema`, `contactSchema`
- Socket.IO integrated in `server.js` with `services/realtimeService.js`
- Twilio integration in `services/notificationService.js`
