import { ROLES } from './constants'

// ===============================
// ROLE CHECK
// ===============================

export const isAdmin = (user) => user?.role === ROLES.ADMIN
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
    case ROLES.ADMIN: return '/dashboard/lppik'
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
  '/halaqah': [ROLES.ADMIN, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/jadwal': [ROLES.ADMIN, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE], // Jadwal & Materi di sini
  '/presensi': [ROLES.ADMIN, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/resume': [ROLES.ADMIN, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/mutabaah': [ROLES.ADMIN, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/nilai': [ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/rekap': [ROLES.ADMIN, ROLES.KMF],
  '/sertifikat': [ROLES.ADMIN, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/informasi': [ROLES.ADMIN, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
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
    case ROLES.ADMIN:
      return [
        { path: '/dashboard/lppik', label: 'Dashboard', icon: 'dashboard' },
        { path: '/halaqah/rekap', label: 'Rekap Halaqah', icon: 'halaqah' },
        { path: '/presensi/rekap', label: 'Rekap Presensi', icon: 'presensi' },
        { path: "/rekap/mutabaah", label: "Rekap Mutabaah", icon: "mutabaah" },
        { path: '/rekap/nilai', label: 'Rekap Nilai', icon: 'grade' },
        { path: '/jadwal', label: 'Jadwal & Materi', icon: 'jadwal' },
        { path: '/informasi', label: 'Informasi', icon: 'dashboard' },
        { label: 'Sertifikat', path: '/sertifikat', icon: 'sertifikat' }
     
        
      ]

    case ROLES.KMF:
      return [
        { path: '/dashboard/kmf', label: 'Dashboard', icon: 'dashboard' },
        { path: '/management/users', label: 'Data User', icon: 'users' },

        { path: '/management/halaqah', label: 'Kelola Halaqah', icon: 'halaqah' }, // <-- Cukup satu ini saja
        { path: '/presensi/rekap', label: 'Rekap Presensi', icon: 'presensi' },
        
        { path: "/rekap/mutabaah", label: "Rekap Mutabaah", icon: "mutabaah" },
        { path: '/nilai/input', label: 'Input Nilai', icon: 'grade' },
        { path: '/rekap/nilai', label: 'Rekap Nilai', icon: 'grade' },
        { path: '/jadwal', label: 'Jadwal & Materi', icon: 'jadwal' },
        { path: '/informasi', label: 'Informasi', icon: 'dashboard' },
        { label: 'Sertifikat', path: '/sertifikat', icon: 'sertifikat' }
      ]

    case ROLES.MENTOR:
      return [
        { path: '/dashboard/mentor', label: 'Dashboard', icon: 'dashboard' },
        { path: '/halaqah-saya', label: 'Halaqah Saya', icon: 'halaqah' },
        { path: '/presensi/mentee', label: 'Isi Presensi', icon: 'presensi' },
        { path: '/mutabaah/', label: 'Mutabaah', icon: 'mutabaah' },
        { path: '/resume/review', label: 'Review Resume', icon: 'resume' },
        { path: '/nilai/input', label: 'Input Nilai', icon: 'grade' },
        { path: '/jadwal', label: 'Jadwal & Materi', icon: 'jadwal' }, // Ubah labelnya biar jelas
        { path: '/informasi', label: 'Informasi', icon: 'dashboard' },
       { label: 'Sertifikat', path: '/sertifikat', icon: 'sertifikat' }
      ]

    default: // MENTEE
      return [
        { path: '/dashboard/mentee', label: 'Dashboard', icon: 'dashboard' },
        { path: '/jadwal', label: 'Jadwal & Materi', icon: 'jadwal' }, // Ubah labelnya biar jelas
        { path: '/presensi/diri', label: 'Presensi Saya', icon: 'presensi' },
        { path: '/resume/upload', label: 'Upload Resume', icon: 'resume' },
        { path: '/nilai-saya', label: 'Nilai Saya', icon: 'grade' },
        { path: '/mutabaah/tahsin', label: 'Mutabaah', icon: 'mutabaah' }, 
        { path: '/informasi', label: 'Informasi', icon: 'dashboard' },
        { label: 'Sertifikat', path: '/sertifikat', icon: 'sertifikat' }
      ]
  }
}
