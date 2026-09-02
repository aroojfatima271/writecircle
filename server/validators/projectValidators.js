const { body } = require('express-validator');

const projectRules = [
  body('title').trim().isLength({ min: 1, max: 120 }).withMessage('Title is required (max 120 chars)'),
  body('synopsis').trim().isLength({ min: 20, max: 800 }).withMessage('Synopsis must be 20-800 characters'),
  body('genre').notEmpty().withMessage('Genre is required'),
];

const chapterRules = [
  body('title').trim().isLength({ min: 1, max: 120 }).withMessage('Chapter title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Chapter content cannot be empty'),
];

const critiqueRules = [
  body('ratings.plot').isInt({ min: 1, max: 5 }),
  body('ratings.characters').isInt({ min: 1, max: 5 }),
  body('ratings.pacing').isInt({ min: 1, max: 5 }),
  body('ratings.prose').isInt({ min: 1, max: 5 }),
  body('overallComment').trim().isLength({ min: 10, max: 2000 }).withMessage('Overall comment must be at least 10 characters'),
];

module.exports = { projectRules, chapterRules, critiqueRules };
