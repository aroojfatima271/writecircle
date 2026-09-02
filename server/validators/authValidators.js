const { body } = require('express-validator');

const registerRules = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 24 })
    .withMessage('Username must be 3-24 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('displayName').trim().isLength({ min: 1, max: 40 }).withMessage('Display name is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerRules, loginRules };
