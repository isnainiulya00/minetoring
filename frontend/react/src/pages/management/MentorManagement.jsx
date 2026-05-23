import { useState, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import Table, { Pagination } from '../../components/common/Table'
import Button from '../../components/common/Button'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { mentorService } from '../../services/mentorService'

const PAGE_SIZE = 8

export default function MentorManagement() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebounce(search)

  // Mengambil data dari API
  const { data: mentors, loading, refetch } = useApi(mentorService.getAll, [])

  useEffect(() => { setPage(1) }, [debounced])

  // Filter pencarian dengan pengaman Array
  const filtered = useMemo(() => {
    const q = debounced.toLowerCase()
    const mentorList = Array.isArray(mentors) ? mentors : (mentors?.results || [])
    
    return mentorList.filter(m => 
      (m.nama_lengkap || '').toLowerCase().includes(q) ||
      (m.nim || '').toLowerCase().includes(q) // 👈 Sekarang langsung mencari m.nim
    )
  }, [mentors, debounced])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data mentor ini? Perhatian: Akun login terkait mungkin perlu dihapus dari Manajemen User.')) return
    try {
      await mentorService.delete(id)
      toast.success('Mentor berhasil dihapus')
      refetch()
    } catch {
      toast.error('Gagal menghapus mentor')
    }
  }

  return (
    <>
      <PageHeader title="Manajemen Data Mentor" subtitle="Pantau dan kelola data mentor aktif" />
      
      <SearchBar 
        value={search} 
        onChange={setSearch} 
        placeholder="Cari nama atau NIM mentor..." 
        className="mb-6 max-w-md" 
      />

      {loading ? <TableSkeleton /> : (
        <>
          <Table
            columns={[
              { key: 'nim', label: 'NIM' },
              { key: 'nama', label: 'Nama Lengkap' },
              { key: 'halaqah', label: 'Kelompok Halaqah' },
              { key: 'aksi', label: 'Aksi' },
            ]}
            data={paginated}
            renderRow={(row) => (
              <>
                {/* 👇 NIM sekarang dipanggil langsung dari row.nim */}
                <td className="px-4 py-3 font-mono text-sm text-gray-600">{row.nim || '-'}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{row.nama_lengkap || '-'}</td>
                <td className="px-4 py-3 text-gray-600">
                  {row.halaqah?.nama_kelompok || row.nama_kelompok_halaqah || <span className="text-gray-400 italic">Belum ada halaqah</span>}
                </td>
                <td className="px-4 py-3">
                  {/* 👇 Tombol Edit sudah dihilangkan, sisa Hapus saja */}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Hapus</Button>
                </td>
              </>
            )}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </>
  )
}