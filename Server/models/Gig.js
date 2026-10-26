
const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000
    },
    budget: {
      type: Number,
      required: true,
      min: 0
    },
    skills: {
      type: [{
        type: String,
        trim: true,
        maxlength: 40
      }],
      default: [],
      validate: {
        validator: skills =>
          skills.length <= 20 &&
          skills.every(skill => skill.length > 0),
        message: 'A gig can have up to 20 non-empty skills.'
      }
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Supports browsing and sorting gigs by status and creation date.
gigSchema.index({ status: 1, createdAt: -1 });

// Supports filtering a client's gigs.
gigSchema.index({ postedBy: 1, createdAt: -1 });

module.exports = mongoose.model('Gig', gigSchema);
