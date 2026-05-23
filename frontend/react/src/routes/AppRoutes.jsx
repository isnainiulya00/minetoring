import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts & Auth
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import Login from '../pages/auth/Login'
import Forbidden from '../pages/Forbidden'
import NotFound from '../pages/NotFound'

// Komponen Guard & Constants
import ProtectedRoute from '../components/auth/ProtectedRoute'
import RoleProtectedRoute from '../components/auth/RoleProtectedRoute'
import { ROLES } from '../utils/constants'

// ================= DAFTAR IMPORT HALAMAN =================
// (Pastikan path import komponenmu di bawah ini sudah sesuai ya)
import Dashboard from '../pages/dashboard/Dashboard'
import LPPIKDashboard from '../pages/dashboard/LPPIKDashboard'
import KMFDashboard from '../pages/dashboard/KMFDashboard'
import MentorDashboard from '../pages/dashboard/MentorDashboard'
import MenteeDashboard from '../pages/dashboard/MenteeDashboard'

import UserManagement from '../pages/management/UserManagement'
import MentorManagement from '../pages/management/MentorManagement'
import MenteeManagement from '../pages/management/MenteeManagement'
import HalaqahManagement from '../pages/management/HalaqahManagement'

import HalaqahList from '../pages/halaqah/HalaqahList'
import HalaqahDetail from '../pages/halaqah/HalaqahDetail'
import HalaqahMember from '../pages/halaqah/HalaqahMember'
import HalaqahRekap from '../pages/halaqah/HalaqahRekap'

import Jadwal from '../pages/jadwal/Jadwal'

import InformasiList from '../pages/informasi/InformasiList' // Asumsi nama file barumu

import PresensiDiri from '../pages/presensi/PresensiDiri'
import PresensiMentee from '../pages/presensi/PresensiMentee'
import PresensiMentor from '../pages/presensi/PresensiMentor'
import RekapPresensi from '../pages/presensi/RekapPresensi'

import MutabaahRouter from '../pages/mutabaah/MutabaahRouter'
import Tahfidz from '../pages/mutabaah/Tahfidz'
import Tahsin from '../pages/mutabaah/Tahsin'
import Takhasus from '../pages/mutabaah/Takhasus'

import ResumeList from '../pages/resume/ResumeList'
import UploadResume from '../pages/resume/UploadResume'
import ResumeReview from '../pages/resume/ResumeReview'

import Sertifikat from '../pages/sertifikat/Sertifikat'
import Profile from '../pages/profile/Profile'
import Settings from '../pages/settings/Settings'

import InformasiForm from '../pages/informasi/InformasiForm'

export default function AppRoutes() {
  return (
    <Routes>
      {/* ─── PUBLIC ROUTES ─── */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* ─── PROTECTED ROUTES (Harus Login) ─── */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        
        {/* Hub Utama: Otomatis memecah dashboard berdasarkan role */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />

        {/* ─── FITUR GLOBAL (Bisa diakses KMF, Mentor, Mentee) ─── */}
        <Route element={<RoleProtectedRoute allowedRoles={[ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE]} />}>
          <Route path="/informasi" element={<InformasiList />} />
          <Route path="/jadwal" element={<Jadwal />} />
          <Route path="/sertifikat" element={<Sertifikat />} />
          <Route path="/halaqah" element={<HalaqahList />} />
          <Route path="/halaqah/:id" element={<HalaqahDetail />} />
        </Route>

        {/* =======================================================
            HAK AKSES SPESIFIK BERDASARKAN ALUR BISNIS MINE-TORING
            ======================================================= */}

        {/* 1. KHUSUS KMF (Super Admin) */}
        <Route element={<RoleProtectedRoute allowedRoles={[ROLES.KMF]} />}>
          <Route path="/dashboard/kmf" element={<KMFDashboard />} />
          <Route path="/management/users" element={<UserManagement />} />
          <Route path="/management/mentors" element={<MentorManagement />} />
          <Route path="/management/mentees" element={<MenteeManagement />} />
          <Route path="/management/halaqah" element={<HalaqahManagement />} />
          <Route path="/presensi/mentor" element={<PresensiMentor />} />
          <Route path="/informasi/create" element={<InformasiForm />} />
          <Route path="/informasi/edit/:id" element={<InformasiForm />} />
          
        </Route>

        {/* 2. REKAP GLOBAL (KMF & LPPIK) */}
        <Route element={<RoleProtectedRoute allowedRoles={[ROLES.KMF, ROLES.LPPIK]} />}>
          <Route path="/dashboard/lppik" element={<LPPIKDashboard />} />
          <Route path="/halaqah/rekap" element={<HalaqahRekap />} />
          <Route path="/presensi/rekap" element={<RekapPresensi />} />
          {/* Tambahan jika ada halaman rekap mutabaah/resume global */}
        </Route>

        {/* 3. KHUSUS MENTOR */}
        <Route element={<RoleProtectedRoute allowedRoles={[ROLES.MENTOR]} />}>
          <Route path="/dashboard/mentor" element={<MentorDashboard />} />
          <Route path="/resume/review" element={<ResumeReview />} />
          <Route path="/resume/list" element={<ResumeList />} />
        </Route>

        {/* 4. KHUSUS MENTEE */}
        <Route element={<RoleProtectedRoute allowedRoles={[ROLES.MENTEE]} />}>
          <Route path="/dashboard/mentee" element={<MenteeDashboard />} />
          <Route path="/presensi/diri" element={<PresensiDiri />} />
          <Route path="/resume/upload" element={<UploadResume />} />
        </Route>

        {/* 5. IRISAN KMF & MENTOR (KMF sebagai Backup Mentor) */}
        <Route element={<RoleProtectedRoute allowedRoles={[ROLES.KMF, ROLES.MENTOR]} />}>
          <Route path="/halaqah/:id/members" element={<HalaqahMember />} />
          <Route path="/presensi/mentee" element={<PresensiMentee />} />
          
          {/* Sub-routing Mutabaah */}
          <Route path="/mutabaah" element={<MutabaahRouter />}>
            <Route index element={<Navigate to="tahsin" replace />} />
            <Route path="tahsin" element={<Tahsin />} />
            <Route path="tahfidz" element={<Tahfidz />} />
            <Route path="takhasus" element={<Takhasus />} />
          </Route>
        </Route>

      </Route>

      {/* ─── ERROR PAGES ─── */}
      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}