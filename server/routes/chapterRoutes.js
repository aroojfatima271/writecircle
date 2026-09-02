const express = require('express');
const router = express.Router();
const { getChapter, updateChapter, deleteChapter, getChapterVersions } = require('../controllers/chapterController');
const { getCritiques, createCritique } = require('../controllers/critiqueController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { critiqueRules } = require('../validators/projectValidators');

router.get('/:id', getChapter);
router.patch('/:id', protect, updateChapter);
router.delete('/:id', protect, deleteChapter);
router.get('/:id/versions', protect, getChapterVersions);
router.get('/:chapterId/critiques', getCritiques);
router.post('/:chapterId/critiques', protect, critiqueRules, validate, createCritique);

module.exports = router;
