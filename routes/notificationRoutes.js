const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const validate = require('../middleware/validate');
const { deviceTokenSchema } = require('../validations/schemas');
const { registerDeviceToken } = require('../controllers/notificationController');

router.post('/device-token', auth, validate(deviceTokenSchema), registerDeviceToken);

module.exports = router;
