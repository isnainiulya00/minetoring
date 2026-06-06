import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'
import { 
  HiOutlineClipboardCheck, 
  HiOutlineDocumentText, 
  HiOutlineUserGroup, 
  HiOutlineCalendar,
  HiOutlineBookOpen,
  HiOutlineInformationCircle
} from 'react-icons/hi'

export default function MentorDashboard() {
  const user = useAuthStore((state) => state.user)

  // Daftar Akses Cepat (Bebas Beban API & Anti-Error)
  const quickActions = [
    {
      title: 'Isi Presensi',
      desc: 'Catat kehadiran mentee di setiap pertemuan halaqah dengan cepat.',
      icon: HiOutlineClipboardCheck,
      link: '/presensi/mentee', // Pastikan sesuai rute kamu
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      hover: 'hover:border-emerald-300 hover:shadow-emerald-100'
    },
    {
      title: 'Update Mutabaah',
      desc: 'Pantau dan catat perkembangan mutabaah mentee.',
      icon: HiOutlineDocumentText,
      link: '/mutabaah',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      hover: 'hover:border-blue-300 hover:shadow-blue-100'
    },
    {
      title: 'Daftar Mentee',
      desc: 'Lihat data diri dan kelompok halaqah mahasiswa bimbinganmu.',
      icon: HiOutlineUserGroup,
      link: '/halaqah-saya',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      hover: 'hover:border-indigo-300 hover:shadow-indigo-100'
    },
    {
      title: 'Jadwal Pertemuan',
      desc: 'Cek kalender dan topik materi mentoring pekan ini.',
      icon: HiOutlineCalendar,
      link: '/jadwal',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      hover: 'hover:border-amber-300 hover:shadow-amber-100'
    },
    
    {
      title: 'Pusat Informasi',
      desc: 'Pengumuman dan informasi terbaru dari pengurus KMF.',
      icon: HiOutlineInformationCircle,
      link: '/informasi', // Ganti kalau ada rutenya
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