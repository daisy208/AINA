# Migration Guide: Legacy to Production Architecture

This guide helps understand the mapping between the old structure and the new production-ready modular architecture.

## File Structure Mapping

### Auth Module
```
OLD                              NEW
controllers/authController.js -> src/modules/auth/authController.ts
services/authService.js       -> src/modules/auth/authService.ts
routes/authRoutes.js          -> src/modules/auth/authRoutes.ts
```

### Incidents Module
```
OLD                                    NEW
controllers/incidentController.js   -> src/modules/incidents/incidentController.ts
services/aiService.js               -> src/modules/ai/aiService.ts
routes/incidentRoutes.js            -> src/modules/incidents/incidentRoutes.ts
lib/geo.js                          -> src/lib/geo.ts
```

### SOS Module
```
OLD                              NEW
controllers/sosController.js  -> src/modules/sos/sosController.ts
services/sosService.js        -> src/modules/sos/sosService.ts
routes/sosRoutes.js           -> src/modules/sos/sosRoutes.ts
```

### Notifications Module
```
OLD                                         NEW
controllers/notificationController.js    -> src/modules/notifications/notificationController.ts
services/notificationService.js          -> src/modules/notifications/notificationService.ts
routes/notificationRoutes.js             -> src/modules/notifications/notificationRoutes.ts
```

### Reports Module
```
OLD                                   NEW
controllers/reportController.js    -> src/modules/reports/reportController.ts
services/legalReportService.js     -> src/modules/reports/reportService.ts
routes/reportRoutes.js             -> src/modules/reports/reportRoutes.ts
```

### Shared Infrastructure
```
OLD                              NEW
middleware/authMiddleware.js  -> src/middleware/authMiddleware.ts
middleware/errorMiddleware.js -> src/middleware/errorHandler.ts
middleware/validate.js        -> src/middleware/validationMiddleware.ts
middleware/securityMiddleware.js -> src/middleware/securityMiddleware.ts
utils/asyncHandler.js         -> src/utils/asyncHandler.ts
services/logger.js            -> src/config/logger.ts
config/env.js                 -> src/config/env.ts
app.js                        -> src/app.ts
server.js                     -> src/server.ts
```

## Import Pattern Changes

### OLD STYLE (JavaScript)
```javascript
const authController = require('./controllers/authController');
const logger = require('./services/logger');
const prisma = require('@prisma/client').PrismaClient;
```

### NEW STYLE (TypeScript)
```typescript
import * as authController from './modules/auth/authController';
import logger from './config/logger';
import prisma from './lib/prisma';
```

## API Compatibility

All API endpoints remain backward compatible. The HTTP interface is unchanged.

### Authentication Endpoints
```
/api/v1/auth/register        ✓ Same
/api/v1/auth/login           ✓ Same
/api/v1/auth/refresh         ✓ Same
/api/v1/auth/profile         ✓ Same
/api/v1/auth/logout          ✓ Same
```

### Incident Endpoints
```
/api/v1/incidents            ✓ Same
/api/v1/incidents/:id        ✓ Same
/api/v1/incidents/nearby      ✓ Same
/api/v1/incidents/:id/insights ✓ Improved
/api/v1/incidents/hotspots    ✓ New
```

### SOS Endpoints
```
/api/v1/sos                  ✓ Same
/api/v1/sos/:id              ✓ Same
/api/v1/sos/:id/resolve      ✓ Improved
```

## Service Layer Pattern

### OLD APPROACH
```javascript
// Mixed concerns in controller
app.post('/incidents', async (req, res) => {
  // Direct database access
  // Business logic
  // Response formatting
});
```

### NEW APPROACH
```typescript
// Clean separation of concerns

// Service: Pure business logic
async function createIncident(userId: string, payload: CreateIncidentPayload) {
  // Business logic only
  // Database operations
  // Returns domain objects
}

// Controller: Request handling
export const createIncident = asyncHandler(async (req, res) => {
  const incident = await incidentService.createIncident(req.user!.id, req.body);
  res.status(201).json({ success: true, data: incident });
});

// Routes: Route definition
router.post('/', validate({ body: schema }), controller.createIncident);
```

## Database Changes

### Migration Strategy

1. **Backup existing database**
   ```bash
   pg_dump aina > backup.sql
   ```

2. **Run Prisma migrations**
   ```bash
   npm run prisma:migrate
   ```

3. **Verify schema**
   ```bash
   npx prisma db push
   ```

### New Models Added
- `Location` - Stores geospatial data
- `Alert` - Real-time incident alerts
- `SOS` - Emergency records
- `Notification` - Push notifications
- `Report` - Generated reports

### Enhanced Models
- `User` - Added firstName, lastName, phoneNumber, profileImage, status
- `Incident` - Added severity, category, status, locationId, riskScore
- All models - Added updatedAt for better audit trails

## Testing Migration

### OLD STYLE
```javascript
const request = require('supertest');
const app = require('./app');

test('should register user', (done) => {
  request(app)
    .post('/auth/register')
    .send({ email: 'test@test.com', password: 'password' })
    .end((err, res) => {
      expect(res.status).toBe(201);
      done();
    });
});
```

### NEW STYLE
```typescript
import request from 'supertest';
import { createApp } from '../src/app';

describe('Auth Module', () => {
  const app = createApp();
  
  it('should register user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@test.com', password: 'password' });
    
    expect(response.status).toBe(201);
  });
});
```

## Configuration Migration

### Environment Variables

The configuration is now validated with Zod at startup for type safety.

```typescript
// OLD: Manual checks
if (!process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET');
}

// NEW: Automatic validation
const env = getEnv(); // Validated at startup
```

## Error Handling Migration

### OLD STYLE
```javascript
throw new Error('User not found');
// Generic error, no proper status code
```

### NEW STYLE
```typescript
throw new NotFoundError('User');
// Proper AppError subclass, status code 404
```

## Middleware Order

### OLD SETUP
```javascript
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(errorHandler);
```

### NEW SETUP
```typescript
// Security first
app.use(securityHeaders);      // Helmet
app.use(cors());               // CORS
app.use(express.json());       // Body parsing
app.use(sanitizeInput);        // Input sanitization
app.use(createRateLimiter()); // Rate limiting
app.use(errorHandler);         // Error handling
```

## Validation Changes

### OLD STYLE (Manual validation)
```javascript
app.post('/incidents', (req, res) => {
  if (!req.body.type) {
    return res.status(400).json({ error: 'type required' });
  }
  if (!req.body.evidenceHash) {
    return res.status(400).json({ error: 'evidenceHash required' });
  }
  // ...
});
```

### NEW STYLE (Joi schemas)
```typescript
const schema = Joi.object({
  type: Joi.string().required(),
  evidenceHash: Joi.string().required(),
  // ...
});

router.post(
  '/',
  validate({ body: schema }),
  incidentController.createIncident
);
```

## Logging Migration

### OLD STYLE
```javascript
console.log('Incident created:', incident);
console.error('Error:', error);
```

### NEW STYLE
```typescript
logger.info('incident_created', { incidentId: incident.id });
logger.error('incident_creation_failed', { error: error.message });
```

**Benefits:**
- Structured JSON logs
- Consistent format
- Better searchability
- Environment-aware
- Log level control

## Dependency Injection Pattern

The new architecture supports easier testing through service functions:

```typescript
// Easy to mock in tests
const incidentService = {
  createIncident: jest.fn(),
  getIncident: jest.fn(),
};

// Works with real implementation
const incident = await incidentService.createIncident(userId, payload);
```

## Performance Improvements

1. **Geospatial Indexes** - O(1) nearby queries
2. **Connection Pooling** - Better database efficiency
3. **Selective Field Loading** - Only load needed data
4. **Request Compression** - Smaller responses
5. **Rate Limiting** - Prevent abuse

## Breaking Changes

**None** - The API is fully backward compatible. Internal implementation changed, but all endpoints, request/response formats remain the same.

## Deployment Checklist

- [ ] Install new dependencies: `npm install`
- [ ] Generate Prisma client: `npm run prisma:generate`
- [ ] Back up database
- [ ] Run migrations: `npm run prisma:migrate`
- [ ] Set environment variables
- [ ] Run tests: `npm test`
- [ ] Build: `npm run build`
- [ ] Start server: `npm start`
- [ ] Verify health endpoint: `curl http://localhost:5000/health`
- [ ] Check API endpoints work

## Rollback Plan

If issues occur:

```bash
# Stop the new version
# Restore database from backup
psql aina < backup.sql

# Use old code
git checkout main

# Restart with old version
npm install
npm start
```

## FAQ

**Q: Do I need to change client code?**
A: No, the API is 100% backward compatible.

**Q: What about existing data?**
A: Database migrations handle schema updates automatically.

**Q: How do I test locally?**
A: `npm run dev` with a local PostgreSQL database.

**Q: Is TypeScript required?**
A: Yes, but the compiled JavaScript runs on any Node.js version 18+.

**Q: Can I use parts of the old code?**
A: Services are compatible. Controllers should use new pattern for consistency.

## Support

See [ARCHITECTURE_UPGRADE.md](./ARCHITECTURE_UPGRADE.md) for more details.
