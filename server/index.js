require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const tripsRoutes = require('./routes/trips');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────
// Configured CORS to allow both local development and your Vercel deployment
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL, // Dynamically pulled from environment variables
  'codgen-tripvault-2jl507lks-1ep23cs019-4210s-projects.vercel.app', 
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Alternatively set to callback(new Error('Not allowed by CORS')) for strict checking
      }
    },
    credentials: true,
  })
);

app.use(express.json()); // parse JSON request bodies

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);

// Simple health-check route
app.get('/', (req, res) => {
  res.json({ message: 'TripVault API is running 🗺️' });
});

// ── Start server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set. Add it to your .env file.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set. Add it to your .env file.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 TripVault server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
