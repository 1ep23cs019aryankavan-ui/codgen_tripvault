import { useState, useRef, useCallback } from 'react'

const MAX_PHOTOS = 10
const MAX_SIZE_MB = 5

/**
 * Reusable form for creating and editing trips (Week 2 — Trip CRUD).
 * Now supports adding photos during create/edit (drag-and-drop + file picker).
 *
 * Props:
 *   initialTrip — existing trip object (for edit mode) or null (for create)
 *   onSubmit(tripData, photoFiles) — async; called with trip data and an
 *        array of File objects (may be empty). Returning a promise lets the
 *        form show a "Saving…" state while the parent uploads everything.
 *   submitLabel — button text
 */
export default function TripForm({ initialTrip, onSubmit, submitLabel = 'Save trip' }) {
  const [title, setTitle] = useState(initialTrip?.title || '')
  const [destination, setDestination] = useState(initialTrip?.destination || '')
  const [startDate, setStartDate] = useState(
    initialTrip?.startDate ? initialTrip.startDate.slice(0, 10) : ''
  )
  const [endDate, setEndDate] = useState(
    initialTrip?.endDate ? initialTrip.endDate.slice(0, 10) : ''
  )
  const [description, setDescription] = useState(initialTrip?.description || '')
  const [rating, setRating] = useState(initialTrip?.rating || 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [isPublic, setIsPublic] = useState(initialTrip?.isPublic || false)

  // Photos — File objects selected by the user (drag-drop or file picker)
  const [photos, setPhotos] = useState([])
  const [photoError, setPhotoError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  // ── Photo handling ────────────────────────────────────────────────────
  const addFiles = useCallback((fileList) => {
    setPhotoError('')
    const incoming = Array.from(fileList).filter(
      (f) => f.type.startsWith('image/')
    )
    if (incoming.length === 0) {
      setPhotoError('Please select image files only')
      return
    }
    setPhotos((prev) => {
      const remaining = MAX_PHOTOS - prev.length
      if (remaining <= 0) {
        setPhotoError(`You can add up to ${MAX_PHOTOS} photos per trip`)
        return prev
      }
      const accepted = incoming.slice(0, remaining)
      const rejected = incoming.length - accepted.length
      if (rejected > 0) {
        setPhotoError(
          `Added ${accepted.length} photo${accepted.length !== 1 ? 's' : ''}. ${rejected} skipped — max ${MAX_PHOTOS} per trip.`
        )
      }
      // Enforce per-file size limit
      const tooBig = accepted.filter((f) => f.size > MAX_SIZE_MB * 1024 * 1024)
      if (tooBig.length > 0) {
        setPhotoError(
          `Some photos exceed ${MAX_SIZE_MB}MB and were skipped.`
        )
      }
      return [
        ...prev,
        ...accepted.filter((f) => f.size <= MAX_SIZE_MB * 1024 * 1024),
      ]
    })
  }, [])

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragging(false)
  }

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title || !destination) {
      setError('Please fill in the trip title and destination')
      return
    }
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before start date')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(
        {
          title,
          destination,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          description,
          rating: rating || null,
          isPublic,
        },
        photos
      )
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Trip title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summer in the Alps"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Destination *
        </label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Switzerland"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Start date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            End date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Rating — star selector (1-5) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Rating
        </label>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star === rating ? 0 : star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="rounded p-0.5 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              >
                <StarIcon filled={star <= displayRating} />
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {displayRating > 0 ? `${displayRating} / 5` : 'No rating yet'}
          </span>
          {rating > 0 && (
            <button
              type="button"
              onClick={() => setRating(0)}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Description / memories
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="What made this trip special? Share your favorite moments..."
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* ── Photo upload (drag-and-drop + file picker) ─────────────────── */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Photos{' '}
          <span className="font-normal text-gray-400">
            ({photos.length}/{MAX_PHOTOS})
          </span>
        </label>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
            dragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50'
          }`}
        >
          <UploadIcon />
          <p className="mt-2 text-sm font-medium text-gray-700">
            {dragging ? 'Drop your photos here' : 'Drag & drop photos here'}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            or{' '}
            <span className="font-medium text-primary-600 underline">
              browse from your PC or phone
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            JPG, PNG, WEBP · up to {MAX_SIZE_MB}MB each · max {MAX_PHOTOS} photos
          </p>
          {/* Hidden file input — works on desktop & mobile (opens gallery/camera) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files)
              e.target.value = '' // reset so same file can be re-selected
            }}
            className="hidden"
          />
        </div>

        {photoError && (
          <p className="mt-1.5 text-xs text-amber-600">{photoError}</p>
        )}

        {/* Preview grid */}
        {photos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((file, index) => (
              <PhotoPreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => removePhoto(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Week 4 — Share & Discover toggle */}
      <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <div>
          <span className="text-sm font-medium text-gray-900">
            Make this trip public
          </span>
          <p className="text-xs text-gray-500">
            Public trips appear in the Explore feed for other travelers to discover.
          </p>
        </div>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-primary-600 py-2.5 font-medium text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting
          ? photos.length > 0
            ? 'Saving trip & uploading photos…'
            : 'Saving…'
          : submitLabel}
      </button>
    </form>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────

function PhotoPreview({ file, onRemove }) {
  const [src, setSrc] = useState('')
  // Generate an object URL for the thumbnail preview
  useState(() => {
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
      {src && (
        <img
          src={src}
          alt={file.name}
          className="h-full w-full object-cover"
        />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-lg transition group-hover:opacity-100 focus:opacity-100"
        aria-label={`Remove ${file.name}`}
      >
        <XIcon />
      </button>
      <span className="absolute bottom-0 inset-x-0 truncate bg-gradient-to-t from-black/60 to-transparent px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
        {file.name}
      </span>
    </div>
  )
}

function StarIcon({ filled }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'text-amber-400' : 'text-gray-300'}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary-500"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
