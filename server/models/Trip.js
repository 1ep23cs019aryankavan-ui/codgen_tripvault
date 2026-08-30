const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const auth = require('../middleware/auth');

// GET /api/trips - Fetch user's trips
router.get('/', auth, async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user.id })
      .populate('photos')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    console.error('Error fetching trips:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/trips/:id - Fetch single trip by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format before querying DB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Trip ID format' });
    }

    const trip = await Trip.findById(id).populate('photos');

    // Handle missing trip document
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check ownership or public accessibility
    if (trip.user.toString() !== req.user.id && !trip.isPublic) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(trip);
  } catch (err) {
    console.error('Error fetching trip:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/trips - Create new trip
router.post('/', auth, async (req, res) => {
  try {
    const { title, destination, startDate, endDate, description, rating, isPublic } = req.body;

    if (!title || !destination) {
      return res.status(400).json({ message: 'Title and destination are required' });
    }

    const newTrip = new Trip({
      title,
      destination,
      startDate,
      endDate,
      description,
      rating,
      isPublic,
      user: req.user.id,
    });

    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (err) {
    console.error('Error creating trip:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/trips/:id - Update existing trip
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Trip ID format' });
    }

    let trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    trip = await Trip.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    res.json(trip);
  } catch (err) {
    console.error('Error updating trip:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/trips/:id - Delete trip
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Trip ID format' });
    }

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await trip.deleteOne();
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    console.error('Error deleting trip:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
