import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
export default function ProtectedRoute({ children, roles }) {
  const location = useLocation()
  const { isAuthenticated, user, loadUser } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    loadUser().finally(() => setChecking(false))
  }, [loadUser])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles?.length && user && !roles.includes(user.role) && !user.is_staff) {
    return <Navigate to="/forbidden" replace />
  }

  return children
}
