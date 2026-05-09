export const ROLES = {
  MENTOR: 'mentor',
  MENTEE: 'mentee',
  COORDINATOR: 'coordinator',
}

export const NAV_BY_ROLE = {
  [ROLES.MENTOR]: [
    { to: '/mentor/dashboard', label: 'Beranda', end: false },
    { to: '/mentor/presensi', label: 'Presensi', end: false },
    { to: '/mentor/materi', label: 'Materi pertemuan', end: false },
  ],
  [ROLES.MENTEE]: [
    { to: '/mentee/dashboard', label: 'Beranda', end: false },
    { to: '/mentee/materi', label: 'Materi pertemuan', end: false },
    { to: '/mentee/resume', label: 'Resume', end: false },
  ],
  [ROLES.COORDINATOR]: [
    { to: '/coordinator/dashboard', label: 'Beranda', end: false },
    { to: '/coordinator/halaqoh', label: 'Halaqoh', end: false },
    { to: '/coordinator/mentee', label: 'Mentee', end: false },
    { to: '/coordinator/mentor', label: 'Mentor', end: false },
    { to: '/coordinator/materi', label: 'Materi', end: false },
    { to: '/coordinator/presensi', label: 'Presensi', end: false },
  ],
}

export const ROLE_LABEL = {
  [ROLES.MENTOR]: 'Mentor',
  [ROLES.MENTEE]: 'Mentee',
  [ROLES.COORDINATOR]: 'Koordinator',
}
