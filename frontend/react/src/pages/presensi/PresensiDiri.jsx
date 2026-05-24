import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { presensiService } from '../../services/presensiService'
import { PRESENSI_STATUS } from '../../utils/constants'

export default function PresensiDiri() {
  const { data: presensi, loading } = useApi(presensiService.getAll, [])

  if (loading) return <TableSkeleton rows={5} />
  console.log("Isi Data Presensi:", presensi);

  return (
    <>
      <PageHeader title="Presensi Diri" subtitle="Riwayat kehadiran mentoring Anda" />
      
      {presensi?.length === 0 ? (
        <EmptyState title="Belum ada data presensi" description="Mentor belum mengisi presensi Anda." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Pertemuan</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(presensi ?? []).map((row) => {
                const meta = PRESENSI_STATUS[row.status] || { label: row.status, variant: 'neutral' }
                return (
                  <tr key={row.id} className="border-b border-gray-50">
                    <td className="px-4 py-3">#{row.pertemuan_ke}</td>
                    <td className="px-4 py-3">
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}