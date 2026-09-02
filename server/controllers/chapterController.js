const asyncHandler = require('express-async-handler');
const Chapter = require('../models/Chapter');
const ChapterVersion = require('../models/ChapterVersion');
const Project = require('../models/Project');
const Critique = require('../models/Critique');
const ApiError = require('../utils/ApiError');

// @desc    Get one chapter (with author-note) by id
// @route   GET /api/chapters/:id
// @access  Public
const getChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id).populate({
    path: 'project',
    select: 'title slug author',
    populate: { path: 'author', select: 'username displayName avatarColor' },
  });
  if (!chapter) throw new ApiError(404, 'Chapter not found');
  res.json({ success: true, data: chapter });
});

// @desc    Add a chapter to a project (author only)
// @route   POST /api/projects/:projectId/chapters
// @access  Private
const createChapter = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) throw new ApiError(404, 'Project not found');
  if (String(project.author) !== String(req.user._id)) {
    throw new ApiError(403, 'Only the author can add chapters');
  }

  const { title, content, authorNote, status } = req.body;

  const chapter = await Chapter.create({
    project: project._id,
    title,
    content,
    authorNote: authorNote || '',
    status: status === 'published' ? 'published' : 'draft',
    order: project.chapterCount + 1,
  });

  await ChapterVersion.create({
    chapter: chapter._id,
    versionNumber: 1,
    title: chapter.title,
    content: chapter.content,
    wordCount: chapter.wordCount,
  });

  project.chapterCount += 1;
  project.totalWordCount += chapter.wordCount;
  await project.save();

  res.status(201).json({ success: true, data: chapter });
});

// @desc    Update a chapter — snapshots the previous content as a new version
// @route   PATCH /api/chapters/:id
// @access  Private
const updateChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);
  if (!chapter) throw new ApiError(404, 'Chapter not found');

  const project = await Project.findById(chapter.project);
  if (String(project.author) !== String(req.user._id)) {
    throw new ApiError(403, 'Only the author can edit this chapter');
  }

  const previousWordCount = chapter.wordCount;
  const { title, content, authorNote, status } = req.body;

  const contentChanged = content !== undefined && content !== chapter.content;

  if (title !== undefined) chapter.title = title;
  if (content !== undefined) chapter.content = content;
  if (authorNote !== undefined) chapter.authorNote = authorNote;
  if (status !== undefined) chapter.status = status;

  if (contentChanged) {
    chapter.currentVersion += 1;
  }
  await chapter.save();

  if (contentChanged) {
    await ChapterVersion.create({
      chapter: chapter._id,
      versionNumber: chapter.currentVersion,
      title: chapter.title,
      content: chapter.content,
      wordCount: chapter.wordCount,
    });
    project.totalWordCount += chapter.wordCount - previousWordCount;
    await project.save();
  }

  res.json({ success: true, data: chapter });
});

// @desc    Delete a chapter (author only)
// @route   DELETE /api/chapters/:id
// @access  Private
const deleteChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);
  if (!chapter) throw new ApiError(404, 'Chapter not found');

  const project = await Project.findById(chapter.project);
  if (String(project.author) !== String(req.user._id)) {
    throw new ApiError(403, 'Only the author can delete this chapter');
  }

  await Promise.all([
    Critique.deleteMany({ chapter: chapter._id }),
    ChapterVersion.deleteMany({ chapter: chapter._id }),
    chapter.deleteOne(),
  ]);

  project.chapterCount = Math.max(0, project.chapterCount - 1);
  project.totalWordCount = Math.max(0, project.totalWordCount - chapter.wordCount);
  await project.save();

  res.json({ success: true, message: 'Chapter deleted' });
});

// @desc    Get a chapter's revision history
// @route   GET /api/chapters/:id/versions
// @access  Private (author only)
const getChapterVersions = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);
  if (!chapter) throw new ApiError(404, 'Chapter not found');

  const project = await Project.findById(chapter.project);
  if (String(project.author) !== String(req.user._id)) {
    throw new ApiError(403, 'Only the author can view revision history');
  }

  const versions = await ChapterVersion.find({ chapter: chapter._id }).sort({ versionNumber: -1 });
  res.json({ success: true, data: versions });
});

module.exports = { getChapter, createChapter, updateChapter, deleteChapter, getChapterVersions };
