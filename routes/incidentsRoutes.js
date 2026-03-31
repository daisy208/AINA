const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { getNearbyIncidents } = require('../controllers/incidentController');

router.get('/nearby', auth, getNearbyIncidents);

module.exports = router;
