export const API_BASE_URL = 'http://127.0.0.1:8000'

export const ROLES = {
  ADMIN: 'ADMIN',
  KMF: 'KMF',
  MENTOR: 'MENTOR',
  MENTEE: 'MENTEE',
}

export const ROLE_LABELS = {
  ADMIN: 'Admin LPPIK',
  KMF: 'Koordinator Mentoring Fakultas',
  MENTOR: 'Mentor',
  MENTEE: 'Mentee',
}

export const PRESENSI_STATUS = {
  HADIR: { label: 'Hadir', variant: 'success' },
  IZIN: { label: 'Izin', variant: 'warning' },
  SAKIT: { label: 'Sakit', variant: 'info' },
  ALPHA: { label: 'Alpha', variant: 'danger' },
}

export const TINGKAT_HALAQAH = {
  TAKHASUS: 'Takhasus',
  TAHSIN: 'Tahsin',
  TAHFIDZ: 'Tahfidz',
}

export const STORAGE_KEYS = {
  ACCESS: 'mine_toring_access',
  REFRESH: 'mine_toring_refresh',
  USER: 'mine_toring_user',
}
