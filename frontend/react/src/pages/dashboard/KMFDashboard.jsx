import { Link } from 'react-router-dom'
import { HiOutlineUsers, HiOutlineClipboardDocumentCheck, HiOutlineUserGroup } from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import { useAuthStore } from '../../store/authStore'

export default function KMFDashboard() {
  const user = useAuthStore((s) => s.user)

  return (
    <>
      <PageHeader 
        title={`Selamat Datang, ${user?.first_name || 'KMF'}!`} 
        subtitle="Pusat kendali manajemen kegiatan mentoring" 
      />
      
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/management/mentors">
          <Card hover glass className="flex items-center gap-4 p-6 cursor-pointer">
            <div className="rounded-full bg-blue-100 p-4 text-blue-600">
              <HiOutlineUsers className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Data Mentor</h3>
              <p className="text-sm text-gray-500">Kelola pengajar</p>
            </div>
          </Card>
        </Link>

        <Link to="/management/mentees">
          <Card hover glass className="flex items-center gap-4 p-6 cursor-pointer">
            <div className="rounded-full bg-green-100 p-4 text-green-600">
              <HiOutlineUserGroup className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Data Mentee</h3>
              <p className="text-sm text-gray-500">Kelola peserta</p>
            </div>
          </Card>
        </Link>

        <Link to="/halaqah">
          <Card hover glass className="flex items-center gap-4 p-6 cursor-pointer">
            <div className="rounded-full bg-purple-100 p-4 text-purple-600">
              <HiOutlineClipboardDocumentCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Halaqah</h3>
              <p className="text-sm text-gray-500">Manajemen kelompok</p>
            </div>
          </Card>
        </Link>
      </div>
    </>
  )
}