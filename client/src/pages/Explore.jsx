import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

export default function Explore() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      // Explore is a public endpoint — send token if available (optional)
      const token = localStorage.getItem('token')
      const { data } = await axios.get('/api/trips/explore', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      setTrips(data.trips)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load explore feed')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Explore</h1>
          <p className="text-sm text-gray-500">
            Discover public travel memories shared by fellow travelers 🌍
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center text-gray-400">Loading explore feed…</div>
        )}

        {/* Empty state */}
        {!loading && trips.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-50">
              <GlobeIcon />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No public trips yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to share your adventure! Make one of your trips public.
            </p>
            <Link
              to="/trips"
              className="mt-4 inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-700"
            >
              Go to My Trips
            </Link>
          </div>
        )}

        {/* Public trips grid */}
        {!loading && trips.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Link
                key={trip._id}
                to={`/trips/${trip._id}`}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-primary-300 hover:shadow-md"
              >
                {/* Cover photo */}
                {trip.coverPhotoId ? (
                  <img
                    src={`/api/trips/${trip._id}/photos/${trip.coverPhotoId}`}
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

                  {trip.story && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {trip.story}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <UserIcon /> {trip.user?.name || 'Anonymous'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <CameraIcon /> {trip.photoCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
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
function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function GlobeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-500">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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
