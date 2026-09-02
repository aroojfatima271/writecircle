const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get the logged-in user's notifications (most recent 30)
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('actor', 'username displayName avatarColor');

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

  res.json({ success: true, data: notifications, unreadCount });
});

// @desc    Mark one notification read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markRead = asyncHandler(async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, recipient: req.user._id },
    { $set: { read: true } }
  );
  res.json({ success: true });
});

// @desc    Mark all notifications read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { $set: { read: true } });
  res.json({ success: true });
});

module.exports = { getNotifications, markRead, markAllRead };
