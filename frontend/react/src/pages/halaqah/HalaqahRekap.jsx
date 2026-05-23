import { useMemo } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Table from '../../components/common/Table'
import { TableSkeleton } from '../../components/common/Skeleton'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { useApi } from '../../hooks/useApi'
import { halaqahService } from '../../services/halaqahService'
import { mentorService } from '../../services/mentorService'

export default function HalaqahRekap() {
  const { data: halaqah, loading: hLoading } = useApi(halaqahService.getAll, [])
  const { data: mentors, loading: mLoading } = useApi(mentorService.getAll, [])
  const loading = hLoading || mLoading

  // Memetakan ID mentor ke nama lengkapnya agar mudah ditampilkan
  const mentorMap = useMemo(() => {
    return Object.fromEntries((mentors ?? []).map((m) => [m.id, m.nama_lengkap]))
  }, [mentors])

  if (loading) return <TableSkeleton rows={6} cols={5} />

  return (
    <>
      <PageHeader
        title="Rekapitulasi Halaqah"
        subtitle="Laporan keseluruhan data kelompok mentoring"
        action={<Button variant="secondary">Ekspor Data</Button>} 
      />

      <Card glass className="mt-6">
        <Table
          columns={[
            { key: 'nama', label: 'Nama Kelompok' },
            { key: 'mentor', label: 'Mentor' },
            { key: 'semester', label: 'Semester' },
            { key: 'jumlah_mentee', label: 'Total Mentee' },
            { key: 'status', label: 'Status' },
          ]}
          data={halaqah ?? []}
          renderRow={(row) => (
            <>
              <td className="px-4 py-3 font-medium text-gray-900">{row.nama_kelompok}</td>
              <td className="px-4 py-3">{mentorMap[row.mentor] || row.mentor_nama || '-'}</td>
              <td className="px-4 py-3 text-gray-500">{row.semester_aktif || '-'}</td>
              <td className="px-4 py-3">{row.jumlah_mentee ?? 0} Orang</td>
              <td className="px-4 py-3">
                <Badge variant="success">Aktif</Badge>
              </td>
            </>
          )}
        />
        {(!halaqah || halaqah.length === 0) && (
          <div className="py-8 text-center text-sm text-gray-500">
            Data rekapitulasi halaqah masih kosong.
          </div>
        )}
      </Card>
    </>
  )
}