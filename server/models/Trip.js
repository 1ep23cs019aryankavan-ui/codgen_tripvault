const mongoose = require('mongoose');

// Sub-schema for photos directly stored/referenced within a trip
const photoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
    },
    caption: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

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
      validate: {
        validator: function (value) {
          // Validate that endDate is on or after startDate
          if (!value || !this.startDate) return true;
          return value >= this.startDate;
        },
        message: 'End date must be equal to or after start date',
      },
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
      index: true, // Speeds up queries for fetching user-specific trips
    },
    // Photos associated with this trip
    photos: [photoSchema],

    // Week 4 — Share & Discover: toggle a trip's visibility
    isPublic: {
      type: Boolean,
      default: false,
      index: true, // Speeds up queries for public exploration feed
    },
  },
  { timestamps: true }
);

// Compound index for querying public trips sorted by creation date
tripSchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('Trip', tripSchema);
