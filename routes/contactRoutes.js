const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const validate = require('../middleware/validate');
const { contactSchema } = require('../validations/schemas');
const { addContact, getContacts } = require('../controllers/contactController');

router.post('/', auth, validate(contactSchema), addContact);
router.get('/', auth, getContacts);

module.exports = router;
