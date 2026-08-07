import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ trips: 0, photos: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))

    // Fetch user info + trip stats
    const token = localStorage.getItem('token')
    Promise.all([
      axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get('/api/trips', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([meRes, tripsRes]) => {
        setUser(meRes.data.user)
        const trips = tripsRes.data.trips
        setStats({
          trips: trips.length,
          photos: trips.reduce((sum, t) => sum + (t.photoCount || 0), 0),
        })
      })
      .catch(() => {
        // Token invalid — let the Navbar handle logout
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Loading state ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="py-20 text-center text-gray-400">
          Loading your dashboard…
        </div>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      {/* Welcome hero */}
      <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-primary-50 via-accent-50 to-white">
        <div className="map-grid-bg absolute inset-0 opacity-70" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
            <SparkleIcon /> Welcome back
          </div>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Hello, {user?.name?.split(' ')[0] || 'traveler'} 👋
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-600 sm:text-lg">
            This is your personal travel memory vault. Log your trips, upload
            photos, and share your adventures with the world.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <MailIcon /> {user?.email}
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Your journal at a glance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/trips"
            className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Trips Logged</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <PinIcon />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-900">{stats.trips}</div>
            <p className="mt-1 text-xs text-primary-600">View your timeline →</p>
          </Link>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Photos Uploaded</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <CameraIcon />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-900">{stats.photos}</div>
            <p className="mt-1 text-xs text-gray-400">Across all your trips</p>
          </div>

          <Link
            to="/explore"
            className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-accent-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Explore</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-600">
                <GlobeIcon />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-900">🌍</div>
            <p className="mt-1 text-xs text-accent-600">Discover public trips →</p>
          </Link>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            to="/trips"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <BookIcon />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Log a new trip</h3>
              <p className="text-sm text-gray-500">Add destinations, dates & stories</p>
            </div>
          </Link>

          <Link
            to="/trips"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <CameraIcon size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Upload photos</h3>
              <p className="text-sm text-gray-500">Relive your favorite moments</p>
            </div>
          </Link>

          <Link
            to="/explore"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-accent-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
              <ShareIcon />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Share & discover</h3>
              <p className="text-sm text-gray-500">Make trips public, explore others</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-gray-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <CompassIcon size={16} />
            <span>TripVault — Virtual Internship · CodGen</span>
          </div>
          <span>Weeks 1–4 · Auth · Trips · Photos · Explore</span>
        </div>
      </footer>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────

function CompassIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  )
}
function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function CameraIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
function ShareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}
function BookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
    </svg>
  )
}
