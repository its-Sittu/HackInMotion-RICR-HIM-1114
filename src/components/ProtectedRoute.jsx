import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps a route that requires authentication.
 * Unauthenticated users are redirected to /auth,
 * with the original destination saved so they can be
 * sent back after login.
 */
export default function ProtectedRoute({ children }) {
  const { token, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0a0e1a', color: '#6366f1',
        fontSize: '1.1rem', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #6366f130',
            borderTop: '3px solid #6366f1', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem'
          }} />
          Verifying session...
        </div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}
