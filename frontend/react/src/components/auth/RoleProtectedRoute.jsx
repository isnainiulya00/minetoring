import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function RoleProtectedRoute({ allowedRoles }) {
  const user = useAuthStore((s) => s.user)

  // Kalau belum login, lempar ke login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Kalau role-nya tidak diizinkan, lempar ke forbidden
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />
  }

  // JIKA AMAN, TAMPILKAN ISI HALAMANNYA (Ini yang bikin layarmu nggak blank lagi!)
  return <Outlet />
}