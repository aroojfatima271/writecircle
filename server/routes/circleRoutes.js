const express = require('express');
const router = express.Router();
const { getCircles, getCircleBySlug, createCircle, joinCircle, leaveCircle } = require('../controllers/circleController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getCircles);
router.post('/', protect, createCircle);
router.get('/:slug', getCircleBySlug);
router.post('/:id/join', protect, joinCircle);
router.post('/:id/leave', protect, leaveCircle);

module.exports = router;
