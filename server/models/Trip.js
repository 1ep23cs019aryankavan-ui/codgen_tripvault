const mongoose = require('mongoose');

// ── TripVault Trip Schema ──────────────────────────────────────────────────
// Fields:
//   title, destination, startDate, endDate, description, rating, user
//   coverImage  — String (Cloudinary URL or data URL) — Week 3
//   photos     — Array of Strings (Cloudinary URLs)   — Week 3
//   isPublic   — Boolean toggle for the Explore feed  — Week 4
const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    description: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Week 3 — Photo Uploads: a single cover image URL (Cloudinary or data URL)
    coverImage: {
      type: String,
      default: '',
    },
    // Week 3 — Photo Uploads: array of photo URLs
    photos: {
      type: [String],
      default: [],
    },
    // Week 4 — Share & Discover: toggle a trip's visibility
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
