import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import HomeRedirect from './components/routing/HomeRedirect'
import RequireAuth from './components/routing/RequireAuth'
import { ROLES } from './constants/navigation'
import LoginPage from './pages/LoginPage'
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard'
import CoordinatorHalaqoh from './pages/coordinator/CoordinatorHalaqoh'
import CoordinatorMaterials from './pages/coordinator/CoordinatorMaterials'
import CoordinatorMentees from './pages/coordinator/CoordinatorMentees'
import CoordinatorMentors from './pages/coordinator/CoordinatorMentors'
import CoordinatorPresensi from './pages/coordinator/CoordinatorPresensi'
import MenteeDashboard from './pages/mentee/MenteeDashboard'
import MenteeMaterials from './pages/mentee/MenteeMaterials'
import MenteeResume from './pages/mentee/MenteeResume'
import MentorAttendance from './pages/mentor/MentorAttendance'
import MentorDashboard from './pages/mentor/MentorDashboard'
import MentorMaterials from './pages/mentor/MentorMaterials'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/mentor" element={<RequireAuth roles={[ROLES.MENTOR]} />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MentorDashboard />} />
          <Route path="presensi" element={<MentorAttendance />} />
          <Route path="materi" element={<MentorMaterials />} />
        </Route>
      </Route>

      <Route path="/mentee" element={<RequireAuth roles={[ROLES.MENTEE]} />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MenteeDashboard />} />
          <Route path="materi" element={<MenteeMaterials />} />
          <Route path="resume" element={<MenteeResume />} />
        </Route>
      </Route>

      <Route path="/coordinator" element={<RequireAuth roles={[ROLES.COORDINATOR]} />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CoordinatorDashboard />} />
          <Route path="halaqoh" element={<CoordinatorHalaqoh />} />
          <Route path="mentee" element={<CoordinatorMentees />} />
          <Route path="mentor" element={<CoordinatorMentors />} />
          <Route path="materi" element={<CoordinatorMaterials />} />
          <Route path="presensi" element={<CoordinatorPresensi />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
