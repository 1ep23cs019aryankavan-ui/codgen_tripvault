import { useState } from 'react'

/**
 * Reusable form for creating and editing trips.
 * Props:
 *   initialTrip — existing trip object (for edit mode) or null (for create)
 *   onSubmit(tripData) — called with { title, destination, startDate, endDate, story, isPublic }
 *   submitLabel — button text
 */
export default function TripForm({ initialTrip, onSubmit, submitLabel = 'Save trip' }) {
  const [title, setTitle] = useState(initialTrip?.title || '')
  const [destination, setDestination] = useState(initialTrip?.destination || '')
  const [startDate, setStartDate] = useState(
    initialTrip ? initialTrip.startDate.slice(0, 10) : ''
  )
  const [endDate, setEndDate] = useState(
    initialTrip ? initialTrip.endDate.slice(0, 10) : ''
  )
  const [story, setStory] = useState(initialTrip?.story || '')
  const [isPublic, setIsPublic] = useState(initialTrip?.isPublic || false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!title || !destination || !startDate || !endDate) {
      setError('Please fill in all required fields')
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before start date')
      return
    }

    onSubmit({ title, destination, startDate, endDate, story, isPublic })
  }

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
            Start date *
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            End date *
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Your story
        </label>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={4}
          placeholder="What made this trip special? Share your favorite moments..."
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
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
        className="w-full rounded-lg bg-primary-600 py-2.5 font-medium text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-700"
      >
        {submitLabel}
      </button>
    </form>
  )
}
