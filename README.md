# 🗺️ TripVault

**A travel memory journal where every journey deserves to be remembered.**

TripVault lets users log trips, upload photos, and share memories. This repository contains the **Week 1** deliverable — a complete MERN-stack foundation with a working backend, connected database, and a fully functional JWT-based authentication system.

> Built as part of the TripVault Virtual Internship Program (CodGen) — Week 1 of 4.

---

## ✨ What's in Week 1

| Area | Details |
|------|---------|
| **Backend** | Express server on port 5000, connected to MongoDB Atlas |
| **Auth API** | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (protected) |
| **Security** | Passwords hashed with **bcrypt**, stateless **JWT** authentication |
| **Frontend** | Vite + React app with Login, Register, and Dashboard pages |
| **Routing** | React Router (`/`, `/login`, `/register`, `/dashboard`) with protected routes |
| **Auth Flow** | Register → Login → Dashboard works end to end in the browser |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | **React 18** (Vite), React Router, Axios, Tailwind CSS |
| Backend | **Node.js**, **Express** |
| Database | **MongoDB** (Atlas) via **Mongoose** |
| Auth | **bcryptjs** (password hashing) + **jsonwebtoken** (JWT) |
| Security | dotenv, cors |

---

## 📁 Folder Structure

```
tripvault/
├── client/              ← React (Vite) frontend
│   ├── src/
│   │   ├── pages/       ← Login.jsx, Register.jsx, Dashboard.jsx
│   │   ├── components/
│   │   └── App.jsx
├── server/              ← Node + Express backend
│   ├── models/          ← User.js (Mongoose schema)
│   ├── routes/          ← auth.js
│   ├── middleware/      ← authMiddleware.js
│   ├── .env             ← MONGO_URI, JWT_SECRET
│   └── index.js         ← Entry point
└── README.md
```

---

## 🚀 Local Development

### Prerequisites

- **Node.js 18+** and npm
- A **MongoDB Atlas** account (free tier) — [sign up here](https://www.mongodb.com/cloud/atlas)

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
JWT_SECRET=your-secret-key-here
PORT=5000
```

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

Visit **http://localhost:5173** → register an account → you'll be redirected to the dashboard.

---

## 📡 API Reference

All routes are under `/api/auth`. Responses are JSON.

### `POST /api/auth/register`
Creates a new user with a bcrypt-hashed password and returns a JWT.
```jsonc
// Request
{ "name": "Alex Wanderer", "email": "alex@example.com", "password": "secret123" }

// Response 201
{ "token": "eyJhbGciOi...",
  "user": { "id": "...", "name": "Alex Wanderer", "email": "alex@example.com" } }
```

### `POST /api/auth/login`
Validates credentials and returns a JWT.
```jsonc
// Request
{ "email": "alex@example.com", "password": "secret123" }

// Response 200
{ "token": "eyJhbGciOi...", "user": { "id": "...", "name": "Alex Wanderer", "email": "alex@example.com" } }
```

### `GET /api/auth/me` 🔒
Protected route — returns the authenticated user's info.
Requires header: `Authorization: Bearer <token>`

```jsonc
// Response 200
{ "user": { "_id": "...", "name": "Alex Wanderer", "email": "alex@example.com", "createdAt": "..." } }
```

---

## ▲ Deploying to Vercel

A MERN app has two parts that deploy separately: the **static frontend** and the **API backend**.

### Option A — Deploy the frontend to Vercel (recommended for the client)

1. Push your repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Set the **Root Directory** to `client`.
4. Vercel auto-detects Vite — no build config needed.
5. Add an environment variable `VITE_API_URL` pointing to your backend URL (e.g. `https://tripvault-api.onrender.com`).
6. Update `client/src/pages/Login.jsx`, `Register.jsx`, and `Dashboard.jsx` to use `VITE_API_URL` as the axios base URL:
   ```js
   const API = import.meta.env.VITE_API_URL || '';
   axios.post(`${API}/api/auth/login`, { ... })
   ```
7. Deploy.

### Option B — Deploy the backend (Express)

Vercel can run Express as serverless functions, but for a traditional Express server with MongoDB, we recommend deploying to a platform that supports long-running Node processes:

| Platform | Free tier | Notes |
|----------|-----------|-------|
| **Render** | ✅ | Easiest — connects to your GitHub repo, runs `npm start` in `server/` |
| **Railway** | ✅ | Similar to Render, great DX |
| **Vercel** | ✅ | Requires restructuring to `/api` serverless functions |

**Deploying the backend to Render (recommended):**
1. Go to [render.com](https://render.com) → New → Web Service.
2. Connect your GitHub repo.
3. Set **Root Directory** to `server`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT=5000`
7. Deploy — you'll get a URL like `https://tripvault-api.onrender.com`.

### Option C — Deploy the backend to Vercel as serverless functions

If you want everything on Vercel, restructure the server into Vercel's `/api` format:

1. Move `server/index.js` logic into individual files in `/api/auth/`:
   ```
   api/auth/register.js
   api/auth/login.js
   api/auth/me.js
   ```
2. Each file exports a serverless function:
   ```js
   import express from 'express';
   import mongoose from 'mongoose';
   // ... setup
   export default function handler(req, res) { /* ... */ }
   ```
3. Add `vercel.json` at the repo root to route `/api/*` to these functions.
4. Set environment variables (`MONGO_URI`, `JWT_SECRET`) in Vercel project settings.

> See the [Vercel Express guide](https://vercel.com/guides/using-express-with-vercel) for details.

---

## 🔒 Security Notes

- ✅ Passwords are **hashed with bcrypt** (10 salt rounds) — never stored in plain text.
- ✅ Authentication is **stateless JWT** (7-day expiry).
- ✅ The `/api/auth/me` route validates the JWT via `authMiddleware.js` on every request.
- ✅ Login returns a **generic error** ("Invalid credentials") to prevent email enumeration.
- ✅ `.env` is gitignored — secrets never reach GitHub.
- ⚠️ The JWT is stored in `localStorage` (per the Week 1 brief). For production, consider `httpOnly` cookies.

---

## 🗺️ Roadmap (Weeks 2–4)

| Week | Feature | Status |
|------|---------|--------|
| **1** | Project setup & authentication | ✅ Complete |
| **2** | Log trips (destinations, dates, stories) | 🔜 Upcoming |
| **3** | Photo uploads & galleries | 🔜 Upcoming |
| **4** | Share trips & discover others' memories | 🔜 Upcoming |

---

## 📦 Packages Used

**Backend** (`server/package.json`)
- `express` — web server framework
- `mongoose` — MongoDB ODM
- `bcryptjs` — password hashing
- `jsonwebtoken` — JWT creation and verification
- `dotenv` — environment variables
- `cors` — allow frontend to talk to backend

**Frontend** (`client/package.json`)
- `react` + `react-dom` — UI library
- `react-router-dom` — page routing
- `axios` — HTTP requests to the backend
- `vite` — build tool and dev server
- `tailwindcss` — styling

---

## 📄 License

This project is part of the TripVault Virtual Internship Program by CodGen.

---

<div align="center">

**TripVault** — Virtual Internship · CodGen · Week 1 of 4

Built with the MERN stack · Express + MongoDB + React (Vite)

</div>
