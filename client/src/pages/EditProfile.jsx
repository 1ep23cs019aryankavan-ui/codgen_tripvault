import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

/**
 * Edit Profile page — Week 3.
 * Lets the logged-in user update their bio and username.
 * Calls PUT /api/users/profile.
 */
export default function EditProfile() {
  const navigate = useNavigate()
  const stored = localStorage.getItem('user')
  const initialUser = stored ? JSON.parse(stored) : {}

  const [name] = useState(initialUser.name || '')
  const [username, setUsername] = useState(initialUser.username || '')
  const [bio, setBio] = useState(initialUser.bio || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.put(
        '/api/users/profile',
        { bio, username },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Update localStorage with the new user info
      const updated = { ...initialUser, ...data.user }
      localStorage.setItem('user', JSON.stringify(updated))

      setSuccess(true)
      // If username changed, navigate to the new profile URL after a beat
      setTimeout(() => {
        navigate(`/profile/${data.user.username}`)
      }, 800)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={initialUser} />

      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <Link
          to="/dashboard"
          className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Dashboard
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update your public profile — visible to anyone at{' '}
            <span className="font-medium text-primary-600">
              /profile/{username || 'username'}
            </span>
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-100">
              Profile saved! Redirecting…
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Read-only display name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Display name
              </label>
              <input
                type="text"
                value={name}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Contact support to change your display name.
              </p>
            </div>

            {/* Username */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="flex items-center rounded-lg border border-gray-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
                <span className="pl-3 text-sm text-gray-400">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]{3,20}"
                  className="w-full rounded-lg px-2 py-2.5 text-gray-900 outline-none"
                  title="3-20 chars: letters, numbers, underscores"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                3-20 characters · letters, numbers, underscores only
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={300}
                placeholder="Avid hiker, coffee chaser, and sunset collector. Always planning the next adventure."
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
              <p className="mt-1 text-right text-xs text-gray-400">
                {bio.length} / 300
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-primary-600 py-2.5 font-medium text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save profile'}
              </button>
              <Link
                to="/dashboard"
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
