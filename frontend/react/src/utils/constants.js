// ===============================
// API
// ===============================

export const API_BASE_URL =
  'http://127.0.0.1:8000'


// ===============================
// USER ROLES
// ===============================

export const ROLES = {
  ADMIN: 'LPPIK',
  KMF: 'KMF',
  MENTOR: 'MENTOR',
  MENTEE: 'MENTEE',
}

export const ROLE_LABELS = {
  LPPIK: 'Admin LPPIK',
  KMF: 'Koordinator Mentoring Fakultas',
  MENTOR: 'Mentor',
  MENTEE: 'Mentee',
}


// ===============================
// PRESENSI
// ===============================

export const PRESENSI_STATUS = {
  HADIR: {
    label: 'Hadir',
    variant: 'success',
  },

  IZIN: {
    label: 'Izin',
    variant: 'warning',
  },

  SAKIT: {
    label: 'Sakit',
    variant: 'info',
  },

  ALPHA: {
    label: 'Alpha',
    variant: 'danger',
  },
}


// ===============================
// HALAQAH
// ===============================

export const HALAQAH_LEVELS = {
  TAKHASUS: 'Takhasus',
  TAHSIN: 'Tahsin',
  TAHFIDZ: 'Tahfidz',
}


// ===============================
// LOCAL STORAGE
// ===============================

export const STORAGE_KEYS = {
  ACCESS: 'mine_toring_access',
  REFRESH: 'mine_toring_refresh',
  USER: 'mine_toring_user',
}