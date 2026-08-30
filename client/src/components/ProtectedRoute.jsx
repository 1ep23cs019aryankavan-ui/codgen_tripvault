import { Navigate } from 'react-router-dom'

/**
 * Wraps a protected route. If no JWT token is in localStorage,
 * redirects to /login. Otherwise renders the child route.
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}
