const express = require('express');
const Trip = require('../models/Trip');
const User = require('../models/User');
const Photo = require('../models/Photo');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ───────────────────────────────────────────────────────────────────────────
//  PUBLIC ROUTE — no auth required
// ───────────────────────────────────────────────────────────────────────────

/**
 * GET /api/users/:username/profile
 * Week 3 — Public user profile.
 * Returns the user's name, username, bio, and all their trips.
 *
 * IMPORTANT: Only safe fields are returned — email, password, and other
 * sensitive fields are NEVER exposed. We use .select() to be explicit.
 */
router.get('/:username/profile', async (req, res) => {
  try {
    // Only select safe fields — never expose email, password, etc.
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .select('name username bio createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the user's trips — only return safe trip fields (no user ref needed
    // since we already have the user). Include coverImage for the grid.
    const trips = await Trip.find({ user: user._id })
      .sort({ startDate: -1, createdAt: -1 })
      .select('title destination startDate endDate description rating coverImage isPublic createdAt')
      .lean();

    // Compute photo count per trip (new URL-based + old Buffer-based)
    const tripsWithCounts = await Promise.all(
      trips.map(async (trip) => {
        const oldCount = await Photo.countDocuments({ trip: trip._id });
        const newCount = (trip.photos || []).length;
        return { ...trip, photoCount: newCount + oldCount };
      })
    );

    res.json({
      user: {
        name: user.name,
        username: user.username,
        bio: user.bio,
        joinedDate: user.createdAt,
      },
      trips: tripsWithCounts,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────────────────
//  PROTECTED ROUTES — login required
// ───────────────────────────────────────────────────────────────────────────

/**
 * PUT /api/users/profile
 * Week 3 — Update the logged-in user's bio or username.
 * Body: { bio?, username? }
 * Returns the updated user (safe fields only).
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { bio, username } = req.body;

    if (bio !== undefined) {
      if (bio.length > 300) {
        return res.status(400).json({ message: 'Bio must be 300 characters or fewer' });
      }
      user.bio = bio.trim();
    }

    if (username !== undefined && username.toLowerCase() !== user.username) {
      const newUsername = username.toLowerCase().trim();
      if (!/^[a-z0-9_]{3,20}$/.test(newUsername)) {
        return res.status(400).json({
          message: 'Username must be 3-20 chars (a-z, 0-9, _) only',
        });
      }
      const existing = await User.findOne({ username: newUsername });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(409).json({ message: 'Username is already taken' });
      }
      user.username = newUsername;
    }

    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
