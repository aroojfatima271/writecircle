const mongoose = require('mongoose');

// A "Project" is a writer's story/manuscript. Chapters belong to a Project.
const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    synopsis: { type: String, required: true, maxlength: 800 },
    genre: {
      type: String,
      required: true,
      enum: [
        'Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Thriller',
        'Literary Fiction', 'Horror', 'Historical Fiction', 'Young Adult',
        'Poetry', 'Non-Fiction', 'Other',
      ],
    },
    tags: { type: [String], default: [] },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    circle: { type: mongoose.Schema.Types.ObjectId, ref: 'Circle', default: null },
    status: {
      type: String,
      enum: ['drafting', 'seeking-feedback', 'completed', 'archived'],
      default: 'drafting',
    },
    coverAccent: { type: String, default: '#7A2E3B' },
    chapterCount: { type: Number, default: 0 },
    totalWordCount: { type: Number, default: 0 },
    followerCount: { type: Number, default: 0 },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

projectSchema.index({ title: 'text', synopsis: 'text', tags: 'text' });
projectSchema.index({ genre: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
