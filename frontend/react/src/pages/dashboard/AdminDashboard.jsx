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
import { analyticsService } from '../../services/analyticsService'
import HalaqohRekapTable from '../../components/rekap/HalaqohRekapTable'
import { useAuthStore } from '../../store/authStore'
import { formatPercent } from '../../utils/formatters'
import Card, { CardHeader } from '../../components/common/Card'

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: stats, loading } = useApi(analyticsService.overview, [])
  const { data: rekap, loading: rekapLoading } = useApi(analyticsService.rekapHalaqah, [])

  const presensi = stats?.presensi || {}
  const hadirCount = presensi.HADIR ?? 0
  const totalPresensi = Object.values(presensi).reduce((a, b) => a + b, 0)

  const chartData = [
    { name: 'Hadir', hadir: presensi.HADIR ?? 0 },
    { name: 'Izin', hadir: presensi.IZIN ?? 0 },
    { name: 'Sakit', hadir: presensi.SAKIT ?? 0 },
    { name: 'Alpha', hadir: presensi.ALPHA ?? 0 },
  ]

  const hafalanChart = [{ name: 'Hafalan', progress: stats?.total_hafalan ? 70 : 0 }]

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
            <StatCard icon={HiOutlineUserGroup} label="Total Halaqah" value={stats?.total_halaqah ?? 0} delay={0} />
            <StatCard icon={HiOutlineUserGroup} label="Total Mentor" value={stats?.total_mentor ?? 0} delay={1} />
            <StatCard icon={HiOutlineUserGroup} label="Total Mentee" value={stats?.total_mentee ?? 0} delay={2} />
            <StatCard
              icon={HiOutlineClipboardDocumentCheck}
              label="Kehadiran Hadir"
              value={hadirCount}
              trend={`${formatPercent(hadirCount, totalPresensi || 1)}% dari ${totalPresensi} presensi`}
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
              value={stats?.total_resume ?? 0}
              trend="Resume terkumpul"
              delay={4}
            />
            <StatCard
              icon={HiOutlineAcademicCap}
              label="Hafalan Lulus"
              value={stats?.total_hafalan ?? 0}
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
        <CardHeader title="Rekap per Halaqah" subtitle="Executive monitoring" />
        <HalaqohRekapTable data={rekap} loading={rekapLoading} />
      </Card>
    </div>
  )
}
