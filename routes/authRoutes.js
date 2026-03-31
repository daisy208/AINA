const router = require('express').Router();
const validate = require('../middleware/validate');
const { authRegisterSchema, authLoginSchema } = require('../validations/schemas');
const { register, login } = require('../controllers/authController');

router.post('/register', validate(authRegisterSchema), register);
router.post('/login', validate(authLoginSchema), login);

module.exports = router;
