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
│   ├── models/          ← User.js,Photo.js,Trip.js (Mongoose schema)
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


## 🔒 Security Notes

- ✅ Passwords are **hashed with bcrypt** (10 salt rounds) — never stored in plain text.
- ✅ Authentication is **stateless JWT** (7-day expiry).
- ✅ The `/api/auth/me` route validates the JWT via `authMiddleware.js` on every request.
- ✅ Login returns a **generic error** ("Invalid credentials") to prevent email enumeration.
- ✅ `.env` is gitignored — secrets never reach GitHub.
- ⚠️ The JWT is stored in `localStorage` (per the Week 1 brief). For production, consider `httpOnly` cookies.


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
