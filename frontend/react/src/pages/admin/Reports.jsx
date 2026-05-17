import PageHeader from '../../components/common/PageHeader'
import Card, { CardHeader } from '../../components/common/Card'
import { useApi } from '../../hooks/useApi'
import { halaqahService } from '../../services/halaqahService'
import { mentorService } from '../../services/mentorService'
import { menteeService } from '../../services/menteeService'
import { presensiService } from '../../services/presensiService'
import { TableSkeleton } from '../../components/common/Skeleton'

export default function Reports() {
  const { data: halaqah, loading: l1 } = useApi(halaqahService.getAll, [])
  const { data: mentors, loading: l2 } = useApi(mentorService.getAll, [])
  const { data: mentees, loading: l3 } = useApi(menteeService.getAll, [])
  const { data: presensi, loading: l4 } = useApi(presensiService.getAll, [])
  const loading = l1 || l2 || l3 || l4

  if (loading) return <TableSkeleton />

  return (
    <div>
      <PageHeader title="Reports" subtitle="Laporan ringkas sistem mentoring" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card glass>
          <CardHeader title="Ringkasan Populasi" />
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Halaqah aktif: {halaqah?.length ?? 0}</li>
            <li>Total mentor: {mentors?.length ?? 0}</li>
            <li>Total mentee: {mentees?.length ?? 0}</li>
          </ul>
        </Card>
        <Card glass>
          <CardHeader title="Ringkasan Presensi" />
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Total entri presensi: {presensi?.length ?? 0}</li>
            <li>Hadir: {presensi?.filter((p) => p.status === 'HADIR').length ?? 0}</li>
            <li>Alpha: {presensi?.filter((p) => p.status === 'ALPHA').length ?? 0}</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
