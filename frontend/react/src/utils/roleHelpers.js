import { ROLES } from './constants'

// ===============================
// ROLE CHECK
// ===============================

export const isAdmin = (user) => user?.role === ROLES.LPPIK
export const isKMF = (user) => user?.role === ROLES.KMF
export const isMentor = (user) => user?.role === ROLES.MENTOR
export const isMentee = (user) => user?.role === ROLES.MENTEE
export const isMonitoring = (user) => isAdmin(user) || isKMF(user)

// ===============================
// ACTION PERMISSIONS
// ===============================

export const canManageUsers = isKMF
export const canManageMentor = isKMF
export const canManageMentee = isKMF
export const canManageHalaqah = isKMF
export const canManageJadwal = isKMF // Jadwal sudah include Materi
export const canManageSertifikat = isAdmin

export const canEditPresensi = (user) => isMentor(user) || isKMF(user)
export const canEditMutabaah = (user) => isMentor(user) || isKMF(user) 
export const canUploadResume = (user) => isMentee(user)
export const canGradeResume = (user) => isMentor(user)

// ===============================
// DASHBOARD REDIRECT
// ===============================

export function getDashboardPath(user) {
  if (!user) return '/dashboard'
  switch (user.role) {
    case ROLES.LPPIK: return '/dashboard/lppik'
    case ROLES.KMF: return '/dashboard/kmf'
    case ROLES.MENTOR: return '/dashboard/mentor'
    case ROLES.MENTEE: return '/dashboard/mentee'
    default: return '/dashboard'
  }
}

export function getLoginRedirectPath(user) {
  return getDashboardPath(user)
}

// ===============================
// ROUTE ACCESS 
// ===============================

export const ROUTE_ACCESS = {
  '/dashboard': [],
  '/management': [ROLES.KMF],
  '/halaqah': [ROLES.LPPIK, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/jadwal': [ROLES.LPPIK, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE], // Jadwal & Materi di sini
  '/presensi': [ROLES.LPPIK, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/resume': [ROLES.LPPIK, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/mutabaah': [ROLES.LPPIK, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/sertifikat': [ROLES.LPPIK, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/informasi': [ROLES.LPPIK, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/profile': [],
  '/settings': [],
}

// ===============================
// ROUTE VALIDATION
// ===============================

export function canAccessRoute(user, path) {
  const base = '/' + (path.split('/').filter(Boolean)[0] || '')
  const allowed = ROUTE_ACCESS[base]
  if (!allowed?.length) return true
  if (!user) return false
  return allowed.includes(user.role)
}

// ===============================
// SIDEBAR MENU 
// ===============================

export function getNavItems(user) {
  if (!user) return []

  switch (user.role) {
    case ROLES.LPPIK:
      return [
        { path: '/dashboard/lppik', label: 'Dashboard', icon: 'dashboard' },
        { path: '/halaqah/rekap', label: 'Rekap Halaqah', icon: 'halaqah' },
        { path: '/presensi/rekap', label: 'Rekap Presensi', icon: 'presensi' },
        { path: '/informasi', label: 'Informasi', icon: 'dashboard' },
        
      ]

    case ROLES.KMF:
      return [
        { path: '/dashboard/kmf', label: 'Dashboard', icon: 'dashboard' },
        { path: '/management/users', label: 'Data User', icon: 'users' },
        { path: '/management/mentors', label: 'Data Mentor', icon: 'mentor' }, 
        { path: '/management/mentees', label: 'Data Mentee', icon: 'mentee' }, 
        { path: '/management/halaqah', label: 'Kelola Halaqah', icon: 'halaqah' }, // <-- Cukup satu ini saja
        { path: '/presensi/mentor', label: 'Presensi Mentor', icon: 'presensi' },
        { path: '/presensi/mentee', label: 'Presensi Mentee', icon: 'presensi' }, 
        { path: "/rekap/mutabaah", label: "Rekap Mutabaah", icon: "mutabaah" },
        { path: '/jadwal', label: 'Jadwal & Materi', icon: 'jadwal' },
        { path: '/informasi', label: 'Informasi', icon: 'dashboard' },
        
      ]

    case ROLES.MENTOR:
      return [
        { path: '/dashboard/mentor', label: 'Dashboard', icon: 'dashboard' },
        { path: '/halaqah-saya', label: 'Halaqah Saya', icon: 'halaqah' },
        { path: '/presensi/mentee', label: 'Isi Presensi', icon: 'presensi' },
        { path: '/mutabaah/', label: 'Mutabaah', icon: 'mutabaah' },
        { path: '/resume/review', label: 'Review Resume', icon: 'resume' },
        { path: '/jadwal', label: 'Jadwal & Materi', icon: 'jadwal' }, // Ubah labelnya biar jelas
        { path: '/informasi', label: 'Informasi', icon: 'dashboard' },
       
      ]

    default: // MENTEE
      return [
        { path: '/dashboard/mentee', label: 'Dashboard', icon: 'dashboard' },
        { path: '/jadwal', label: 'Jadwal & Materi', icon: 'jadwal' }, // Ubah labelnya biar jelas
        { path: '/presensi/diri', label: 'Presensi Saya', icon: 'presensi' },
        { path: '/resume/upload', label: 'Upload Resume', icon: 'resume' },
        { path: '/mutabaah/tahsin', label: 'Mutabaah', icon: 'mutabaah' }, 
        { path: '/informasi', label: 'Informasi', icon: 'dashboard' },
        
      ]
  }
}