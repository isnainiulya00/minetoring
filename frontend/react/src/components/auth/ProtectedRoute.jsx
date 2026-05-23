import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuthStore } from '../../store/authStore'

export default function ProtectedRoute({ children, roles = [] }) {
  const location = useLocation()

  const {
    user,
    isAuthenticated,
    loadUser,
  } = useAuthStore()

  const [checking, setChecking] = useState(true)

  // ===============================
  // Auth check saat halaman dibuka
  // ===============================
  useEffect(() => {
    loadUser().finally(() => {
      setChecking(false)
    })
  }, [])

  // ===============================
  // Loading screen
  // ===============================
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  // ===============================
  // Belum login
  // ===============================
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  // ===============================
  // Role tidak sesuai
  // ===============================
  const hasAccess =
    roles.length === 0 ||
    roles.includes(user?.role)

  if (!hasAccess) {
    return <Navigate to="/forbidden" replace />
  }

  // ===============================
  // Halaman boleh diakses
  // ===============================
  return children
}