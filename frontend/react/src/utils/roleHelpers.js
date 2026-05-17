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

export function canManageSertifikat(user) {
  return isKMF(user)
}

export function canEditPresensi(user) {
  return isKMF(user) || isMentor(user)
}

export function canEditHafalan(user) {
  return isKMF(user) || isMentor(user)
}

export function canEditResume(user) {
  return isKMF(user) || isMentee(user)
}

export function getDashboardPath() {
  return '/dashboard'
}

export function getLoginRedirectPath(user) {
  return getDashboardPath()
}

/** Route path -> allowed roles (empty = all authenticated) */
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
  '/materi': [ROLES.KMF],
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
      { path: '/reports', label: 'Reports', icon: 'reports' },
      { path: '/halaqah', label: 'Halaqah', icon: 'halaqah' },
      { path: '/presensi', label: 'Presensi', icon: 'presensi' },
      { path: '/resume', label: 'Resume', icon: 'resume' },
      { path: '/hafalan', label: 'Hafalan', icon: 'hafalan' },
      { path: '/sertifikat', label: 'Sertifikat', icon: 'sertifikat' },
      { path: '/profile', label: 'Profil', icon: 'profile' },
      { path: '/settings', label: 'Pengaturan', icon: 'settings' },
    ]
  }

  if (role === ROLES.KMF) {
    return [
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/users', label: 'User Management', icon: 'users' },
      { path: '/mentor', label: 'Mentor', icon: 'mentor' },
      { path: '/mentee', label: 'Mentee', icon: 'mentee' },
      { path: '/halaqah', label: 'Halaqah', icon: 'halaqah' },
      { path: '/jadwal', label: 'Jadwal', icon: 'jadwal' },
      { path: '/presensi', label: 'Presensi', icon: 'presensi' },
      { path: '/resume', label: 'Resume', icon: 'resume' },
      { path: '/hafalan', label: 'Hafalan', icon: 'hafalan' },
      { path: '/sertifikat', label: 'Sertifikat', icon: 'sertifikat' },
      { path: '/profile', label: 'Profil', icon: 'profile' },
      { path: '/settings', label: 'Pengaturan', icon: 'settings' },
    ]
  }

  if (role === ROLES.MENTOR) {
    return [
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/presensi', label: 'Presensi', icon: 'presensi' },
      { path: '/hafalan', label: 'Hafalan', icon: 'hafalan' },
      { path: '/halaqah', label: 'Halaqah', icon: 'halaqah' },
      { path: '/jadwal', label: 'Jadwal', icon: 'jadwal' },
      { path: '/resume', label: 'Resume', icon: 'resume' },
      { path: '/sertifikat', label: 'Sertifikat', icon: 'sertifikat' },
      { path: '/profile', label: 'Profil', icon: 'profile' },
      { path: '/settings', label: 'Pengaturan', icon: 'settings' },
    ]
  }

  return [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/resume', label: 'Resume', icon: 'resume' },
    { path: '/jadwal', label: 'Jadwal', icon: 'jadwal' },
    { path: '/halaqah', label: 'Halaqah Saya', icon: 'halaqah' },
    { path: '/presensi', label: 'Presensi Saya', icon: 'presensi' },
    { path: '/sertifikat', label: 'Sertifikat Saya', icon: 'sertifikat' },
    { path: '/hafalan', label: 'Hafalan Saya', icon: 'hafalan' },
    { path: '/profile', label: 'Profil', icon: 'profile' },
    { path: '/settings', label: 'Pengaturan', icon: 'settings' },
  ]
}
