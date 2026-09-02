const express = require('express');
const router = express.Router();
const { getUserProfile, updateMe, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.patch('/me', protect, updateMe);
router.patch('/me/password', protect, changePassword);
router.get('/:username', getUserProfile);

module.exports = router;
