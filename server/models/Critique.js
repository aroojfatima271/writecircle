const mongoose = require('mongoose');

// A structured critique: category ratings plus optional inline
// line-comments anchored to a character offset in the chapter content.
const critiqueSchema = new mongoose.Schema(
  {
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: {
      plot: { type: Number, min: 1, max: 5, required: true },
      characters: { type: Number, min: 1, max: 5, required: true },
      pacing: { type: Number, min: 1, max: 5, required: true },
      prose: { type: Number, min: 1, max: 5, required: true },
    },
    overallComment: { type: String, required: true, maxlength: 2000 },
    lineComments: [
      {
        quote: { type: String, required: true, maxlength: 300 },
        comment: { type: String, required: true, maxlength: 500 },
        charStart: { type: Number },
      },
    ],
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

critiqueSchema.index({ chapter: 1, createdAt: -1 });
critiqueSchema.index({ chapter: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Critique', critiqueSchema);
