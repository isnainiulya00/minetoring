import PageHeader from '../../components/common/PageHeader'
import { Link } from 'react-router-dom'
import { 
  HiOutlineUserGroup, 
  HiOutlineClipboardList, 
  HiOutlineBookOpen, 
  HiOutlineCalendar,
  HiOutlineDatabase,
  HiOutlineIdentification
} from 'react-icons/hi'
import { useApi } from '../../hooks/useApi'

import { mentorService } from '../../services/mentorService'
import { menteeService } from '../../services/menteeService'
import { halaqahService } from '../../services/halaqahService'

export default function KMFDashboard() {
  // Ambil data statistik global dari backend Django
  const { data: mentorData } = useApi(mentorService.getAll, [])
  const { data: menteeData } = useApi(menteeService.getAll, [])
  const { data: halaqahData } = useApi(halaqahService.getAll, [])

  const totalMentor = Array.isArray(mentorData) ? mentorData.length : (mentorData?.results?.length || 0)
  const totalMentee = Array.isArray(menteeData) ? menteeData.length : (menteeData?.results?.length || 0)
  const totalHalaqah = Array.isArray(halaqahData) ? halaqahData.length : (halaqahData?.results?.length || 0)

  // Daftar Menu Cepat (Bisa ditambah/dikurangi sesuai kebutuhan rute kamu)
  const quickActions = [
    {
      title: 'Kelola Presensi',
      desc: 'Cek dan rekap kehadiran mentee & mentor',
      icon: HiOutlineClipboardList,
      link: '/presensi/rekap', // Sesuaikan dengan path di AppRoutes
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      hover: 'hover:border-emerald-300 hover:shadow-emerald-100'
    },
    {
      title: 'Pantau Mutabaah',
      desc: 'Lihat rekap progres mentee',
      icon: HiOutlineBookOpen,
      link: '/rekap/mutabaah',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      hover: 'hover:border-blue-300 hover:shadow-blue-100'
    },
    {
      title: 'Manajemen Jadwal',
      desc: 'Atur jadwal pertemuan mentoring rutin',
      icon: HiOutlineCalendar,
      link: '/jadwal',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      hover: 'hover:border-amber-300 hover:shadow-amber-100'
    },
    {
      title: 'Kelola Halaqah',
      desc: 'Atur pembagian kelompok dan plotting',
      icon: HiOutlineUserGroup,
      link: '/halaqah',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      hover: 'hover:border-indigo-300 hover:shadow-indigo-100'
    },
    {
      title: 'Manajemen Pengguna',
      desc: 'Kelola akun, Mentor, dan Mentee',
      icon: HiOutlineIdentification,
      link: '/management/users', 
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      hover: 'hover:border-purple-300 hover:shadow-purple-100'
    },
    {
      title: 'Rekap Sertifikat',
      desc: 'Distribusi dan cek status kelulusan',
      icon: HiOutlineDatabase,
      link: '/sertifikat',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      hover: 'hover:border-rose-300 hover:shadow-rose-100'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      <PageHeader 
        title="Command Center KMF" 
        subtitle="Pusat kendali operasional kegiatan Mentoring AIK" 
      />

      {/* STATISTIK KARTU ATAS (BIG NUMBERS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Mentor Aktif</p>
            <p className="text-4xl font-black text-gray-900">{totalMentor}</p>
          </div>
          <HiOutlineUserGroup className="absolute -right-4 -bottom-4 text-7xl text-blue-50" />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Mentee Terdaftar</p>
            <p className="text-4xl font-black text-gray-900">{totalMentee}</p>
          </div>
          <HiOutlineUserGroup className="absolute -right-4 -bottom-4 text-7xl text-emerald-50" />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Halaqah Terbentuk</p>
            <p className="text-4xl font-black text-gray-900">{totalHalaqah}</p>
          </div>
          <HiOutlineUserGroup className="absolute -right-4 -bottom-4 text-7xl text-amber-50" />
        </div>
      </div>

      {/* AKSES CEPAT (QUICK ACTIONS) PENGGANTI GRAFIK */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mt-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">Akses Cepat KMF</h3>
          <p className="text-sm text-gray-500">Pilih menu di bawah ini untuk mengelola operasional mentoring dengan cepat.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickActions.map((action, idx) => (
            <Link 
              key={idx} 
              to={action.link} 
              className={`flex items-start gap-4 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 ${action.hover} group`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 ${action.bg} ${action.color} transition-transform group-hover:scale-110`}>
                <action.icon />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base mb-1 group-hover:text-gray-700">{action.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}