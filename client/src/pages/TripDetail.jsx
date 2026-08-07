import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import TripForm from '../components/TripForm'

export default function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [showEdit, setShowEdit] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
    fetchTrip()
  }, [id])

  const fetchTrip = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get(`/api/trips/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTrip(data.trip)
      setPhotos(data.photos)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trip')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (tripData) => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.put(`/api/trips/${id}`, tripData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTrip(data.trip)
      setShowEdit(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update trip')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this trip and all its photos? This cannot be undone.')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/trips/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      navigate('/trips')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete trip')
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (selectedFiles.length === 0) return
    setUploading(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      for (const file of selectedFiles) {
        formData.append('photos', file)
      }
      await axios.post(`/api/trips/${id}/photos`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      setSelectedFiles([])
      fetchTrip()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photos')
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Delete this photo?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/trips/${id}/photos/${photoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPhotos(photos.filter((p) => p._id !== photoId))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete photo')
    }
  }

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="py-20 text-center text-gray-400">Loading trip…</div>
      </div>
    )
  }

  if (error && !trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <p className="text-red-600">{error}</p>
          <Link to="/trips" className="mt-4 inline-block text-primary-600 hover:underline">
            ← Back to My Trips
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <Link to="/trips" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700">
          ← Back to My Trips
        </Link>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {/* Trip header */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{trip.title}</h1>
                {trip.isPublic && (
                  <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-medium text-accent-600">
                    🌍 Public
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <PinIcon /> {trip.destination}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarIcon /> {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <CameraIcon /> {photos.length} photo{photos.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            {trip.isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEdit(!showEdit)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {showEdit ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {trip.story && (
            <p className="mt-4 whitespace-pre-wrap text-gray-700 leading-relaxed">
              {trip.story}
            </p>
          )}
        </div>

        {/* Edit form */}
        {showEdit && trip.isOwner && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Edit trip</h2>
            <TripForm
              initialTrip={trip}
              onSubmit={handleUpdate}
              submitLabel="Save changes"
            />
          </div>
        )}

        {/* Photo upload (owner only) */}
        {trip.isOwner && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Upload photos</h2>
            <form onSubmit={handleUpload} className="space-y-3">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
              />
              {selectedFiles.length > 0 && (
                <p className="text-sm text-gray-500">
                  {selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''} selected
                </p>
              )}
              <button
                type="submit"
                disabled={selectedFiles.length === 0 || uploading}
                className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-700 disabled:opacity-60"
              >
                {uploading ? 'Uploading…' : 'Upload photos'}
              </button>
            </form>
          </div>
        )}

        {/* Photo gallery */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Photo gallery</h2>
          {photos.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white py-12 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <CameraIcon size={28} />
              </div>
              <p className="text-sm text-gray-500">
                No photos yet. {trip.isOwner && 'Upload some to relive your memories!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {photos.map((photo) => (
                <div
                  key={photo._id}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                >
                  <img
                    src={`/api/trips/${id}/photos/${photo._id}`}
                    alt={photo.caption || 'Trip photo'}
                    className="aspect-square w-full object-cover"
                  />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-xs text-white">{photo.caption}</p>
                    </div>
                  )}
                  {trip.isOwner && (
                    <button
                      onClick={() => handleDeletePhoto(photo._id)}
                      className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition group-hover:opacity-100"
                      title="Delete photo"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
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
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}
