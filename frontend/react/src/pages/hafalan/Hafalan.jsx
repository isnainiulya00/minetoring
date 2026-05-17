import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import ProgressBar from '../../components/common/ProgressBar'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { hafalanService } from '../../services/hafalanService'
import { menteeService } from '../../services/menteeService'

export default function Hafalan() {
  const { data: hafalan, loading } = useApi(hafalanService.getAll, [])
  const { data: mentees } = useApi(menteeService.getAll, [])

  const menteeMap = Object.fromEntries((mentees ?? []).map((m) => [m.id, m.nama_lengkap]))

  return (
    <>
      <PageHeader title="Hafalan" subtitle="Tracking progress hafalan mentee" />

      {loading ? (
        <TableSkeleton rows={4} cols={2} />
      ) : !hafalan?.length ? (
        <EmptyState title="Belum ada data hafalan" description="Progress hafalan untuk tingkat Tahfidz." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {hafalan.map((h) => (
            <Card key={h.id} glass>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{h.nama_surah}</h3>
                  <p className="text-sm text-gray-500">{menteeMap[h.mentee] || 'Mentee'}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Ayat {h.ayat_awal} – {h.ayat_akhir}
                  </p>
                </div>
                <Badge variant={h.is_lulus ? 'success' : 'neutral'}>
                  {h.is_lulus ? 'Lulus' : 'Proses'}
                </Badge>
              </div>
              <div className="mt-4">
                <ProgressBar value={h.is_lulus ? 100 : 45} label="Progress hafalan" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

