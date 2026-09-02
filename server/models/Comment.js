const mongoose = require('mongoose');

// Lightweight discussion comments on a project (not a chapter critique) —
// e.g. general encouragement, questions about worldbuilding, etc.
const commentSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

commentSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
