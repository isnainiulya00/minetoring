import {
  HiOutlineUserGroup,
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineChartBar,
} from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import { StatCardSkeleton } from '../../components/common/Skeleton'
import { AttendanceChart, HafalanChart } from '../../components/charts/DashboardChart'
import { useApi } from '../../hooks/useApi'
import { halaqahService } from '../../services/halaqahService'
import { mentorService } from '../../services/mentorService'
import { menteeService } from '../../services/menteeService'
import { presensiService } from '../../services/presensiService'
import { resumeService } from '../../services/resumeService'
import { hafalanService } from '../../services/hafalanService'
import { useAuthStore } from '../../store/authStore'
import { formatPercent } from '../../utils/formatters'
import Card, { CardHeader } from '../../components/common/Card'
import Badge from '../../components/common/Badge'

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: halaqah, loading: l1 } = useApi(halaqahService.getAll, [])
  const { data: mentors, loading: l2 } = useApi(mentorService.getAll, [])
  const { data: mentees, loading: l3 } = useApi(menteeService.getAll, [])
  const { data: presensi, loading: l4 } = useApi(presensiService.getAll, [])
  const { data: resumes, loading: l5 } = useApi(resumeService.getAll, [])
  const { data: hafalan, loading: l6 } = useApi(hafalanService.getAll, [])

  const loading = l1 || l2 || l3 || l4 || l5 || l6
  const hadirCount = presensi?.filter((p) => p.status === 'HADIR').length ?? 0
  const hafalanLulus = hafalan?.filter((h) => h.is_lulus).length ?? 0

  const chartData = [
    { name: 'Hadir', hadir: hadirCount },
    { name: 'Izin', hadir: presensi?.filter((p) => p.status === 'IZIN').length ?? 0 },
    { name: 'Sakit', hadir: presensi?.filter((p) => p.status === 'SAKIT').length ?? 0 },
    { name: 'Alpha', hadir: presensi?.filter((p) => p.status === 'ALPHA').length ?? 0 },
  ]

  const hafalanChart = (hafalan ?? []).slice(0, 6).map((h) => ({
    name: h.nama_surah?.slice(0, 10) || 'Surah',
    progress: h.is_lulus ? 100 : 45,
  }))

  return (
    <div>
      <PageHeader
        title={`Executive Overview — ${user?.first_name || user?.username}`}
        subtitle="Admin LPPIK · Monitoring & pengawasan sistem mentoring"
      />

      <div className="mb-6 rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-gray-50 p-4 shadow-sm glass-card">
        <p className="text-sm text-gray-600">
          Dashboard eksekutif untuk pengawasan LPPIK. Fokus monitoring statistik, halaqah, mentor, mentee, presensi, resume, dan hafalan.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={HiOutlineUserGroup} label="Total Halaqah" value={halaqah?.length ?? 0} delay={0} />
            <StatCard icon={HiOutlineUserGroup} label="Total Mentor" value={mentors?.length ?? 0} delay={1} />
            <StatCard icon={HiOutlineUserGroup} label="Total Mentee" value={mentees?.length ?? 0} delay={2} />
            <StatCard
              icon={HiOutlineClipboardDocumentCheck}
              label="Kehadiran Hadir"
              value={hadirCount}
              trend={`${formatPercent(hadirCount, presensi?.length || 1)}% dari ${presensi?.length ?? 0} presensi`}
              delay={3}
            />
          </>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {!loading && (
          <>
            <StatCard
              icon={HiOutlineDocumentText}
              label="Resume Terkumpul"
              value={resumes?.filter((r) => r.file).length ?? 0}
              trend={`${resumes?.length ?? 0} entri`}
              delay={4}
            />
            <StatCard
              icon={HiOutlineAcademicCap}
              label="Hafalan Lulus"
              value={`${hafalanLulus}/${hafalan?.length || 0}`}
              trend="Performance overview"
              delay={5}
            />
            <StatCard icon={HiOutlineChartBar} label="Mode" value="Monitor" trend="Read-only oversight" delay={6} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AttendanceChart data={chartData} />
        <HafalanChart data={hafalanChart.length ? hafalanChart : [{ name: '-', progress: 0 }]} />
      </div>

      <Card className="mt-6 glass-card" glass>
        <CardHeader title="Aktivitas Terbaru" subtitle="Ringkasan monitoring real-time" />
        <div className="space-y-3">
          {(presensi ?? []).slice(0, 5).map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-white/80 px-4 py-3"
            >
              <span className="text-sm text-gray-700">Presensi #{p.id}</span>
              <Badge variant={p.status === 'HADIR' ? 'success' : 'neutral'}>{p.status}</Badge>
            </div>
          ))}
          {!presensi?.length && <p className="text-sm text-gray-500">Belum ada aktivitas presensi.</p>}
        </div>
      </Card>
    </div>
  )
}
