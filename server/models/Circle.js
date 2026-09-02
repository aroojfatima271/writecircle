const mongoose = require('mongoose');

// A "Circle" is a themed writing group (e.g. "Fantasy Worldbuilders",
// "Flash Fiction Weekly"). Projects can optionally belong to a circle,
// and circle membership gates who can post/critique inside it when private.
const circleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true, maxlength: 500 },
    genreFocus: { type: String, trim: true, default: 'General' },
    isPrivate: { type: Boolean, default: false },
    coverAccent: { type: String, default: '#3F6656' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['member', 'moderator'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    memberCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

circleSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Circle', circleSchema);
