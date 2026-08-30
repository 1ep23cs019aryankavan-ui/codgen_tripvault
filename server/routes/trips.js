const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Photo = require('../models/Photo');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Multer in-memory storage configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit per photo
});

/**
 * Optional authentication middleware:
 * Attaches req.user if a valid JWT is provided, otherwise continues anonymously.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // Invalid/expired token — proceed as unauthenticated/guest
    }
  }
  next();
}

router.use(optionalAuth);

// ───────────────────────────────────────────────────────────────────────────
//  PUBLIC ROUTES
// ───────────────────────────────────────────────────────────────────────────

/**
 * GET /api/trips/explore
 * Returns all public trips for the Explore feed.
 */
router.get('/explore', async (req, res) => {
  try {
    const trips = await Trip.find({ isPublic: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const result = await Promise.all(
      trips.map(async (trip) => {
        const photos = await Photo.find({ trip: trip._id })
          .sort({ createdAt: 1 })
          .lean();
        return {
          ...trip,
          photoCount: photos.length,
          coverPhotoId: photos[0] ? photos[0]._id : null,
        };
      })
    );

    res.json({ trips: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * GET /api/trips/:id
 * Returns a single trip by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Guard: Check if ID format is valid for MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Trip ID format' });
    }

    const trip = await Trip.findById(id).populate('user', 'name').lean();
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const isOwner = Boolean(req.user && trip.user && trip.user._id.toString() === req.user.id);
    if (!trip.isPublic && !isOwner) {
      return res.status(403).json({ message: 'This trip is private' });
    }

    const photos = await Photo.find({ trip: trip._id })
      .sort({ createdAt: 1 })
      .select('-image.data');

    res.json({
      trip: { ...trip, isOwner },
      photos,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * GET /api/trips/:id/photos/:photoId
 * Serves the raw image binary for a specific photo.
 */
router.get('/:id/photos/:photoId', async (req, res) => {
  try {
    const { id, photoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(photoId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const isOwner = Boolean(req.user && trip.user.toString() === req.user.id);
    if (!trip.isPublic && !isOwner) {
      return res.status(403).json({ message: 'This trip is private' });
    }

    const photo = await Photo.findById(photoId);
    if (!photo || photo.trip.toString() !== trip._id.toString()) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    res.set('Content-Type', photo.image.contentType);
    res.send(photo.image.data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────────────────
//  PROTECTED ROUTES (Authentication Required)
// ───────────────────────────────────────────────────────────────────────────

router.use(authMiddleware);

/**
 * GET /api/trips
 * Returns logged-in user's trips timeline.
 */
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user.id })
      .sort({ startDate: -1 })
      .lean();

    const result = await Promise.all(
      trips.map(async (trip) => {
        const photoCount = await Photo.countDocuments({ trip: trip._id });
        return { ...trip, photoCount };
      })
    );

    res.json({ trips: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * POST /api/trips
 * Create a new trip entry.
 */
router.post('/', async (req, res) => {
  const { title, destination, startDate, endDate, description, rating, isPublic } = req.body;

  if (!title || !destination) {
    return res.status(400).json({
      message: 'Title and destination are required',
    });
  }

  try {
    const trip = await Trip.create({
      user: req.user.id,
      title,
      destination,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      description: description || '',
      rating: rating || null,
      isPublic: isPublic || false,
    });

    res.status(201).json({ trip });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * PUT /api/trips/:id
 * Update an existing trip document.
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Trip ID format' });
    }

    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, destination, startDate, endDate, description, rating, isPublic } = req.body;
    if (title !== undefined) trip.title = title;
    if (destination !== undefined) trip.destination = destination;
    if (startDate !== undefined) trip.startDate = startDate;
    if (endDate !== undefined) trip.endDate = endDate;
    if (description !== undefined) trip.description = description;
    if (rating !== undefined) trip.rating = rating;
    if (isPublic !== undefined) trip.isPublic = isPublic;

    const updated = await trip.save();
    res.json({ trip: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * DELETE /api/trips/:id
 * Delete a trip and associated photos.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Trip ID format' });
    }

    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Photo.deleteMany({ trip: trip._id });
    await trip.deleteOne();

    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * POST /api/trips/:id/photos
 * Upload photo binaries to a trip.
 */
router.post('/:id/photos', upload.array('photos', 10), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Trip ID format' });
    }

    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No photos uploaded' });
    }

    let captions = [];
    if (req.body.captions) {
      try {
        captions = JSON.parse(req.body.captions);
      } catch {
        captions = [];
      }
    }

    const photos = await Promise.all(
      req.files.map((file, index) =>
        Photo.create({
          trip: trip._id,
          user: req.user.id,
          caption: captions[index] || '',
          image: {
            data: file.buffer,
            contentType: file.mimetype,
          },
        })
      )
    );

    res.status(201).json({
      message: `${photos.length} photo(s) uploaded`,
      photos: photos.map((p) => ({ _id: p._id, caption: p.caption })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * DELETE /api/trips/:id/photos/:photoId
 * Delete single photo from a trip.
 */
router.delete('/:id/photos/:photoId', async (req, res) => {
  try {
    const { id, photoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(photoId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const photo = await Photo.findById(photoId);
    if (!photo || photo.trip.toString() !== trip._id.toString()) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    await photo.deleteOne();
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
