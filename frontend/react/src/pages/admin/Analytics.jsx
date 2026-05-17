import { AttendanceChart, HafalanChart } from '../../components/charts/DashboardChart'
import PageHeader from '../../components/common/PageHeader'
import Card, { CardHeader } from '../../components/common/Card'
import { useApi } from '../../hooks/useApi'
import { presensiService } from '../../services/presensiService'
import { hafalanService } from '../../services/hafalanService'
import { TableSkeleton } from '../../components/common/Skeleton'

export default function Analytics() {
  const { data: presensi, loading: l1 } = useApi(presensiService.getAll, [])
  const { data: hafalan, loading: l2 } = useApi(hafalanService.getAll, [])
  const loading = l1 || l2

  const hadir = presensi?.filter((p) => p.status === 'HADIR').length ?? 0
  const chartData = [
    { name: 'Hadir', hadir },
    { name: 'Non-hadir', hadir: (presensi?.length ?? 0) - hadir },
  ]
  const hafalanChart = (hafalan ?? []).slice(0, 8).map((h) => ({
    name: h.nama_surah?.slice(0, 8) || '-',
    progress: h.is_lulus ? 100 : 40,
  }))

  if (loading) return <TableSkeleton />

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Analitik kehadiran & performa hafalan" />
      <div className="grid gap-6 lg:grid-cols-2">
        <AttendanceChart data={chartData} />
        <HafalanChart data={hafalanChart.length ? hafalanChart : [{ name: '-', progress: 0 }]} />
      </div>
      <Card className="mt-6" glass>
        <CardHeader title="Insight" subtitle="Ringkasan untuk pengambilan keputusan" />
        <p className="text-sm text-gray-600">
          Total presensi: {presensi?.length ?? 0}. Tingkat hadir:{' '}
          {presensi?.length ? Math.round((hadir / presensi.length) * 100) : 0}%.
        </p>
      </Card>
    </div>
  )
}
