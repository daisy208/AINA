const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { createIncident, getIncidents } = require('../controllers/incidentController');

router.post('/', auth, createIncident);
router.get('/', auth, getIncidents);

module.exports = router;