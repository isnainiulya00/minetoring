import { useParams, Link } from 'react-router-dom'
import { HiOutlineArrowLeft } from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Table from '../../components/common/Table'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { halaqahService } from '../../services/halaqahService'
import { menteeService } from '../../services/menteeService'

export default function HalaqahMember() {
  const { id } = useParams()
  
  // Mengambil data detail halaqah dan semua mentee
  const { data: halaqah, loading: halaqahLoading } = useApi(() => halaqahService.getById(id), [id])
  const { data: mentees, loading: menteesLoading } = useApi(menteeService.getAll, [])

  const loading = halaqahLoading || menteesLoading
  
  // Menyaring mentee yang hanya tergabung di kelompok ini
  const members = (mentees ?? []).filter((m) => m.halaqah === Number(id))

  if (loading) return <TableSkeleton rows={5} cols={4} />

  return (
    <>
      <Link to={`/halaqah/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <HiOutlineArrowLeft /> Kembali ke Detail
      </Link>

      <PageHeader
        title={`Anggota ${halaqah?.nama_kelompok || 'Halaqah'}`}
        subtitle="Daftar mentee yang tergabung dalam kelompok ini"
      />

      <Card glass className="mt-6">
        <Table
          columns={[
            { key: 'nim', label: 'NIM' },
            { key: 'nama', label: 'Nama Lengkap' },
            { key: 'prodi', label: 'Program Studi' },
          ]}
          data={members}
          renderRow={(row) => (
            <>
              <td className="px-4 py-3 font-medium text-gray-900">{row.nim}</td>
              <td className="px-4 py-3">{row.nama_lengkap}</td>
              <td className="px-4 py-3 text-gray-500">{row.prodi || 'Informatika'}</td>
            </>
          )}
        />
        {members.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            Belum ada anggota (mentee) di kelompok ini.
          </div>
        )}
      </Card>
    </>
  )
}