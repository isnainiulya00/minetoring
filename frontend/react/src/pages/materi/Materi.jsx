import { HiOutlineBookOpen, HiOutlineArrowDownTray } from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import Card, { CardHeader } from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { jadwalService } from '../../services/jadwalService'
import { halaqahService } from '../../services/halaqahService'
import { formatDate } from '../../utils/formatters'

export default function Materi() {
  const { data: jadwal, loading } = useApi(jadwalService.getAll, [])
  const { data: halaqah } = useApi(halaqahService.getAll, [])

  const halaqahMap = Object.fromEntries((halaqah ?? []).map((h) => [h.id, h.nama_kelompok]))

  return (
    <>
      <PageHeader
        title="Materi"
        subtitle="Distribusi materi per pertemuan mentoring"
      />

      {loading ? (
        <TableSkeleton rows={4} cols={2} />
      ) : !jadwal?.length ? (
        <EmptyState
          title="Belum ada materi"
          description="Materi diambil dari topik jadwal pertemuan. Tambahkan jadwal melalui admin."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jadwal.map((j) => (
            <Card key={j.id} hover glass>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <HiOutlineBookOpen className="h-5 w-5" />
              </div>
              <CardHeader
                title={j.topik}
                subtitle={`${halaqahMap[j.halaqah] || 'Halaqah'} · Pertemuan ${j.pertemuan_ke}`}
              />
              <p className="text-xs text-gray-500">{formatDate(j.tanggal)}</p>
              {j.laporan_kegiatan && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">{j.laporan_kegiatan}</p>
              )}
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <HiOutlineArrowDownTray className="h-4 w-4" />
                Unduh ringkasan
              </button>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
