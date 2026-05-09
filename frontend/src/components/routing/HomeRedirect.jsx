import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={`/${user.role}/dashboard`} replace />
}
