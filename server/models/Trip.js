const mongoose = require('mongoose');

// Week 2 — Trip Management (CRUD)
// Schema follows the Week 2 task specification exactly:
//   title, destination, startDate, endDate, description, rating, user
// `isPublic` is added for Week 4 (Share & Discover) and is optional.
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
    // Week 4 — Share & Discover: toggle a trip's visibility
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
