const mongoose = require('mongoose');

const chapterVersionSchema = new mongoose.Schema(
  {
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
    versionNumber: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    wordCount: { type: Number, default: 0 },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

chapterVersionSchema.index({ chapter: 1, versionNumber: -1 });

module.exports = mongoose.model('ChapterVersion', chapterVersionSchema);
