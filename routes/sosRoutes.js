const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { triggerSOS } = require('../controllers/sosController');

router.post('/trigger', auth, triggerSOS);

module.exports = router;