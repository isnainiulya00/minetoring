import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { HiOutlineArrowDownTray } from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import SearchBar from '../../components/common/SearchBar'
import Table, { Pagination } from '../../components/common/Table'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { gradeService } from '../../services/gradeService'
import { menteeService } from '../../services/menteeService'
import { exportRowsToExcel } from '../../utils/exportExcel'

const PAGE_SIZE = 10

function normalizeList(data) {
  if (Array.isArray(data)) return data
  return data?.results ?? []
}

function statusBadge(row) {
  if (!row.grade) return <Badge variant="warning">Belum Dinilai</Badge>
  return row.status_lulus ? <Badge variant="success">Lulus</Badge> : <Badge variant="danger">Belum Lulus</Badge>
}

export default function LPPIKRecapGrade() {
  const { data, loading } = useApi(gradeService.getAll, [])
  const { data: menteesData, loading: menteesLoading } = useApi(menteeService.getAll, [])
  const grades = useMemo(() => normalizeList(data), [data])
  const mentees = useMemo(() => normalizeList(menteesData), [menteesData])

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)

  const rowsWithMentee = useMemo(() => {
    const gradeByUserId = new Map()
    grades.forEach((grade) => gradeByUserId.set(String(grade.mentee), grade))

    return mentees.map((mentee) => {
      const grade = gradeByUserId.get(String(mentee.user))
      return {
        id: mentee.id,
        grade,
        mentee: mentee.user,
        mentee_nama: grade?.mentee_nama || mentee.nama_lengkap || '-',
        mentee_nim: grade?.mentee_nim || mentee.nim || '-',
        mentee_prodi: grade?.mentee_prodi || mentee.prodi || '-',
        halaqah_nama: grade?.halaqah_nama || mentee.halaqah_nama || '-',
        aspek_1: grade?.aspek_1 ?? '-',
        aspek_2: grade?.aspek_2 ?? '-',
        aspek_3: grade?.aspek_3 ?? '-',
        aspek_4: grade?.aspek_4 ?? '-',
        aspek_5: grade?.aspek_5 ?? '-',
        total_nilai: grade?.total_nilai ?? '-',
        status_lulus: Boolean(grade?.status_lulus),
        dinilai_oleh_nama: grade?.dinilai_oleh_nama || '-',
      }
    })
  }, [grades, mentees])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rowsWithMentee.filter((row) => {
      const matchSearch = !q || `${row.mentee_nama ?? ''} ${row.mentee_nim ?? ''} ${row.halaqah_nama ?? ''} ${row.mentee_prodi ?? ''}`
        .toLowerCase()
        .includes(q)
      const matchStatus = status === 'ALL'
        || (status === 'LULUS' && row.grade && row.status_lulus)
        || (status === 'BELUM_LULUS' && row.grade && !row.status_lulus)
        || (status === 'BELUM_DINILAI' && !row.grade)
      return matchSearch && matchStatus
    })
  }, [rowsWithMentee, search, status])

  const stats = useMemo(() => {
    const graded = rowsWithMentee.filter((row) => row.grade)
    const passed = graded.filter((row) => row.status_lulus).length
    const totalScore = graded.reduce((sum, row) => sum + Number(row.total_nilai || 0), 0)
    return {
      total: rowsWithMentee.length,
      passed,
      failed: graded.filter((row) => !row.status_lulus).length,
      ungraded: Math.max(rowsWithMentee.length - graded.length, 0),
      average: graded.length ? Math.round(totalScore / graded.length) : 0,
    }
  }, [rowsWithMentee])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleExport = () => {
    if (!filtered.length) {
      toast.error('Tidak ada data untuk diexport.')
      return
    }

    const header = [
      'No',
      'Nama',
      'NIM',
      'Prodi',
      'Halaqah',
      'Aspek 1',
      'Aspek 2',
      'Aspek 3',
      'Aspek 4',
      'Aspek 5',
      'Total',
      'Status',
      'Dinilai Oleh',
    ]

    const rows = filtered.map((row, index) => [
      index + 1,
      row.mentee_nama,
      row.mentee_nim,
      row.mentee_prodi,
      row.halaqah_nama,
      row.aspek_1,
      row.aspek_2,
      row.aspek_3,
      row.aspek_4,
      row.aspek_5,
      row.total_nilai,
      row.grade ? (row.status_lulus ? 'Lulus' : 'Belum Lulus') : 'Belum Dinilai',
      row.dinilai_oleh_nama,
    ])

    exportRowsToExcel({
      columns: header,
      rows,
      filename: `Rekap_Nilai_Ujian_${new Date().toISOString().slice(0, 10)}.xls`,
      sheetName: 'Rekap Nilai',
    })
    toast.success('Rekap nilai berhasil didownload.')
  }

  return (
    <>
      <PageHeader
        title="Rekap Nilai Ujian"
        subtitle="Pantau hasil penilaian akhir seluruh mentee"
        action={(
          <Button variant="secondary" onClick={handleExport}>
            <HiOutlineArrowDownTray className="h-4 w-4" />
            Export Excel
          </Button>
        )}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Dinilai</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total - stats.ungraded}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Lulus</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.passed}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Belum Lulus</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{stats.failed}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Belum Dinilai</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{stats.ungraded}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          placeholder="Cari nama, NIM, prodi, atau halaqah..."
          className="w-full md:max-w-md"
        />
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 md:w-48"
        >
          <option value="ALL">Semua Status</option>
          <option value="LULUS">Lulus</option>
          <option value="BELUM_LULUS">Belum Lulus</option>
          <option value="BELUM_DINILAI">Belum Dinilai</option>
        </select>
      </div>

      {loading || menteesLoading ? (
        <TableSkeleton rows={7} cols={6} />
      ) : !rowsWithMentee.length ? (
        <EmptyState
          title="Belum ada data mentee"
          description="Rekap nilai akan tersedia setelah data mentee terdaftar."
        />
      ) : (
        <>
          <Table
            columns={[
              { key: 'mentee', label: 'Mentee' },
              { key: 'halaqah', label: 'Halaqah' },
              { key: 'aspek', label: 'Aspek' },
              { key: 'total', label: 'Total' },
              { key: 'status', label: 'Status' },
              { key: 'penilai', label: 'Penilai' },
            ]}
            data={paginated}
            emptyMessage="Tidak ada nilai yang cocok."
            renderRow={(row) => (
              <>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{row.mentee_nama || '-'}</p>
                  <p className="text-xs text-gray-500">{row.mentee_nim || '-'} - {row.mentee_prodi || '-'}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{row.halaqah_nama || '-'}</td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {[row.aspek_1, row.aspek_2, row.aspek_3, row.aspek_4, row.aspek_5].join(' / ')}
                </td>
                <td className="px-4 py-3 text-lg font-bold text-gray-900">{row.total_nilai}</td>
                <td className="px-4 py-3">{statusBadge(row)}</td>
                <td className="px-4 py-3 text-gray-600">{row.dinilai_oleh_nama || '-'}</td>
              </>
            )}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </>
  )
}
