const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Project = require('../models/Project');
const Circle = require('../models/Circle');
const Critique = require('../models/Critique');
const Report = require('../models/Report');
const ApiError = require('../utils/ApiError');
const { createNotification } = require('../services/notificationService');

// @desc    Platform-wide stats for the admin dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
  const [userCount, projectCount, circleCount, critiqueCount, openReports, bannedCount] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Circle.countDocuments(),
    Critique.countDocuments(),
    Report.countDocuments({ status: 'open' }),
    User.countDocuments({ isBanned: true }),
  ]);

  const genreBreakdown = await Project.aggregate([
    { $group: { _id: '$genre', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json({
    success: true,
    data: { userCount, projectCount, circleCount, critiqueCount, openReports, bannedCount, genreBreakdown },
  });
});

// @desc    List users with search + pagination, for moderation
// @route   GET /api/admin/users?search=&page=&limit=
// @access  Private/Admin
const listUsers = asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 20 } = req.query;
  const query = search
    ? { $or: [{ username: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
    : {};

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('-passwordHash'),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Ban / unban a user
// @route   PATCH /api/admin/users/:id/ban
// @access  Private/Admin
const toggleBanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'admin') throw new ApiError(400, 'Cannot ban another admin');

  user.isBanned = !user.isBanned;
  await user.save();

  res.json({ success: true, isBanned: user.isBanned });
});

// @desc    List reports for moderation
// @route   GET /api/admin/reports?status=
// @access  Private/Admin
const listReports = asyncHandler(async (req, res) => {
  const { status = 'open' } = req.query;
  const reports = await Report.find({ status })
    .sort({ createdAt: -1 })
    .populate('reporter', 'username displayName')
    .populate('resolvedBy', 'username displayName');
  res.json({ success: true, data: reports });
});

// @desc    Resolve or dismiss a report
// @route   PATCH /api/admin/reports/:id
// @access  Private/Admin
const resolveReport = asyncHandler(async (req, res) => {
  const { status, resolutionNote } = req.body;
  if (!['resolved', 'dismissed'].includes(status)) {
    throw new ApiError(400, 'status must be "resolved" or "dismissed"');
  }

  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Report not found');

  report.status = status;
  report.resolvedBy = req.user._id;
  report.resolutionNote = resolutionNote || '';
  await report.save();

  await createNotification({
    recipient: report.reporter,
    actor: req.user._id,
    type: 'report_resolved',
    message: `Your report was ${status} by a moderator`,
    link: '',
  });

  res.json({ success: true, data: report });
});

module.exports = { getStats, listUsers, toggleBanUser, listReports, resolveReport };
