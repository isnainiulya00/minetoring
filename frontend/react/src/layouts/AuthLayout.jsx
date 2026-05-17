import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gray-900 p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-600/40 via-gray-900 to-gray-900" />
        <div className="relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 font-display text-lg font-bold backdrop-blur">
            MT
          </div>
          <h1 className="mt-8 font-display text-4xl font-bold leading-tight">
            MINE-TORING
          </h1>
          <p className="mt-4 max-w-md text-lg text-gray-300">
            Platform terintegrasi manajemen mentoring AIK — presensi, materi, resume, dan monitoring halaqah dalam satu sistem.
          </p>
        </div>
        <p className="relative z-10 text-sm text-gray-500">
          © {new Date().getFullYear()} LPPIK — Sistem Mentoring AIK
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-[#f5f5f5] p-6">
        <Outlet />
      </div>
    </div>
  )
}
