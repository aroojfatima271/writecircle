const express = require('express');
const router = express.Router();
const {
  getProjects, getProjectBySlug, createProject, updateProject, deleteProject,
  toggleFollow, getProjectComments, addProjectComment,
} = require('../controllers/projectController');
const { createChapter } = require('../controllers/chapterController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { projectRules, chapterRules } = require('../validators/projectValidators');

router.get('/', getProjects);
router.post('/', protect, projectRules, validate, createProject);
router.get('/:slug', getProjectBySlug);
router.patch('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/follow', protect, toggleFollow);
router.get('/:id/comments', getProjectComments);
router.post('/:id/comments', protect, addProjectComment);
router.post('/:projectId/chapters', protect, chapterRules, validate, createChapter);

module.exports = router;
