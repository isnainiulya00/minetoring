import { useParams, Link } from 'react-router-dom'
import { HiOutlineArrowLeft } from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import Card, { CardHeader } from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { TableSkeleton } from '../../components/common/Skeleton'
import Table from '../../components/common/Table'
import { useApi } from '../../hooks/useApi'
import { halaqahService } from '../../services/halaqahService'
import { jadwalService } from '../../services/jadwalService'
import { menteeService } from '../../services/menteeService'
import { mentorService } from '../../services/mentorService'
import { formatDate } from '../../utils/formatters'
import { TINGKAT_HALAQAH } from '../../utils/constants'

export default function HalaqahDetail() {
  const { id } = useParams()
  const { data: halaqah, loading } = useApi(() => halaqahService.getById(id), [id])
  const { data: jadwal } = useApi(jadwalService.getAll, [])
  const { data: mentees } = useApi(menteeService.getAll, [])
  const { data: mentors } = useApi(mentorService.getAll, [])

  const mentor = mentors?.find((m) => m.id === halaqah?.mentor)
  const jadwalHalaqah = jadwal?.filter((j) => j.halaqah === Number(id)) ?? []

  if (loading) return <TableSkeleton rows={6} cols={4} />

  return (
    <>
      <Link to="/halaqah" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <HiOutlineArrowLeft /> Kembali
      </Link>
      <PageHeader
        title={halaqah?.nama_kelompok || 'Detail Halaqah'}
        subtitle={`Mentor: ${mentor?.nama_lengkap || '-'}`}
        action={<Badge variant="neutral">{TINGKAT_HALAQAH[halaqah?.tingkat] || halaqah?.tingkat}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card glass>
          <CardHeader title="Jadwal Mentoring" subtitle={`${jadwalHalaqah.length} pertemuan`} />
          <Table
            columns={[
              { key: 'pertemuan', label: 'Pertemuan' },
              { key: 'tanggal', label: 'Tanggal' },
              { key: 'topik', label: 'Topik' },
            ]}
            data={jadwalHalaqah}
            renderRow={(row) => (
              <>
                <td className="px-4 py-3">#{row.pertemuan_ke}</td>
                <td className="px-4 py-3">{formatDate(row.tanggal)}</td>
                <td className="px-4 py-3">{row.topik}</td>
              </>
            )}
          />
        </Card>

        <Card>
          <CardHeader title="Mentee" subtitle="Anggota kelompok" />
          <ul className="space-y-2">
            {(mentees ?? []).slice(0, 8).map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm">
                <span className="font-medium text-gray-800">{m.nama_lengkap}</span>
                <span className="text-gray-500">{m.nim}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
