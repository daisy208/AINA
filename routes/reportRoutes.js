const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { getSummary } = require('../controllers/reportController');

router.get('/summary', auth, getSummary);

module.exports = router;