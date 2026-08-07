import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import TripForm from '../components/TripForm'

export default function Trips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get('/api/trips', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTrips(data.trips)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trips')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (tripData) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/trips', tripData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setShowForm(false)
      fetchTrips()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip')
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

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
            <p className="text-sm text-gray-500">
              Your personal travel timeline — {trips.length} trip
              {trips.length !== 1 ? 's' : ''} logged
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-700"
          >
            {showForm ? 'Cancel' : '+ New Trip'}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Log a new trip
            </h2>
            <TripForm onSubmit={handleCreate} submitLabel="Create trip" />
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center text-gray-400">Loading your trips…</div>
        )}

        {/* Empty state */}
        {!loading && trips.length === 0 && !showForm && (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
              <PinIcon />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No trips yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start your travel journal by logging your first trip.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-700"
            >
              + Log your first trip
            </button>
          </div>
        )}

        {/* Timeline */}
        {!loading && trips.length > 0 && (
          <div className="space-y-4">
            {trips.map((trip) => (
              <Link
                key={trip._id}
                to={`/trips/${trip._id}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {trip.title}
                      </h3>
                      {trip.isPublic && (
                        <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-600">
                          Public
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                      <PinIcon size={14} />
                      {trip.destination}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
                      <CalendarIcon />
                      {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <CameraIcon />
                    {trip.photoCount}
                  </div>
                </div>
                {trip.story && (
                  <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                    {trip.story}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function PinIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
