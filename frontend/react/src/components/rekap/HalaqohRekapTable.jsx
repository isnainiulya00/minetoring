import Table from '../common/Table'
import Badge from '../common/Badge'
import EmptyState from '../common/EmptyState'
import { TableSkeleton } from '../common/Skeleton'

export default function HalaqohRekapTable({
  data,
  loading,
  showResume = true,
  showHafalan = true,
  showPresensi = true,
}) {
  if (loading) return <TableSkeleton />
  if (!data?.length) {
    return <EmptyState title="Belum ada data rekap" description="Inisialisasi semester pada halaman Halaqah." />
  }

  const cols = [
    { key: 'nama', label: 'Halaqah' },
    { key: 'mentee', label: 'Mentee' },
  ]
  if (showPresensi) {
    cols.push(
      { key: 'hadir', label: 'Hadir' },
      { key: 'izin', label: 'Izin' },
      { key: 'sakit', label: 'Sakit' },
      { key: 'alpha', label: 'Alpha' },
    )
  }
  if (showResume) cols.push({ key: 'resume', label: 'Resume' })
  if (showHafalan) cols.push({ key: 'hafalan', label: 'Hafalan' })

  return (
    <Table
      columns={cols}
      data={data}
      renderRow={(row) => (
        <>
          <td className="px-4 py-3">
            <p className="font-medium text-gray-900">{row.nama_kelompok}</p>
            <p className="text-xs text-gray-500">
              {row.tingkat} · {row.semester}
            </p>
          </td>
          <td className="px-4 py-3">{row.jumlah_mentee}</td>
          {showPresensi && (
            <>
              <td className="px-4 py-3 text-emerald-700">{row.presensi_hadir}</td>
              <td className="px-4 py-3 text-amber-700">{row.presensi_izin}</td>
              <td className="px-4 py-3 text-blue-700">{row.presensi_sakit}</td>
              <td className="px-4 py-3 text-red-700">{row.presensi_alpha}</td>
            </>
          )}
          {showResume && (
            <td className="px-4 py-3">
              <Badge variant={row.resume_terkumpul >= row.resume_total * 0.8 ? 'success' : 'warning'}>
                {row.resume_terkumpul}/{row.resume_total || '—'}
              </Badge>
            </td>
          )}
          {showHafalan && (
            <td className="px-4 py-3">
              {row.hafalan_lulus}/{row.hafalan_total}
            </td>
          )}
        </>
      )}
    />
  )
}
