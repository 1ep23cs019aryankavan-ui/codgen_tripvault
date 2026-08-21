# 🗺️ TripVault

**A travel memory journal where every journey deserves to be remembered.**

TripVault lets travelers log trips, attach photos, rate their experiences, and share memories with the world. Built with the MERN stack — MongoDB · Express · React (Vite) · Node.js — it ships with JWT authentication, full trip CRUD, drag-and-drop photo uploads, and a public Explore feed.

> Built as part of the TripVault Virtual Internship Program (CodGen) — all 4 weeks complete.

---

## ✨ Features

| Area | Details |
|------|---------|
| **Authentication** | Register, login, protected dashboard — JWT-based, bcrypt-hashed passwords |
| **Trip CRUD** | Create, read, update, delete trips with title, destination, dates, description, and a 1–5 star rating |
| **Star Ratings** | Interactive 5-star selector in the form; ratings shown on cards, detail, and Explore |
| **Photo Uploads** | Drag-and-drop **or** file picker (PC + phone); uploads to **Cloudinary** in production, falls back to data-URL storage in dev; ≤5MB each, ≤10 per trip |
| **Cover Images** | First uploaded photo auto-becomes the trip's cover; displayed on cards, detail hero, Explore, and profile grids |
| **Photo Galleries** | Thumbnail previews, removable before submit; full gallery on the trip detail page |
| **Public Profiles** | Every user gets a public profile at `/profile/:username` — shows name, bio, and all trips; **no login required** to view |
| **Edit Profile** | Users can update their bio and username from the dashboard |
| **Share & Discover** | Toggle a trip public → it appears in the global Explore feed for other travelers |
| **Responsive UI** | Tailwind CSS with a custom emerald/amber palette; mobile-first layouts |
| **Protected Routes** | React Router v6 with a `ProtectedRoute` wrapper and ownership checks server-side |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | **React 18** (Vite), React Router v6, Axios, Tailwind CSS |
| Backend | **Node.js**, **Express** |
| Database | **MongoDB** (Atlas or local) via **Mongoose** |
| Auth | **bcryptjs** (password hashing) + **jsonwebtoken** (stateless JWT, 7-day expiry) |
| File Uploads | **Multer** + **multer-storage-cloudinary** — uploads to Cloudinary in production; falls back to base64 data-URL storage when Cloudinary credentials aren't set |
| Security | dotenv, CORS, ownership-scoped routes, `.select()` to hide sensitive fields on public routes |

---

## 📁 Folder Structure

```
tripvault/
├── client/                      ← React (Vite) frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── TripForm.jsx     ← Trip create/edit form + photo upload
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Trips.jsx        ← Personal trip list
│   │   │   ├── TripDetail.jsx   ← Single trip + photo gallery
│   │   │   └── Explore.jsx      ← Public trip discovery feed
│   │   ├── App.jsx              ← Router
│   │   └── index.css
│   ├── vite.config.js           ← Proxies /api → localhost:5000
│   └── tailwind.config.js
│
├── server/                      ← Node + Express backend
│   ├── models/
│   │   ├── User.js              ← bcrypt pre-save hook + matchPassword
│   │   ├── Trip.js              ← title, destination, dates, description, rating, isPublic
│   │   └── Photo.js             ← image Buffer + contentType
│   ├── routes/
│   │   ├── auth.js              ← /api/auth/*
│   │   └── trips.js             ← /api/trips/* + photo endpoints
│   ├── middleware/
│   │   └── authMiddleware.js    ← Verifies Bearer JWT
│   ├── .env.example
│   └── index.js                 ← Express entry point (port 5000)
│
└── README.md
```

---

## 🚀 Local Development

### Prerequisites

- **Node.js 18+** and npm
- A **MongoDB** instance — either [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier) or a local `mongod`

### 1. Set up the backend (`/server`)

```bash
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
#   Edit .env and add your MONGO_URI and JWT_SECRET

# Start the server (runs on http://localhost:5000)
npm run dev
```

Your `server/.env` should look like:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/tripvault
JWT_SECRET=replace-with-a-strong-random-string
PORT=5000
```

> 💡 Generate a strong JWT secret with: `openssl rand -base64 32`

### 2. Set up the frontend (`/client`)

```bash
cd client

# Install dependencies
npm install

# Start the dev server (runs on http://localhost:5173)
npm run dev
```

The Vite dev server proxies `/api/*` requests to `http://localhost:5000` automatically (see `vite.config.js`).

### 3. Open the app

Visit **http://localhost:5173** → register an account → log in → start logging trips.

---

## 📡 API Reference

All routes respond with JSON. Protected routes require header:
`Authorization: Bearer <token>`

### Auth — `/api/auth`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/register` | — | Create a user, returns JWT |
| `POST` | `/api/auth/login` | — | Validate credentials, returns JWT |
| `GET` | `/api/auth/me` | 🔒 | Get the authenticated user's profile |

**Register example:**
```jsonc
// POST /api/auth/register
{ "name": "Alex Wanderer", "email": "alex@example.com", "password": "secret123" }

// 201 Created
{ "token": "eyJhbGciOi...",
  "user": { "id": "...", "name": "Alex Wanderer", "email": "alex@example.com" } }
```

### Trips — `/api/trips`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/trips/explore` | optional | All public trips (for the Explore feed) |
| `GET` | `/api/trips/:id` | optional | Single trip — public OR owned by requester |
| `GET` | `/api/trips/:id/photos/:photoId` | optional | Raw image binary for a photo |
| `GET` | `/api/trips` | 🔒 | List the logged-in user's trips |
| `POST` | `/api/trips` | 🔒 | Create a new trip |
| `PUT` | `/api/trips/:id` | 🔒 | Update a trip (owner only) |
| `DELETE` | `/api/trips/:id` | 🔒 | Delete a trip + its photos (owner only) |
| `POST` | `/api/trips/:id/photos` | 🔒 | Upload photos (multipart/form-data, field `photos`) |
| `DELETE` | `/api/trips/:id/photos/:photoId` | 🔒 | Delete a single photo (owner only) |

**Create a trip:**
```jsonc
// POST /api/trips
{ "title": "Summer in the Alps",
  "destination": "Switzerland",
  "startDate": "2024-07-01",
  "endDate": "2024-07-14",
  "description": "Unforgettable hike above the clouds.",
  "rating": 5,
  "isPublic": true }

// 201 Created
{ "trip": { "_id": "...", "title": "...", "rating": 5, ... } }
```

**Upload photos:**
```bash
# multipart/form-data — field name must be "photos"
curl -X POST http://localhost:5000/api/trips/<tripId>/photos \
  -H "Authorization: Bearer <token>" \
  -F "photos=@mountains.jpg" \
  -F "photos=@lake.jpg"
```

### Trip Schema

| Field | Type | Notes |
|-------|------|-------|
| `title` | String | Required |
| `destination` | String | Required |
| `startDate` | Date | Optional |
| `endDate` | Date | Optional |
| `description` | String | Optional, default `''` |
| `rating` | Number | 1–5, default `null` |
| `user` | ObjectId (ref User) | Required, set server-side from JWT |
| `isPublic` | Boolean | Default `false` |
| `createdAt` / `updatedAt` | Date | Auto-managed by Mongoose timestamps |

---

## 📸 Photo Upload Details

Photos are uploaded directly inside the **Log a new trip** form (no separate step required):

- **Drag-and-drop** zone — drop image files anywhere onto the highlighted area
- **File picker** — click the zone to open the native file dialog (on mobile this opens the camera/gallery)
- **Live previews** — thumbnail grid with per-photo remove buttons
- **Validation** — image-only, ≤5MB per file, ≤10 photos per trip
- **Storage** — Multer reads files into memory, then they're stored as a `Buffer` in the `Photo` collection (serverless-friendly — no disk needed)
- **Serving** — `GET /api/trips/:id/photos/:photoId` streams the raw binary with the correct `Content-Type`

---

## 🌐 Frontend Routes

| Path | Component | Protected? |
|------|-----------|-----------|
| `/` | Redirect → `/dashboard` or `/login` | — |
| `/login` | `Login` | — |
| `/register` | `Register` | — |
| `/dashboard` | `Dashboard` | 🔒 |
| `/trips` | `Trips` (personal list) | 🔒 |
| `/trips/:id` | `TripDetail` (+ photo gallery) | 🔒 |
| `/explore` | `Explore` (public feed) | — |

---

## 🔒 Security Notes

- ✅ Passwords are **hashed with bcrypt** (10 salt rounds) — never stored in plain text.
- ✅ The password field is `select: false` in the schema — never returned by default.
- ✅ Authentication is **stateless JWT** (7-day expiry), verified via `authMiddleware.js`.
- ✅ Every mutating trip/photo route verifies **ownership** before allowing changes.
- ✅ Login returns a **generic error** ("Invalid credentials") to prevent email enumeration.
- ✅ `.env` is gitignored — secrets never reach GitHub.
- ⚠️ The JWT is stored in `localStorage` per the brief. For production, consider `httpOnly` cookies.
- ⚠️ Image uploads are validated by type and size, but consider adding virus scanning / S3-backed storage for production scale.

---

## 🗺️ Roadmap

| Week | Feature | Status |
|------|---------|--------|
| **1** | Project setup & JWT authentication | ✅ Complete |
| **2** | Trip CRUD (destinations, dates, description, ratings) | ✅ Complete |
| **3** | Photo uploads & galleries (drag-and-drop + file picker) | ✅ Complete |
| **4** | Share trips & discover others' memories (Explore feed) | ✅ Complete |

---

## 📦 Packages Used

**Backend** (`server/package.json`)
- `express` — web server framework
- `mongoose` — MongoDB ODM
- `bcryptjs` — password hashing
- `jsonwebtoken` — JWT creation and verification
- `multer` — multipart/form-data file uploads (memory storage)
- `dotenv` — environment variables
- `cors` — allow frontend to talk to backend
- `nodemon` *(dev)* — auto-restart on file changes

**Frontend** (`client/package.json`)
- `react` + `react-dom` — UI library
- `react-router-dom` — page routing
- `axios` — HTTP requests to the backend
- `vite` — build tool and dev server
- `tailwindcss` + `autoprefixer` + `postcss` — styling

---

## 🧪 Quick Start (TL;DR)

```bash
# 1. Backend
cd server && npm install
cp .env.example .env   # add MONGO_URI + JWT_SECRET
npm run dev            # → http://localhost:5000

# 2. Frontend (new terminal)
cd client && npm install
npm run dev            # → http://localhost:5173

# 3. Open http://localhost:5173, register, and start logging trips!
```

---

## 📄 License

This project is part of the TripVault Virtual Internship Program by CodGen.

---

<div align="center">

**TripVault** — Virtual Internship · CodGen · Weeks 1–4 Complete

Built with the MERN stack · Express + MongoDB + React (Vite)

*Every journey deserves to be remembered.*

</div>
