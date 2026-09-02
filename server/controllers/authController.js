const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');

const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  displayName: user.displayName,
  bio: user.bio,
  avatarColor: user.avatarColor,
  genres: user.genres,
  role: user.role,
  stats: user.stats,
  circles: user.circles,
  createdAt: user.createdAt,
});

// @desc    Register a new writer
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { username, email, displayName, password, bio, genres } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new ApiError(409, 'An account with that email or username already exists');
  }

  const user = await User.create({
    username,
    email,
    displayName,
    passwordHash: password, // hashed by the pre-save hook
    bio: bio || '',
    genres: genres || [],
  });

  res.status(201).json({
    success: true,
    data: publicUser(user),
    token: generateToken(user._id),
  });
});

// @desc    Log in
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (user.isBanned) {
    throw new ApiError(403, 'This account has been suspended');
  }

  res.json({
    success: true,
    data: publicUser(user),
    token: generateToken(user._id),
  });
});

// @desc    Get the logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: publicUser(req.user) });
});

module.exports = { register, login, getMe, publicUser };
