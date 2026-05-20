import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import RoleProtectedRoute from '../components/auth/RoleProtectedRoute'
import Login from '../pages/auth/Login'
import Dashboard from '../pages/dashboard/Dashboard'
import HalaqahList from '../pages/halaqah/HalaqahList'
import HalaqahDetail from '../pages/halaqah/HalaqahDetail'
import Presensi from '../pages/presensi/Presensi'
import Materi from '../pages/materi/Materi'
import Resume from '../pages/resume/Resume'
import Hafalan from '../pages/hafalan/Hafalan'
import UserManagement from '../pages/admin/UserManagement'
import Monitoring from '../pages/admin/Monitoring'
import Analytics from '../pages/admin/Analytics'
import Reports from '../pages/admin/Reports'
import MentorList from '../pages/mentor/MentorList'
import MenteeList from '../pages/mentee/MenteeList'
import Jadwal from '../pages/jadwal/Jadwal'
import Sertifikat from '../pages/sertifikat/Sertifikat'
import Profile from '../pages/profile/Profile'
import Settings from '../pages/settings/Settings'
import NotFound from '../pages/NotFound'
import Forbidden from '../pages/Forbidden'
import { ROLES } from '../utils/constants'

function RoleRoute({ path, roles, children }) {
  return (
    <RoleProtectedRoute path={path} roles={roles}>
      {children}
    </RoleProtectedRoute>
  )
}

function GuardedRoute({ path, children }) {
  return <RoleProtectedRoute path={path}>{children}</RoleProtectedRoute>
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'rounded-2xl text-sm shadow-lg border border-gray-100',
          duration: 4000,
        }}
      />
      <Routes>
        <Route path="/login" element={<AuthLayout />}>
          <Route index element={<Login />} />
        </Route>

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route
            path="monitoring"
            element={
              <RoleRoute path="/monitoring" roles={[ROLES.ADMIN]}>
                <Monitoring />
              </RoleRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <RoleRoute path="/analytics" roles={[ROLES.ADMIN]}>
                <Analytics />
              </RoleRoute>
            }
          />
          <Route
            path="reports"
            element={
              <RoleRoute path="/reports" roles={[ROLES.ADMIN]}>
                <Reports />
              </RoleRoute>
            }
          />

          <Route
            path="users"
            element={
              <RoleRoute path="/users" roles={[ROLES.KMF]}>
                <UserManagement />
              </RoleRoute>
            }
          />
          <Route
            path="mentor"
            element={
              <RoleRoute path="/mentor" roles={[ROLES.KMF]}>
                <MentorList />
              </RoleRoute>
            }
          />
          <Route
            path="mentee"
            element={
              <RoleRoute path="/mentee" roles={[ROLES.KMF]}>
                <MenteeList />
              </RoleRoute>
            }
          />

          <Route path="halaqah" element={<GuardedRoute path="/halaqah"><HalaqahList /></GuardedRoute>} />
          <Route path="halaqah/:id" element={<GuardedRoute path="/halaqah"><HalaqahDetail /></GuardedRoute>} />
          <Route path="jadwal" element={<GuardedRoute path="/jadwal"><Jadwal /></GuardedRoute>} />
          <Route path="presensi" element={<GuardedRoute path="/presensi"><Presensi /></GuardedRoute>} />
          <Route path="materi" element={<GuardedRoute path="/materi"><Materi /></GuardedRoute>} />
          <Route path="resume" element={<GuardedRoute path="/resume"><Resume /></GuardedRoute>} />
          <Route path="hafalan" element={<GuardedRoute path="/hafalan"><Hafalan /></GuardedRoute>} />
          <Route path="sertifikat" element={<GuardedRoute path="/sertifikat"><Sertifikat /></GuardedRoute>} />
          <Route path="profile" element={<GuardedRoute path="/profile"><Profile /></GuardedRoute>} />
          <Route path="settings" element={<GuardedRoute path="/settings"><Settings /></GuardedRoute>} />
        </Route>

        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
