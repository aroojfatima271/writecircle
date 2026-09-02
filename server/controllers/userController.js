const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const { publicUser } = require('./authController');

// @desc    Get a writer's public profile + their published projects
// @route   GET /api/users/:username
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) throw new ApiError(404, 'Writer not found');

  const projects = await Project.find({ author: user._id, status: { $ne: 'archived' } })
    .sort({ createdAt: -1 })
    .select('title slug synopsis genre status coverAccent chapterCount followerCount createdAt');

  res.json({ success: true, data: { profile: publicUser(user), projects } });
});

// @desc    Update the logged-in user's own profile
// @route   PATCH /api/users/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['displayName', 'bio', 'avatarColor', 'genres'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: publicUser(user) });
});

// @desc    Change password
// @route   PATCH /api/users/me/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters');
  }

  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await user.matchPassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.passwordHash = newPassword; // re-hashed by pre-save hook
  await user.save();

  res.json({ success: true, message: 'Password updated' });
});

module.exports = { getUserProfile, updateMe, changePassword };
