import { Outlet } from 'react-router-dom'

// ===============================
// IMPORT LOGO 
// (Pastikan ekstensi file sesuai dengan yang ada di foldermu)
// ===============================
import minetoringLogo from '../assets/2.jpeg'
import umsColor from '../assets/ums.png'
import lppikColor from '../assets/lppik.png'
import kmfColor from '../assets/kmf.png'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      
      {/* ===============================
          PANEL KIRI (DARK/NAVY)
      =============================== */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gray-900 p-10 text-white lg:flex">
        
        {/* Efek Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-600/40 via-gray-900 to-gray-900" />
        
        <div className="relative z-10">
          
          {/* KUMPULAN LOGO BERJEJER */}
          
            
           
            
           

          {/* TEKS JUDUL & DESKRIPSI */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <img
              src={minetoringLogo}
              alt="Mine-Toring"
              className="h-14 w-14 rounded-3xl border border-white/20 bg-white/10 object-cover shadow-lg"
            />
            <div>
              <h1 className="text-4xl font-display font-bold tracking-tight text-white">
                MINE-TORING
              </h1>
           
            </div>
          </div>
          <p className="mt-6 max-w-md text-lg text-gray-300 leading-relaxed">
            Platform terintegrasi manajemen mentoring AIK — presensi, materi, resume, dan monitoring halaqah dalam satu sistem.
          </p>
        </div>
        
        {/* FOOTER KIRI */}
        <p className="relative z-10 text-sm text-gray-500 font-medium">
          © {new Date().getFullYear()} LPPIK — Sistem Mentoring AIK
        </p>
      </div>

      {/* ===============================
          PANEL KANAN (FORM LOGIN)
      =============================== */}
      <div className="flex flex-1 items-center justify-center bg-[#f5f5f5] p-6">
        <Outlet />
      </div>
      
    </div>
  )
}
