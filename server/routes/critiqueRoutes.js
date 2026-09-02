const express = require('express');
const router = express.Router();
const { toggleHelpful } = require('../controllers/critiqueController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:id/helpful', protect, toggleHelpful);

module.exports = router;
