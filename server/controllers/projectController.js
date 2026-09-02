const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const Project = require('../models/Project');
const Chapter = require('../models/Chapter');
const Critique = require('../models/Critique');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');
const { createNotification } = require('../services/notificationService');

// @desc    Explore projects — search, filter by genre/status, sort, paginate
// @route   GET /api/projects?search=&genre=&status=&circle=&sort=&page=&limit=
// @access  Public
const getProjects = asyncHandler(async (req, res) => {
  const { search = '', genre, status, circle, sort = 'newest', page = 1, limit = 12 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (genre) query.genre = genre;
  if (status) query.status = status;
  if (circle) query.circle = circle;
  if (!status) query.status = { $ne: 'archived' };

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    'most-followed': { followerCount: -1 },
    'most-chapters': { chapterCount: -1 },
  };

  const [projects, total] = await Promise.all([
    Project.find(query)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('author', 'username displayName avatarColor')
      .populate('circle', 'name slug'),
    Project.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: projects,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get a single project + its chapters
// @route   GET /api/projects/:slug
// @access  Public
const getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug })
    .populate('author', 'username displayName avatarColor bio')
    .populate('circle', 'name slug');
  if (!project) throw new ApiError(404, 'Project not found');

  const chapters = await Chapter.find({ project: project._id, status: 'published' })
    .sort({ order: 1 })
    .select('title order wordCount critiqueCount status createdAt updatedAt');

  res.json({ success: true, data: { project, chapters } });
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  const { title, synopsis, genre, tags, circle, coverAccent } = req.body;

  const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now().toString(36);

  const project = await Project.create({
    title,
    slug,
    synopsis,
    genre,
    tags: tags || [],
    circle: circle || null,
    coverAccent,
    author: req.user._id,
  });

  res.status(201).json({ success: true, data: project });
});

// @desc    Update a project (author only)
// @route   PATCH /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  if (String(project.author) !== String(req.user._id)) {
    throw new ApiError(403, 'Only the author can edit this project');
  }

  const allowed = ['title', 'synopsis', 'genre', 'tags', 'status', 'coverAccent'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) project[field] = req.body[field];
  });
  await project.save();

  res.json({ success: true, data: project });
});

// @desc    Delete a project (author only) — cascades chapters, critiques, comments
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  if (String(project.author) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to delete this project');
  }

  const chapters = await Chapter.find({ project: project._id }).select('_id');
  const chapterIds = chapters.map((c) => c._id);

  await Promise.all([
    Chapter.deleteMany({ project: project._id }),
    Critique.deleteMany({ chapter: { $in: chapterIds } }),
    Comment.deleteMany({ project: project._id }),
    project.deleteOne(),
  ]);

  res.json({ success: true, message: 'Project and all related content deleted' });
});

// @desc    Follow / unfollow a project
// @route   POST /api/projects/:id/follow
// @access  Private
const toggleFollow = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  const isFollowing = project.followers.some((f) => String(f) === String(req.user._id));
  if (isFollowing) {
    project.followers = project.followers.filter((f) => String(f) !== String(req.user._id));
  } else {
    project.followers.push(req.user._id);
  }
  project.followerCount = project.followers.length;
  await project.save();

  res.json({ success: true, following: !isFollowing, followerCount: project.followerCount });
});

// @desc    List comments on a project
// @route   GET /api/projects/:id/comments
// @access  Public
const getProjectComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ project: req.params.id })
    .sort({ createdAt: -1 })
    .populate('author', 'username displayName avatarColor');
  res.json({ success: true, data: comments });
});

// @desc    Add a comment to a project
// @route   POST /api/projects/:id/comments
// @access  Private
const addProjectComment = asyncHandler(async (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim()) throw new ApiError(400, 'Comment cannot be empty');

  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  const comment = await Comment.create({ project: project._id, author: req.user._id, body });
  await comment.populate('author', 'username displayName avatarColor');

  await createNotification({
    recipient: project.author,
    actor: req.user._id,
    type: 'new_comment',
    message: `${req.user.displayName} commented on "${project.title}"`,
    link: `/projects/${project.slug}`,
  });

  res.status(201).json({ success: true, data: comment });
});

module.exports = {
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  toggleFollow,
  getProjectComments,
  addProjectComment,
};
