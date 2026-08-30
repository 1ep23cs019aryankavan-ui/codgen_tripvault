# 🗺️ TripVault

**A travel memory journal where every journey deserves to be remembered.**

TripVault lets travelers log trips, attach photos, rate their experiences, and share memories with the world. Built with the MERN stack — MongoDB · Express · React (Vite) · Node.js — it ships with JWT authentication, full trip CRUD, drag-and-drop Cloudinary photo uploads, public user profiles, a global Explore feed, and a polished, fully responsive UI.

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
| **Loading States** | Skeleton placeholders and spinners on all data-fetching pages (Dashboard, Trips, Trip detail, Explore) |
| **Toast Notifications** | Success/error toasts for login, register, trip CRUD, photo uploads, and profile edits (sonner / react-hot-toast) |
| **Empty States** | Friendly messages + CTAs when trips, photos, or public feeds are empty |
| **Responsive UI** | Tailwind CSS with a custom emerald/amber palette; mobile-first layouts tested down to 375px |
| **Hamburger Menu** | Collapsible mobile nav with accessible aria attributes |
| **Footer** | Sticky footer with app name and GitHub link on every authenticated page |
| **Protected Routes** | React Router v6 with a `ProtectedRoute` wrapper and ownership checks server-side |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | **React 18** (Vite), React Router v6, Axios, Tailwind CSS, react-hot-toast |
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
│   │   │   ├── Navbar.jsx       ← Logo + nav + hamburger menu + logout
│   │   │   ├── Footer.jsx       ← Sticky footer with GitHub link
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── TripForm.jsx     ← Trip create/edit form + photo upload
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx     ← Now collects a username
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Trips.jsx        ← Personal trip list
│   │   │   ├── TripDetail.jsx   ← Single trip + photo gallery
│   │   │   ├── Explore.jsx      ← Public trip discovery feed
│   │   │   ├── Profile.jsx      ← Public profile at /profile/:username
│   │   │   └── EditProfile.jsx  ← Update bio + username
│   │   ├── App.jsx              ← Router + Toaster + Layout
│   │   └── index.css
│   ├── vite.config.js           ← Proxies /api → localhost:5000
│   └── tailwind.config.js
│
├── server/                      ← Node + Express backend
│   ├── models/
│   │   ├── User.js              ← bcrypt pre-save hook + username + bio
│   │   ├── Trip.js              ← title, destination, dates, description, rating, coverImage, photos[], isPublic
│   │   └── Photo.js             ← image Buffer + contentType (legacy)
│   ├── routes/
│   │   ├── auth.js              ← /api/auth/*
│   │   ├── trips.js             ← /api/trips/* + upload + photo endpoints
│   │   └── users.js             ← /api/users/* (public profile + edit profile)
│   ├── middleware/
│   │   ├── authMiddleware.js    ← Verifies Bearer JWT
│   │   └── upload.js            ← Cloudinary storage with dev fallback
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
- Optional: a **Cloudinary** account for production photo storage (the app falls back to data-URL storage without it)

### 1. Set up the backend (`/server`)

```bash
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
#   Edit .env and add your MONGO_URI, JWT_SECRET, and (optional) Cloudinary keys

# Start the server (runs on http://localhost:5000)
npm run dev
```

Your `server/.env` should look like:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/tripvault
JWT_SECRET=replace-with-a-strong-random-string
PORT=5000

# Optional — leave blank to use local data-URL fallback for photos
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
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
| `POST` | `/api/auth/register` | — | Create a user (requires name, username, email, password), returns JWT |
| `POST` | `/api/auth/login` | — | Validate credentials, returns JWT |
| `GET` | `/api/auth/me` | 🔒 | Get the authenticated user's profile |

### Trips — `/api/trips`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/trips/explore` | optional | All public trips (for the Explore feed) |
| `GET` | `/api/trips/:id` | optional | Single trip — public OR owned by requester |
| `GET` | `/api/trips` | 🔒 | List the logged-in user's trips |
| `POST` | `/api/trips` | 🔒 | Create a new trip |
| `PUT` | `/api/trips/:id` | 🔒 | Update a trip (owner only) |
| `DELETE` | `/api/trips/:id` | 🔒 | Delete a trip + its photos (owner only) |
| `POST` | `/api/trips/:id/upload` | 🔒 | Upload a photo (multipart/form-data, field `image`) — stores Cloudinary URL, auto-sets coverImage |
| `DELETE` | `/api/trips/:id/photo/:index` | 🔒 | Delete a single photo by index (owner only) |

### Users — `/api/users`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/users/:username/profile` | — | Public profile — name, username, bio, joined date, all trips (email/password NEVER exposed) |
| `PUT` | `/api/users/profile` | 🔒 | Update bio and username (owner only) |

### Trip Schema

| Field | Type | Notes |
|-------|------|-------|
| `title` | String | Required |
| `destination` | String | Required |
| `startDate` | Date | Optional |
| `endDate` | Date | Optional |
| `description` | String | Optional, default `''` |
| `rating` | Number | 1–5, default `null` |
| `coverImage` | String | Cloudinary URL (or data-URL in dev), auto-set from first photo |
| `photos` | Array of String | Cloudinary URLs |
| `user` | ObjectId (ref User) | Required, set server-side from JWT |
| `isPublic` | Boolean | Default `false` |
| `createdAt` / `updatedAt` | Date | Auto-managed by Mongoose timestamps |

### User Schema

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `username` | String | Unique, 3–20 chars, `a-z0-9_` |
| `email` | String | Unique, required |
| `password` | String | Hashed with bcrypt, `select: false` |
| `bio` | String | Max 300 chars, default `''` |
| `createdAt` / `updatedAt` | Date | Auto-managed |

---

## 📸 Photo Upload Details

Photos are uploaded directly inside the **Log a new trip** form (no separate step required):

- **Drag-and-drop** zone — drop image files anywhere onto the highlighted area
- **File picker** — click the zone to open the native file dialog (on mobile this opens the camera/gallery)
- **Live previews** — thumbnail grid with per-photo remove buttons
- **Validation** — image-only, ≤5MB per file, ≤10 photos per trip
- **Storage** — in production, files are uploaded to **Cloudinary** and the URL is stored in `trip.photos[]`; in development (without Cloudinary credentials), files are converted to base64 data-URLs so the app still works end-to-end
- **Cover images** — the first uploaded photo auto-becomes the trip's `coverImage`; displayed on cards, detail hero, Explore, and profile grids

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
| `/profile/:username` | `Profile` (public) | — |
| `/edit-profile` | `EditProfile` | 🔒 |

---

## 📱 Responsive Design

The entire UI is mobile-first and tested down to **375px** width (iPhone SE):

- **Dashboard** stats stack into a single column, then 2, then 3 at `sm`/`lg`
- **Trip cards** stack vertically on mobile; horizontal layouts wrap gracefully
- **Photo grids** show 2 columns on mobile, 3 on `sm+`
- **Navbar** collapses into a hamburger menu on mobile (`< 640px`)
- **Forms** use full-width inputs with stacked date fields on mobile
- **Trip detail** header wraps title above edit/delete buttons on mobile
- No horizontal scrolling at any breakpoint

---

## 🎨 UI Polish

Week 4 polish deliverables:

- **Loading states** — skeleton placeholders (gray pulsing cards) on Trips and Explore; centered spinners on Trip detail, Profile, and Dashboard while data loads
- **Toast notifications** — `react-hot-toast` for success/error feedback on every key action (login, register, trip CRUD, photo upload, profile edit)
- **Empty states** — friendly messages with CTAs when trips/photos/public feeds are empty
- **Consistent styling** — uniform `rounded-xl` cards, `shadow-sm`, emerald/amber palette throughout
- **Sticky footer** — app name + GitHub link, sticks to viewport bottom on short pages, pushed down naturally on long pages

---

## ☁️ Deployment

The app is ready for deployment to **Render** (backend) and **Vercel** (frontend):

### Backend → Render
1. Push your code to GitHub
2. On [Render](https://render.com), create a new **Web Service** → connect your GitHub repo
3. Set **Root Directory** to `server`
4. Set **Start Command** to `node index.js`
5. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Frontend → Vercel
1. On [Vercel](https://vercel.com), **Import** your GitHub repo
2. Set **Root Directory** to `client`
3. Add environment variable `VITE_API_URL` pointing to your Render backend URL (e.g. `https://tripvault-api.onrender.com`)
4. Deploy and test the live URL end-to-end

### MongoDB Atlas
- Under **Network Access**, allow connections from anywhere (`0.0.0.0/0`) for the deployed app to connect

---

## 🔒 Security Notes

- ✅ Passwords are **hashed with bcrypt** (10 salt rounds) — never stored in plain text
- ✅ The password field is `select: false` in the schema — never returned by default
- ✅ Authentication is **stateless JWT** (7-day expiry), verified via `authMiddleware.js`
- ✅ Every mutating trip/photo route verifies **ownership** before allowing changes
- ✅ Public profile route uses `.select()` to **never expose email or password**
- ✅ Login returns a **generic error** ("Invalid credentials") to prevent email enumeration
- ✅ `.env` is gitignored — secrets never reach GitHub
- ⚠️ The JWT is stored in `localStorage` per the brief. For production, consider `httpOnly` cookies
- ⚠️ Image uploads are validated by type and size, but consider adding virus scanning for production scale

---

## 🗺️ Roadmap

| Week | Feature | Status |
|------|---------|--------|
| **1** | Project setup & JWT authentication | ✅ Complete |
| **2** | Trip CRUD (destinations, dates, description, ratings) | ✅ Complete |
| **3** | Photo uploads (Cloudinary) & public user profiles | ✅ Complete |
| **4** | UI polish, responsive design & deployment readiness | ✅ Complete |

---

## 📦 Packages Used

**Backend** (`server/package.json`)
- `express` — web server framework
- `mongoose` — MongoDB ODM
- `bcryptjs` — password hashing
- `jsonwebtoken` — JWT creation and verification
- `multer` — multipart/form-data file uploads
- `multer-storage-cloudinary` — Cloudinary storage engine
- `cloudinary` — Cloudinary SDK
- `dotenv` — environment variables
- `cors` — allow frontend to talk to backend
- `nodemon` *(dev)* — auto-restart on file changes

**Frontend** (`client/package.json`)
- `react` + `react-dom` — UI library
- `react-router-dom` — page routing
- `axios` — HTTP requests to the backend
- `react-hot-toast` — toast notifications
- `vite` — build tool and dev server
- `tailwindcss` + `autoprefixer` + `postcss` — styling

---

## 🧪 Quick Start (TL;DR)

```bash
# 1. Backend
cd server && npm install
cp .env.example .env   # add MONGO_URI + JWT_SECRET (+ optional Cloudinary keys)
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

**TripVault** — A MERN-stack travel memory journal

Built with Express · MongoDB · React (Vite) · Cloudinary

*Every journey deserves to be remembered.*

</div>
