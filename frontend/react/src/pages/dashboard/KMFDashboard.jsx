import { Link } from 'react-router-dom'
import {
  HiOutlineUserGroup,
  HiOutlineClipboardDocumentCheck,
  HiOutlineUsers,
  HiOutlineCalendarDays,
} from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import { StatCardSkeleton } from '../../components/common/Skeleton'
import { AttendanceChart } from '../../components/charts/DashboardChart'
import { useApi } from '../../hooks/useApi'
import { halaqahService } from '../../services/halaqahService'
import { menteeService } from '../../services/menteeService'
import { mentorService } from '../../services/mentorService'
import { presensiService } from '../../services/presensiService'
import { useAuthStore } from '../../store/authStore'
import Card, { CardHeader } from '../../components/common/Card'
import Button from '../../components/common/Button'

const QUICK_ACTIONS = [
  { to: '/users', label: 'User Management' },
  { to: '/mentor', label: 'Kelola Mentor' },
  { to: '/mentee', label: 'Kelola Mentee' },
  { to: '/halaqah', label: 'Kelola Halaqah' },
  { to: '/presensi', label: 'Presensi' },
  { to: '/jadwal', label: 'Jadwal' },
]

export default function KMFDashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: halaqah, loading: l1 } = useApi(halaqahService.getAll, [])
  const { data: mentees, loading: l2 } = useApi(menteeService.getAll, [])
  const { data: mentors, loading: l3 } = useApi(mentorService.getAll, [])
  const { data: presensi, loading: l4 } = useApi(presensiService.getAll, [])
  const loading = l1 || l2 || l3 || l4
  const hadir = presensi?.filter((p) => p.status === 'HADIR').length ?? 0

  const chartData = [
    { name: 'Hadir', hadir },
    { name: 'Lainnya', hadir: (presensi?.length ?? 0) - hadir },
  ]

  return (
    <div>
      <PageHeader
        title={`Management — ${user?.first_name || user?.username}`}
        subtitle="Koordinator Mentoring Fakultas"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={HiOutlineUserGroup} label="Halaqah" value={halaqah?.length ?? 0} />
            <StatCard icon={HiOutlineUsers} label="Mentor" value={mentors?.length ?? 0} />
            <StatCard icon={HiOutlineUsers} label="Mentee" value={mentees?.length ?? 0} />
            <StatCard icon={HiOutlineClipboardDocumentCheck} label="Presensi Hadir" value={hadir} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AttendanceChart data={chartData} />
        <Card glass>
          <CardHeader title="Quick Actions" subtitle="Akses cepat modul manajemen" />
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.to} to={a.to}>
                <Button variant="secondary" size="sm">
                  <HiOutlineCalendarDays className="h-4 w-4" />
                  {a.label}
                </Button>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
