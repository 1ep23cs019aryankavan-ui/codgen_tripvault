import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

// Use the environment variable for production deployment or fallback to empty string (local dev proxy)
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        password,
      })
      // Store the JWT token returned on registration
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/30">
            <CompassIcon />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">TripVault</h1>
          <p className="mt-1 text-gray-500">Create your travel journal account</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-gray-200/60 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Wanderer"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary-600 py-2.5 font-medium text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-700 disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function CompassIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  )
}
