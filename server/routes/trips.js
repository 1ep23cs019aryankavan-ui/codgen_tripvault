const express = require('express');
const jwt = require('jsonwebtoken');
const Trip = require('../models/Trip');
const Photo = require('../models/Photo');
const authMiddleware = require('../middleware/authMiddleware');
const { upload, fileToUrl, hasCloudinary } = require('../middleware/upload');

const router = express.Router();

/**
 * Optional auth — if a valid token is present, set req.user.
 * If not, continue as anonymous. Used for public trip/photo viewing.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // invalid token — treat as anonymous
    }
  }
  next();
}

router.use(optionalAuth);

// ───────────────────────────────────────────────────────────────────────────
//  PUBLIC ROUTES (no login required)
// ───────────────────────────────────────────────────────────────────────────

/**
 * GET /api/trips/explore
 * Returns all public trips for the Explore feed.
 * Includes coverImage, photos array, and photoCount.
 */
router.get('/explore', async (req, res) => {
  try {
    const trips = await Trip.find({ isPublic: true })
      .populate('user', 'name username')
      .sort({ createdAt: -1 })
      .lean();

    const result = await Promise.all(
      trips.map(async (trip) => {
        const oldPhotoCount = await Photo.countDocuments({ trip: trip._id });
        const newPhotoCount = (trip.photos || []).length;
        return {
          ...trip,
          photoCount: newPhotoCount + oldPhotoCount,
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
 * Returns a single trip. Accessible if public OR owned by the requester.
 */
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('user', 'name username').lean();
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const isOwner = req.user && trip.user._id.toString() === req.user.id;
    if (!trip.isPublic && !isOwner) {
      return res.status(403).json({ message: 'This trip is private' });
    }

    // New photos (URLs in the photos array) + old Buffer-based photos
    const oldPhotos = await Photo.find({ trip: trip._id })
      .sort({ createdAt: 1 })
      .select('-image.data');

    res.json({
      trip: { ...trip, isOwner },
      photos: oldPhotos,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * GET /api/trips/:id/photos/:photoId
 * Serves the raw image binary for a photo (old Buffer-based Photo model).
 */
router.get('/:id/photos/:photoId', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const isOwner = req.user && trip.user.toString() === req.user.id;
    if (!trip.isPublic && !isOwner) {
      return res.status(403).json({ message: 'This trip is private' });
    }

    const photo = await Photo.findById(req.params.photoId);
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
//  PROTECTED ROUTES (login required)
// ───────────────────────────────────────────────────────────────────────────

router.use(authMiddleware);

/**
 * GET /api/trips
 * Returns the logged-in user's trips (personal timeline).
 */
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user.id })
      .sort({ startDate: -1 })
      .lean();

    const result = await Promise.all(
      trips.map(async (trip) => {
        const oldPhotoCount = await Photo.countDocuments({ trip: trip._id });
        const newPhotoCount = (trip.photos || []).length;
        return { ...trip, photoCount: newPhotoCount + oldPhotoCount };
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
 * Body: { title, destination, startDate, endDate, description, rating, isPublic, coverImage, photos }
 */
router.post('/', async (req, res) => {
  const { title, destination, startDate, endDate, description, rating, isPublic, coverImage, photos } = req.body;

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
      coverImage: coverImage || '',
      photos: Array.isArray(photos) ? photos : [],
    });

    res.status(201).json({ trip });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * PUT /api/trips/:id
 * Update a trip (title, destination, dates, description, rating, isPublic, coverImage, photos).
 * Ownership is verified before saving.
 */
router.put('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, destination, startDate, endDate, description, rating, isPublic, coverImage, photos } = req.body;
    if (title !== undefined) trip.title = title;
    if (destination !== undefined) trip.destination = destination;
    if (startDate !== undefined) trip.startDate = startDate;
    if (endDate !== undefined) trip.endDate = endDate;
    if (description !== undefined) trip.description = description;
    if (rating !== undefined) trip.rating = rating;
    if (isPublic !== undefined) trip.isPublic = isPublic;
    if (coverImage !== undefined) trip.coverImage = coverImage;
    if (photos !== undefined) trip.photos = photos;

    const updated = await trip.save();
    res.json({ trip: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * DELETE /api/trips/:id
 * Delete a trip and all its photos.
 */
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
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
 * POST /api/trips/:id/upload  ← Week 3 main upload route
 * Upload a photo via multipart/form-data (field name: "image").
 * The file is uploaded to Cloudinary (or converted to a data URL in fallback
 * mode) and its URL is appended to the trip's `photos` array.
 *
 * Optional body field:
 *   makeCover = "true" → also set this photo as the trip's coverImage
 *
 * Response: { message, photoUrl, coverImage, photos }
 */
router.post('/:id/upload', upload.single('image'), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided (field name must be "image")' });
    }

    // Get the URL — Cloudinary URL in production, data URL in fallback mode
    const photoUrl = fileToUrl(req.file);

    // Append to the trip's photos array
    trip.photos = [...(trip.photos || []), photoUrl];

    // Set as cover if it's the first photo, or if makeCover was requested
    const makeCover = req.body.makeCover === 'true' || !trip.coverImage;
    if (makeCover) {
      trip.coverImage = photoUrl;
    }

    await trip.save();

    res.status(201).json({
      message: 'Photo uploaded',
      photoUrl,
      coverImage: trip.coverImage,
      photos: trip.photos,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * DELETE /api/trips/:id/photo/:index  ← Week 3 URL-based photo deletion
 * Remove a photo URL from the trip's photos array by index.
 * (Singular "photo" path avoids conflict with the legacy
 *  DELETE /:id/photos/:photoId Buffer-based route.)
 */
router.delete('/:id/photo/:index', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || idx < 0 || idx >= trip.photos.length) {
      return res.status(404).json({ message: 'Photo index out of range' });
    }

    const removedUrl = trip.photos[idx];
    trip.photos.splice(idx, 1);

    // If the removed photo was the cover, pick a new cover
    if (trip.coverImage === removedUrl) {
      trip.coverImage = trip.photos[0] || '';
    }

    await trip.save();
    res.json({ message: 'Photo removed', photos: trip.photos, coverImage: trip.coverImage });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
