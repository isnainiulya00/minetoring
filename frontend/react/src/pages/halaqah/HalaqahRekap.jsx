import { useState, useMemo, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import Table, { Pagination } from '../../components/common/Table'
import Badge from '../../components/common/Badge'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { halaqahService } from '../../services/halaqahService'
import { mentorService } from '../../services/mentorService'
import { menteeService } from '../../services/menteeService'

const PAGE_SIZE = 8

export default function HalaqahRekap() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebounce(search)

  // Fetch API
  const { data: halaqahs, loading } = useApi(halaqahService.getAll, [])
  const { data: mentors } = useApi(mentorService.getAll, [])
  const { data: mentees } = useApi(menteeService.getAll, [])

  // Reset page saat melakukan pencarian
  useEffect(() => { setPage(1) }, [debounced])

  // Logika Filter Pencarian
  const filtered = useMemo(() => {
    const q = debounced.toLowerCase()
    return (halaqahs ?? []).filter(h => 
      (h.nama_kelompok || '').toLowerCase().includes(q)
    )
  }, [halaqahs, debounced])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  // 👇 Hitung Total Mentor & Mentee langsung dari API
  const totalMentors = (mentors || []).length
  const totalMentees = (mentees || []).length

  // Fungsi Helper untuk menarik NIM dari data relasi
  const getMentorNim = (mentorId) => {
    if (!mentorId) return 'Belum Ada Mentor'
    const found = mentors?.find(m => m.id === mentorId)
    return found?.nim || mentorId
  }

  // Fungsi pintar menarik NIM Mentee
  const getMenteeNims = (menteeData) => {
    if (!menteeData || !Array.isArray(menteeData) || menteeData.length === 0) {
      return []
    }
    
    return menteeData.map(item => {
      if (typeof item === 'object' && item !== null) {
        return item.nim || item.nama_lengkap || '-'
      }
      const found = mentees?.find(m => String(m.id) === String(item))
      return found?.nim || item
    })
  }

  const getTingkatBadge = (tingkat) => {
    switch(tingkat) {
      case 'TAKHASUS': return <Badge variant="danger">Takhasus</Badge>
      case 'TAHSIN': return <Badge variant="warning">Tahsin</Badge>
      case 'TAHFIDZ': return <Badge variant="success">Tahfidz</Badge>
      default: return <Badge variant="neutral">{tingkat}</Badge>
    }
  }

  return (
    <>
      {/* 👇 HEADER & INDIKATOR TOTAL DIBIKIN SEJAJAR (KIRI - KANAN) 👇 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
        <PageHeader
          title="Rekapitulasi Halaqah"
          subtitle="Pantau daftar seluruh kelompok mentoring dan anggota mahasiswa"
        />
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border border-gray-100 px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Total Mentor:</span>
            <span className="text-base font-black text-emerald-600">{totalMentors}</span>
          </div>
          <div className="bg-white border border-gray-100 px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Total Mentee:</span>
            <span className="text-base font-black text-blue-600">{totalMentees}</span>
          </div>
        </div>
      </div>

      <SearchBar 
        value={search} 
        onChange={setSearch} 
        placeholder="Cari nama kelompok..." 
        className="mb-6 max-w-md" 
      />

      {loading ? <TableSkeleton /> : (
        <>
          <Table
            columns={[
              { key: 'nama', label: 'Nama Kelompok' },
              { key: 'tingkat', label: 'Tingkat' },
              { key: 'mentor', label: 'Mentor (NIM)' },
              { key: 'mentees', label: 'Mentee (NIM)' },
              { key: 'semester', label: 'Semester Aktif' },
            ]}
            data={paginated}
            renderRow={(row) => (
              <>
                <td className="px-4 py-3 font-medium text-gray-900">{row.nama_kelompok}</td>
                <td className="px-4 py-3">{getTingkatBadge(row.tingkat)}</td>
                <td className="px-4 py-3 text-gray-600 font-mono text-sm">{getMentorNim(row.mentor)}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-sm">
                  {Array.isArray(getMenteeNims(row.mentees)) && getMenteeNims(row.mentees).length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {getMenteeNims(row.mentees)?.map((nim, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-50 px-2 py-0.5 rounded border border-gray-100 w-fit"
                        >
                          {String(nim)} 
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{row.semester_aktif}</td>
              </>
            )}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </>
  )
}