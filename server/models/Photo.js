const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip reference is required'],
      index: true, // Speeds up queries when fetching all photos for a trip
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    caption: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, 'Caption cannot exceed 300 characters'],
    },
    // Storing image binary data + MIME type in MongoDB
    image: {
      data: {
        type: Buffer,
        required: [true, 'Image buffer data is required'],
      },
      contentType: {
        type: String,
        required: [true, 'Image MIME content type is required'],
      },
    },
  },
  {
    timestamps: true,
    // Avoid returning heavy Buffer data in default JSON conversions (e.g. res.json)
    toJSON: {
      transform: function (doc, ret) {
        if (ret.image) {
          delete ret.image.data; // Strips binary data from meta API responses
        }
        return ret;
      },
    },
  }
);

// Compound index for optimized lookup of a trip's photos by date
photoSchema.index({ trip: 1, createdAt: -1 });

module.exports = mongoose.model('Photo', photoSchema);
