const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { replayProtection } = require('../middleware/securityMiddleware');
const validate = require('../middleware/validate');
const { incidentSchema, incidentAnalyzeSchema } = require('../validations/schemas');
const { createIncident, getIncidents, getIncidentById, analyzeIncident } = require('../controllers/incidentController');

router.post('/analyze', auth, validate(incidentAnalyzeSchema), analyzeIncident);
router.post('/', auth, replayProtection, validate(incidentSchema), createIncident);
router.get('/', auth, getIncidents);
router.get('/:id', auth, getIncidentById);

module.exports = router;
