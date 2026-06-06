import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'
import { 
  HiOutlineClipboardCheck, 
  HiOutlineDocumentText, 
  HiOutlineCalendar,
  HiOutlineBookOpen,
  HiOutlineInformationCircle,
  HiOutlineAcademicCap
} from 'react-icons/hi'

export default function MenteeDashboard() {
  const user = useAuthStore((state) => state.user)

  // Daftar Akses Cepat Khusus Mentee
  const quickActions = [
    {
      title: 'Riwayat Kehadiran',
      desc: 'Cek persentase kehadiranmu di setiap pertemuan mentoring.',
      icon: HiOutlineClipboardCheck,
      link: '/presensi/diri', // Sesuaikan dengan rute AppRoutes kamu
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      hover: 'hover:border-emerald-300 hover:shadow-emerald-100'
    },
    {
      title: 'Progres Mutabaah',
      desc: 'Pantau progres mutabaahmu.',
      icon: HiOutlineDocumentText,
      link: '/mutabaah/tahsin',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      hover: 'hover:border-blue-300 hover:shadow-blue-100'
    },
    {
      title: 'Jadwal & Materi',
      desc: 'Cek kalender pertemuan dan topik materi pekan ini.',
      icon: HiOutlineCalendar,
      link: '/jadwal',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      hover: 'hover:border-amber-300 hover:shadow-amber-100'
    },
    
    {
      title: 'Sertifikat Kelulusan',
      desc: 'Unduh sertifikat kelulusan jika program sudah selesai.',
      icon: HiOutlineAcademicCap,
      link: '/sertifikat',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      hover: 'hover:border-indigo-300 hover:shadow-indigo-100'
    },
    {
      title: 'Pusat Informasi',
      desc: 'Pengumuman dan info terbaru dari KMF atau LPPIK.',
      icon: HiOutlineInformationCircle,
      link: '/informasi', // Ganti dengan link pengumuman jika ada
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      hover: 'hover:border-purple-300 hover:shadow-purple-100'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      {/* QUICK ACTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, idx) => (
          <Link 
            key={idx} 
            to={action.link} 
            className={`flex flex-col p-6 rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 ${action.hover} group`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${action.bg} ${action.color} transition-transform group-hover:scale-110`}>
                <action.icon />
              </div>
              <h3 className="font-bold text-gray-900 text-lg group-hover:text-gray-700 transition-colors">{action.title}</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              {action.desc}
            </p>
          </Link>
        ))}
      </div>

    </div>
  )
}