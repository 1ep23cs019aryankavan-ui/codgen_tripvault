const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    // Store the image binary + content type in MongoDB.
    // This is serverless-friendly (no disk needed) and works on Vercel/Render.
    image: {
      data: { type: Buffer, required: true },
      contentType: { type: String, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Photo', photoSchema);
