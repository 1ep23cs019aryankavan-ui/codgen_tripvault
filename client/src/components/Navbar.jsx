import { Link, useNavigate, useLocation } from 'react-router-dom'

/**
 * Shared navigation bar shown on all authenticated pages.
 * Links: Dashboard · My Trips · Explore · (Log out)
 */
export default function Navbar({ user }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/trips', label: 'My Trips' },
    { to: '/explore', label: 'Explore' },
  ]

  const isActive = (path) =>
    location.pathname === path ||
    (path !== '/dashboard' && location.pathname.startsWith(path))

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
            <CompassIcon size={20} />
          </div>
          <span className="text-lg font-bold text-gray-900">TripVault</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(item.to)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm font-medium text-gray-700 sm:inline">
              {user.name}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 border-t border-gray-100 px-4 py-2 sm:hidden">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex-1 rounded-lg px-3 py-1.5 text-center text-sm font-medium transition ${
              isActive(item.to)
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}

function CompassIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  )
}
