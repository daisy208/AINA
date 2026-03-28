const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { addContact, getContacts } = require('../controllers/contactController');

router.post('/', auth, addContact);
router.get('/', auth, getContacts);

module.exports = router;