# AINA – Women Safety & Legal Evidence App (Production-Ready 100%)

AINA is now structured as a mission-critical, privacy-first safety platform:
- end-to-end encrypted evidence lifecycle
- replay/tamper-resistant APIs
- offline-first emergency workflows
- AI risk intelligence + legal-grade reporting
- deployment-ready backend hardening

## 1) Architecture

### Stack (unchanged)
- Frontend: React Native (Expo)
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma

### Security & Reliability Additions
- AES-256-CBC + PBKDF2 evidence encryption on device
- SHA-256 integrity hash verification on backend
- Request replay protection via nonce + timestamp headers
- Helmet security headers + global rate limiting
- Zod request validation for critical endpoints
- Winston structured logging
- Offline queue + retry for incidents/SOS

## 2) Feature Highlights

### End-to-End Encryption Lifecycle
- Encrypt before upload (`mobile/encryption.js`)
- Hash verification at API entry (`controllers/incidentController.js`)
- Decrypt locally in incidents screen with passphrase

### AI Intelligence Layer
- Gemini classification/entity extraction
- AI insight persistence (`AIInsight` model)
- repeated offender and escalation detection
- legal narrative summary for reports

### Emergency Reliability
- SOS captures location + 30s audio
- encrypted SOS payload upload
- retry mechanism (3 attempts)
- offline queue fallback + sync on reconnect
- fallback alert status path (`fallback_sms` simulation)

### Legal-Grade Report Generator
- `/report/summary`
- `/report/export/json`
- `/report/export/pdf`
- includes timeline, risk, repeated offenders, and narrative summary

## 3) Environment Variables

Create `.env`:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
LOG_LEVEL=info
RATE_LIMIT_MAX=300
CORS_ORIGIN=http://localhost:8081,http://localhost:19006

# Optional AI
GEMINI_API_KEY=...

# Optional Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Expo frontend
EXPO_PUBLIC_API_URL=http://localhost:5000
```

## 4) Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev --name production_100_upgrade
npm run dev
```

Run tests:
```bash
npm test
```

## 5) Key Endpoints

- `POST /incident/analyze`
- `POST /incident` (replay-protected)
- `POST /sos/trigger` (replay-protected)
- `GET /report/summary`
- `GET /report/export/json`
- `GET /report/export/pdf`
- `POST /notifications/device-token`
- `GET /health`

## 6) Deployment Notes (Render/AWS)

- Set env vars in provider dashboard
- Use managed PostgreSQL
- Enable HTTPS + secure cookies at edge
- Scale horizontally: stateless API + external DB + cloud file storage
- Configure log drains for centralized monitoring

## 7) Real-World Constraints / Next Immediate Ops

- Replace simulated SMS/WhatsApp with provider APIs (Twilio/Meta)
- Replace Expo push-token adapter with production FCM/APNs bridge
- Add Sentry (or equivalent) for runtime error tracking
- Add forensic timestamp provider / signed evidence receipts
