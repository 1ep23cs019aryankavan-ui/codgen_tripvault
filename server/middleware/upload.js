/**
 * ───────────────────────────────────────────────────────────────────────────
 *  TripVault — Upload Middleware (Week 3)
 * ───────────────────────────────────────────────────────────────────────────
 *  Accepts multipart/form-data image uploads and returns a URL string.
 *
 *  Two modes:
 *    1. Cloudinary mode — when CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
 *       and CLOUDINARY_API_SECRET are all set in .env, files are uploaded
 *       to Cloudinary and the Cloudinary URL is stored.
 *    2. Fallback (data-URL) mode — when Cloudinary credentials are NOT set
 *       (e.g. local dev / sandbox), files are read into memory and converted
 *       to base64 data URLs so the app still works end-to-end.
 *
 *  Both modes store the resulting URL string in the Trip's `photos` array
 *  (and optionally `coverImage`), exactly as the Week 3 spec requires.
 * ───────────────────────────────────────────────────────────────────────────
 */
const multer = require('multer');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per photo

// ── Detect Cloudinary configuration ───────────────────────────────────────
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const hasCloudinary = cloudName && apiKey && apiSecret;

let cloudinary = null;
let cloudinaryStorage = null;

if (hasCloudinary) {
  // Lazy-load Cloudinary SDK only when configured
  cloudinary = require('cloudinary').v2;
  cloudinaryStorage = require('multer-storage-cloudinary').cloudinaryStorage;

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

/**
 * Build the multer upload middleware.
 *   - Cloudinary mode: uses cloudinaryStorage, returns files with `path` (URL)
 *   - Fallback mode:   uses memoryStorage, we convert buffer → data URL later
 */
function createUpload() {
  if (hasCloudinary) {
    const storage = cloudinaryStorage({
      cloudinary,
      params: {
        folder: 'tripvault',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 1200, crop: 'limit' }], // max 1200px wide
      },
    });
    return multer({ storage, limits: { fileSize: MAX_FILE_SIZE } });
  }

  // Fallback — memory storage (sandbox / local dev without Cloudinary)
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
  });
}

const upload = createUpload();

/**
 * Convert a multer file object into a URL string.
 *   - Cloudinary mode: file.path is the Cloudinary URL
 *   - Fallback mode:   file.buffer is converted to a base64 data URL
 */
function fileToUrl(file) {
  if (!file) return '';
  if (hasCloudinary && file.path) return file.path;
  if (file.buffer) {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }
  return '';
}

module.exports = { upload, fileToUrl, hasCloudinary };
