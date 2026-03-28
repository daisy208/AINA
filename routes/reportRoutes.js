const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { getSummary, exportJsonReport, exportPdfReport } = require('../controllers/reportController');

router.get('/summary', auth, getSummary);
router.get('/export/json', auth, exportJsonReport);
router.get('/export/pdf', auth, exportPdfReport);

module.exports = router;
