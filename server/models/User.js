const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    bio: {
      type: String,
      maxlength: 300,
      default: '',
    },
    avatarColor: {
      // Used to render a generated initials-avatar client-side; keeps
      // the project free of file-upload/storage infrastructure while
      // still giving every writer a distinct visual identity.
      type: String,
      default: '#7A2E3B',
    },
    genres: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: ['writer', 'admin'],
      default: 'writer',
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    stats: {
      wordsWritten: { type: Number, default: 0 },
      critiquesGiven: { type: Number, default: 0 },
      critiquesReceived: { type: Number, default: 0 },
    },
    circles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Circle',
      },
    ],
  },
  { timestamps: true }
);

userSchema.index({ username: 'text', displayName: 'text' });

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
