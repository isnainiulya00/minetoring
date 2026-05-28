import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import { useApi } from '../../hooks/useApi'

// Import ketiga halaman asli
import UserManagement from './UserManagement'
import MentorManagement from './MentorManagement'
import MenteeManagement from './MenteeManagement'

// Import Service untuk menghitung total data secara real-time
import { userService } from '../../services/userService' // Sesuaikan jika nama servicenya berbeda
import { mentorService } from '../../services/mentorService'
import { menteeService } from '../../services/menteeService'

export default function UserHub() {
  const [activeTab, setActiveTab] = useState('user')

  // Fetch data ke masing-masing service untuk mendapatkan total data angka
  const { data: users } = useApi(userService.getAll, [])
  const { data: mentors } = useApi(mentorService.getAll, [])
  const { data: mentees } = useApi(menteeService.getAll, [])

  const userList = Array.isArray(users) ? users : (users?.results || [])
  const mentorList = Array.isArray(mentors) ? mentors : (mentors?.results || [])
  const menteeList = Array.isArray(mentees) ? mentees : (mentees?.results || [])

  // Menentukan Judul, Subtitle, dan Total Data berdasarkan Tab Aktif
  const tabDetails = {
    user: {
      title: "Manajemen User",
      subtitle: "Kelola data akun pengguna sistem",
      total: userList.length,
      label: "User"
    },
    mentor: {
      title: "Manajemen Mentor",
      subtitle: "Kelola akun milik mentor",
      total: mentorList.length,
      label: "Mentor"
    },
    mentee: {
      title: "Manajemen Mentee",
      subtitle: "Kelola akun milik mentee",
      total: menteeList.length,
      label: "Mentee"
    }
  }

  const currentTab = tabDetails[activeTab]

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* HEADER & TOGGLE/TOTAL DI KANAN SEJAJAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        
        {/* Judul dinamis langsung mengikuti toggle yang aktif */}
        <PageHeader 
          title={currentTab.title} 
          subtitle={currentTab.subtitle} 
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Buttons di Kanan Atas */}
          <div className="flex bg-white border border-gray-100 p-1 rounded-2xl shadow-sm">
            <button
              onClick={() => setActiveTab('user')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'user' ? 'bg-[#0f172a] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              User
            </button>
            <button
              onClick={() => setActiveTab('mentor')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'mentor' ? 'bg-[#0f172a] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Mentor
            </button>
            <button
              onClick={() => setActiveTab('mentee')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'mentee' ? 'bg-[#0f172a] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Mentee
            </button>
          </div>

          {/* Indikator Total Data sesuai Tab aktif */}
          <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2 h-[42px]">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Total {currentTab.label}:</span>
            <span className="text-base font-black text-gray-900">
              {currentTab.total}
            </span>
          </div>
        </div>
      </div>

      {/* AREA RENDER KONTEN SUB-HALAMAN */}
      <div className="mt-2">
        {activeTab === 'user' && <UserManagement isHubMode={true} />}
        {activeTab === 'mentor' && <MentorManagement isHubMode={true} />}
        {activeTab === 'mentee' && <MenteeManagement isHubMode={true} />}
      </div>
    </div>
  )
}