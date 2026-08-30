import { Navigate, useLocation } from 'react-router-dom'

/**
 * Parses and decodes a JWT payload to check expiration client-side.
 */
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.exp) return false
    return payload.exp * 1000 < Date.now()
  } catch {
    return true // Invalid token format
  }
}

/**
 * Wraps a protected route. If no valid JWT token is found,
 * redirects to /login while preserving the target route location.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const token = localStorage.getItem('token')

  const isInvalidToken =
    !token ||
    token === 'null' ||
    token === 'undefined' ||
    isTokenExpired(token)

  if (isInvalidToken) {
    // Clear potentially invalid or expired tokens
    localStorage.removeItem('token')
    
    // Redirect to login, saving current location for post-login redirection
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
