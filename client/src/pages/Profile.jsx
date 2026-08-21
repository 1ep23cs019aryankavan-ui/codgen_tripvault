import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

/**
 * Public profile page — Week 3.
 * Accessible WITHOUT login at /profile/:username.
 * Shows the user's name, bio, and a grid of all their trips.
 */
export default function Profile() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    try {
      // Public endpoint — no auth token needed
      const { data } = await axios.get(`/api/users/${username}/profile`)
      setProfile(data.user)
      setTrips(data.trips)
    } catch (err) {
      setError(err.response?.data?.message || 'User not found')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : ''

  const formatJoined = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
      : ''

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="py-20 text-center text-gray-400">Loading profile…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-red-50">
            <UserIcon size={32} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">User not found</h2>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <Link
            to="/explore"
            className="mt-4 inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-700"
          >
            Browse Explore instead
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      {/* Profile header */}
      <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-primary-50 via-accent-50 to-white">
        <div className="map-grid-bg absolute inset-0 opacity-70" />
        <div className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-3xl font-bold text-white shadow-lg shadow-primary-600/30">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {profile.name}
              </h1>
              <p className="mt-1 text-sm font-medium text-primary-700">
                @{profile.username}
              </p>
              {profile.bio ? (
                <p className="mt-3 max-w-2xl text-base text-gray-600 leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                <p className="mt-3 text-sm italic text-gray-400">
                  No bio yet.
                </p>
              )}
              {profile.joinedDate && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                  <CalendarIcon /> Joined {formatJoined(profile.joinedDate)}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trips grid */}
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {profile.name?.split(' ')[0]}'s journeys
            </h2>
            <p className="text-sm text-gray-500">
              {trips.length} trip{trips.length !== 1 ? 's' : ''} logged
            </p>
          </div>
          {user && user.username === profile.username && (
            <Link
              to="/dashboard"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Edit profile
            </Link>
          )}
        </div>

        {trips.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
              <PinIcon />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No trips yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              {profile.name} hasn't logged any trips.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Link
                key={trip._id}
                to={`/trips/${trip._id}`}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-primary-300 hover:shadow-md"
              >
                {trip.coverImage ? (
                  <img
                    src={trip.coverImage}
                    alt={trip.title}
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
                    <MountainIcon />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">
                    {trip.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                    <PinIcon /> {trip.destination}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                  </div>
                  {trip.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {trip.description}
                    </p>
                  )}
                  {trip.rating > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      <Stars value={trip.rating} />
                      <span className="ml-1 text-xs text-gray-400">
                        {trip.rating}/5
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────

function UserIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function MountainIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-300">
      <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
    </svg>
  )
}
function Stars({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={s <= value ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          className={s <= value ? 'text-amber-400' : 'text-gray-300'}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}
