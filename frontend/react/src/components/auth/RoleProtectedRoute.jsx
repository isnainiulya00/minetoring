import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { canAccessRoute } from '../../utils/roleHelpers'

export default function RoleProtectedRoute({ children, path, roles }) {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const checkPath = path || location.pathname

  if (roles?.length && user && !roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />
  }

  if (!canAccessRoute(user, checkPath)) {
    return <Navigate to="/forbidden" replace />
  }

  return children
}
