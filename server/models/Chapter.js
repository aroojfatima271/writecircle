const mongoose = require('mongoose');

// Each Chapter holds only the CURRENT content. Every save that changes
// the content pushes the previous version into ChapterVersion, giving
// writers a real revision history without bloating the hot document.
const chapterSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    content: { type: String, required: true },
    order: { type: Number, required: true },
    wordCount: { type: Number, default: 0 },
    currentVersion: { type: Number, default: 1 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    critiqueCount: { type: Number, default: 0 },
    authorNote: { type: String, maxlength: 400, default: '' },
  },
  { timestamps: true }
);

chapterSchema.index({ project: 1, order: 1 });

chapterSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    this.wordCount = this.content.trim().split(/\s+/).filter(Boolean).length;
  }
  next();
});

module.exports = mongoose.model('Chapter', chapterSchema);
