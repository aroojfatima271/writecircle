const express = require('express');
const router = express.Router();
const { getStats, listUsers, toggleBanUser, listReports, resolveReport } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', listUsers);
router.patch('/users/:id/ban', toggleBanUser);
router.get('/reports', listReports);
router.patch('/reports/:id', resolveReport);

module.exports = router;
