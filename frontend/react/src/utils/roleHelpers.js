import { ROLES } from './constants'

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN
}

export function isKMF(user) {
  return user?.role === ROLES.KMF
}

export function isMentor(user) {
  return user?.role === ROLES.MENTOR
}

export function isMentee(user) {
  return user?.role === ROLES.MENTEE
}

export function isMonitoring(user) {
  return isAdmin(user) || isKMF(user)
}

export function canManageUsers(user) {
  return isKMF(user)
}

export function canManageHalaqah(user) {
  return isKMF(user)
}

export function canManageMentor(user) {
  return isKMF(user)
}

export function canManageMentee(user) {
  return isKMF(user)
}

export function canManageJadwal(user) {
  return isKMF(user)
}

export function canManageMateri(user) {
  return isKMF(user)
}

/** LPPIK only — CRUD sertifikat */
export function canManageSertifikat(user) {
  return isAdmin(user)
}

export function canViewSertifikat(user) {
  return true
}

/** Hanya mentor yang boleh mengubah presensi */
export function canEditPresensi(user) {
  return isMentor(user)
}

export function canViewPresensiRekap(user) {
  return isMonitoring(user) || isMentor(user) || isMentee(user)
}

export function canEditHafalan(user) {
  return isMentor(user)
}

export function canUploadResume(user) {
  return isMentee(user)
}

export function canGradeResume(user) {
  return isMentor(user)
}

export function canViewRekapHalaqoh(user) {
  return isMonitoring(user) || isMentor(user)
}

export function getDashboardPath() {
  return '/dashboard'
}

export function getLoginRedirectPath() {
  return '/dashboard'
}

export const ROUTE_ACCESS = {
  '/dashboard': [],
  '/monitoring': [ROLES.ADMIN],
  '/analytics': [ROLES.ADMIN],
  '/reports': [ROLES.ADMIN],
  '/users': [ROLES.KMF],
  '/mentor': [ROLES.KMF],
  '/mentee': [ROLES.KMF],
  '/halaqah': [ROLES.ADMIN, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/jadwal': [ROLES.ADMIN, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/presensi': [ROLES.ADMIN, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/resume': [ROLES.ADMIN, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/hafalan': [ROLES.ADMIN, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/sertifikat': [ROLES.ADMIN, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/materi': [ROLES.ADMIN, ROLES.KMF, ROLES.MENTOR, ROLES.MENTEE],
  '/profile': [],
  '/settings': [],
}

export function canAccessRoute(user, path) {
  const base = '/' + (path.split('/').filter(Boolean)[0] || '')
  const allowed = ROUTE_ACCESS[base]
  if (!allowed?.length) return true
  if (!user) return false
  return allowed.includes(user.role)
}

export function getNavItems(user) {
  if (!user) return []

  const role = user.role

  if (role === ROLES.ADMIN) {
    return [
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/monitoring', label: 'Monitoring', icon: 'monitoring' },
      { path: '/analytics', label: 'Analytics', icon: 'analytics' },
      { path: '/reports', label: 'Rekap', icon: 'reports' },
      { path: '/halaqah', label: 'Halaqah', icon: 'halaqah' },
      { path: '/materi', label: 'Materi', icon: 'materi' },
      { path: '/presensi', label: 'Presensi', icon: 'presensi' },
      { path: '/resume', label: 'Resume', icon: 'resume' },
      { path: '/hafalan', label: 'Hafalan', icon: 'hafalan' },
      { path: '/sertifikat', label: 'Sertifikat', icon: 'sertifikat' },
      { path: '/profile', label: 'Profil', icon: 'profile' },
    ]
  }

  if (role === ROLES.KMF) {
    return [
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/users', label: 'User', icon: 'users' },
      { path: '/mentor', label: 'Mentor', icon: 'mentor' },
      { path: '/mentee', label: 'Mentee', icon: 'mentee' },
      { path: '/halaqah', label: 'Halaqah', icon: 'halaqah' },
      { path: '/jadwal', label: 'Jadwal & Materi', icon: 'jadwal' },
      { path: '/materi', label: 'Materi', icon: 'materi' },
      { path: '/presensi', label: 'Presensi', icon: 'presensi' },
      { path: '/resume', label: 'Resume', icon: 'resume' },
      { path: '/hafalan', label: 'Hafalan', icon: 'hafalan' },
      { path: '/sertifikat', label: 'Sertifikat', icon: 'sertifikat' },
      { path: '/profile', label: 'Profil', icon: 'profile' },
    ]
  }

  if (role === ROLES.MENTOR) {
    return [
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/presensi', label: 'Presensi', icon: 'presensi' },
      { path: '/hafalan', label: 'Mutabaah', icon: 'hafalan' },
      { path: '/resume', label: 'Resume', icon: 'resume' },
      { path: '/jadwal', label: 'Jadwal', icon: 'jadwal' },
      { path: '/materi', label: 'Materi', icon: 'materi' },
      { path: '/halaqah', label: 'Halaqah', icon: 'halaqah' },
      { path: '/sertifikat', label: 'Sertifikat', icon: 'sertifikat' },
      { path: '/profile', label: 'Profil', icon: 'profile' },
    ]
  }

  return [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/resume', label: 'Resume', icon: 'resume' },
    { path: '/jadwal', label: 'Jadwal', icon: 'jadwal' },
    { path: '/materi', label: 'Materi', icon: 'materi' },
    { path: '/presensi', label: 'Presensi', icon: 'presensi' },
    { path: '/hafalan', label: 'Hafalan', icon: 'hafalan' },
    { path: '/sertifikat', label: 'Sertifikat', icon: 'sertifikat' },
    { path: '/profile', label: 'Profil', icon: 'profile' },
  ]
}
