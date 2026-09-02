const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const Circle = require('../models/Circle');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// @desc    List circles with search + pagination
// @route   GET /api/circles?search=&page=&limit=
// @access  Public
const getCircles = asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 12 } = req.query;
  const query = search ? { $text: { $search: search } } : {};

  const [circles, total] = await Promise.all([
    Circle.find(query)
      .sort({ memberCount: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('createdBy', 'username displayName avatarColor'),
    Circle.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: circles,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get one circle by slug
// @route   GET /api/circles/:slug
// @access  Public
const getCircleBySlug = asyncHandler(async (req, res) => {
  const circle = await Circle.findOne({ slug: req.params.slug })
    .populate('createdBy', 'username displayName avatarColor')
    .populate('members.user', 'username displayName avatarColor');
  if (!circle) throw new ApiError(404, 'Circle not found');
  res.json({ success: true, data: circle });
});

// @desc    Create a circle
// @route   POST /api/circles
// @access  Private
const createCircle = asyncHandler(async (req, res) => {
  const { name, description, genreFocus, isPrivate, coverAccent } = req.body;
  if (!name || !description) throw new ApiError(400, 'Name and description are required');

  const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now().toString(36);

  const circle = await Circle.create({
    name,
    slug,
    description,
    genreFocus,
    isPrivate: !!isPrivate,
    coverAccent,
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: 'moderator' }],
  });

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { circles: circle._id } });

  res.status(201).json({ success: true, data: circle });
});

// @desc    Join a circle
// @route   POST /api/circles/:id/join
// @access  Private
const joinCircle = asyncHandler(async (req, res) => {
  const circle = await Circle.findById(req.params.id);
  if (!circle) throw new ApiError(404, 'Circle not found');

  const alreadyMember = circle.members.some((m) => String(m.user) === String(req.user._id));
  if (alreadyMember) throw new ApiError(409, 'Already a member of this circle');

  circle.members.push({ user: req.user._id });
  circle.memberCount = circle.members.length;
  await circle.save();

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { circles: circle._id } });

  res.json({ success: true, data: circle });
});

// @desc    Leave a circle
// @route   POST /api/circles/:id/leave
// @access  Private
const leaveCircle = asyncHandler(async (req, res) => {
  const circle = await Circle.findById(req.params.id);
  if (!circle) throw new ApiError(404, 'Circle not found');

  if (String(circle.createdBy) === String(req.user._id)) {
    throw new ApiError(400, 'Circle founders cannot leave their own circle');
  }

  circle.members = circle.members.filter((m) => String(m.user) !== String(req.user._id));
  circle.memberCount = circle.members.length;
  await circle.save();

  await User.findByIdAndUpdate(req.user._id, { $pull: { circles: circle._id } });

  res.json({ success: true, data: circle });
});

module.exports = { getCircles, getCircleBySlug, createCircle, joinCircle, leaveCircle };
