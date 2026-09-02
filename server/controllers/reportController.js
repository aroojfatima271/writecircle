const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');
const ApiError = require('../utils/ApiError');

// @desc    File a report against a project/chapter/critique/comment/user
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason } = req.body;
  if (!targetType || !targetId || !reason || !reason.trim()) {
    throw new ApiError(400, 'targetType, targetId, and reason are required');
  }

  const report = await Report.create({
    reporter: req.user._id,
    targetType,
    targetId,
    reason,
  });

  res.status(201).json({ success: true, data: report });
});

module.exports = { createReport };
