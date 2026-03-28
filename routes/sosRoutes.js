const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { replayProtection } = require('../middleware/securityMiddleware');
const validate = require('../middleware/validate');
const { sosSchema } = require('../validations/schemas');
const { triggerSOS } = require('../controllers/sosController');

router.post('/trigger', auth, replayProtection, validate(sosSchema), triggerSOS);

module.exports = router;
