const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { getInsights } = require('../controllers/aiController');

router.get('/insights', auth, getInsights);

module.exports = router;
