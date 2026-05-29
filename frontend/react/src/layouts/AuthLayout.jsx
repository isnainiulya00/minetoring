import { Outlet } from 'react-router-dom'

// ===============================
// IMPORT LOGO 
// (Pastikan ekstensi file sesuai dengan yang ada di foldermu)
// ===============================
import minetoringLogo from '../assets/minetoring-logo.jpeg'
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
          <div className="flex items-center gap-4">
            
           
            
            {/* Logo Institusi (Dalam kotak putih agar warnanya pop-out) */}
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-4xl shadow-lg">
              <img src={minetoringLogo} alt="mentoring" className="h-9 w-auto object-contain" />
              <img src={umsColor} alt="UMS" className="h-7 w-auto object-contain" />
              <img src={lppikColor} alt="LPPIK" className="h-8 w-auto object-contain" />
              <img src={kmfColor} alt="KMF" className="h-9 w-auto object-contain rounded-full" />
            </div>
            
          </div>

          {/* TEKS JUDUL & DESKRIPSI */}
          <h1 className="mt-8 font-display text-4xl font-bold leading-tight tracking-tight">
            MINE-TORING
          </h1>
          <p className="mt-4 max-w-md text-lg text-gray-300 leading-relaxed">
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
