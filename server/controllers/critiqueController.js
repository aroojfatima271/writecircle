const asyncHandler = require('express-async-handler');
const Critique = require('../models/Critique');
const Chapter = require('../models/Chapter');
const Project = require('../models/Project');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { createNotification } = require('../services/notificationService');

// @desc    List critiques for a chapter, newest first
// @route   GET /api/chapters/:chapterId/critiques
// @access  Public
const getCritiques = asyncHandler(async (req, res) => {
  const critiques = await Critique.find({ chapter: req.params.chapterId })
    .sort({ createdAt: -1 })
    .populate('reviewer', 'username displayName avatarColor');
  res.json({ success: true, data: critiques });
});

// @desc    Submit a structured critique on a chapter
// @route   POST /api/chapters/:chapterId/critiques
// @access  Private
const createCritique = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.chapterId);
  if (!chapter) throw new ApiError(404, 'Chapter not found');

  const project = await Project.findById(chapter.project);
  if (String(project.author) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot critique your own chapter');
  }

  const alreadyReviewed = await Critique.findOne({ chapter: chapter._id, reviewer: req.user._id });
  if (alreadyReviewed) {
    throw new ApiError(409, 'You have already critiqued this chapter');
  }

  const { ratings, overallComment, lineComments } = req.body;

  const critique = await Critique.create({
    chapter: chapter._id,
    project: project._id,
    reviewer: req.user._id,
    ratings,
    overallComment,
    lineComments: lineComments || [],
  });
  await critique.populate('reviewer', 'username displayName avatarColor');

  chapter.critiqueCount += 1;
  await chapter.save();

  await Promise.all([
    User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.critiquesGiven': 1 } }),
    User.findByIdAndUpdate(project.author, { $inc: { 'stats.critiquesReceived': 1 } }),
    createNotification({
      recipient: project.author,
      actor: req.user._id,
      type: 'new_critique',
      message: `${req.user.displayName} left a critique on "${chapter.title}"`,
      link: `/projects/${project.slug}/chapters/${chapter._id}`,
    }),
  ]);

  res.status(201).json({ success: true, data: critique });
});

// @desc    Mark a critique as helpful (toggle)
// @route   POST /api/critiques/:id/helpful
// @access  Private
const toggleHelpful = asyncHandler(async (req, res) => {
  const critique = await Critique.findById(req.params.id);
  if (!critique) throw new ApiError(404, 'Critique not found');

  const alreadyVoted = critique.helpfulVotes.some((v) => String(v) === String(req.user._id));
  if (alreadyVoted) {
    critique.helpfulVotes = critique.helpfulVotes.filter((v) => String(v) !== String(req.user._id));
  } else {
    critique.helpfulVotes.push(req.user._id);
  }
  await critique.save();

  res.json({ success: true, helpfulCount: critique.helpfulVotes.length, marked: !alreadyVoted });
});

module.exports = { getCritiques, createCritique, toggleHelpful };
