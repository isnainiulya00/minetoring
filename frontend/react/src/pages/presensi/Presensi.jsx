import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import Table from '../../components/common/Table'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { presensiService } from '../../services/presensiService'
import { menteeService } from '../../services/menteeService'
import { jadwalService } from '../../services/jadwalService'
import { PRESENSI_STATUS } from '../../utils/constants'
import { formatDateTime } from '../../utils/formatters'
import { useAuthStore } from '../../store/authStore'
import { canEditPresensi } from '../../utils/roleHelpers'

export default function Presensi() {
  const user = useAuthStore((s) => s.user)
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)

  const { data: presensi, loading, refetch } = useApi(presensiService.getAll, [])
  const { data: mentees } = useApi(menteeService.getAll, [])
  const { data: jadwal } = useApi(jadwalService.getAll, [])

  const menteeMap = useMemo(
    () => Object.fromEntries((mentees ?? []).map((m) => [m.id, m.nama_lengkap])),
    [mentees],
  )

  const filtered = useMemo(
    () =>
      (presensi ?? []).filter((p) =>
        menteeMap[p.mentee]?.toLowerCase().includes(debounced.toLowerCase()),
      ),
    [presensi, debounced, menteeMap],
  )

  const STATUS_CYCLE = ['HADIR', 'IZIN', 'SAKIT', 'ALPHA']

  const cycleStatus = async (row, status) => {
    if (!canEditPresensi(user)) {
      toast.error('Anda tidak memiliki akses untuk mengubah presensi')
      return
    }
    try {
      await presensiService.update(row.id, { status })
      toast.success('Presensi diperbarui')
      refetch()
    } catch (err) {
      if (err.response?.status === 403) toast.error('Akses ditolak')
      else toast.error('Gagal memperbarui presensi')
    }
  }

  const nextStatus = (current) => {
    const i = STATUS_CYCLE.indexOf(current)
    return STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length]
  }

  return (
    <>
      <PageHeader
        title="Presensi"
        subtitle={canEditPresensi(user) ? 'Checklist kehadiran mentee' : 'Riwayat kehadiran Anda'}
      />
      <SearchBar value={search} onChange={setSearch} placeholder="Cari mentee..." className="mb-6 max-w-md" />

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState title="Belum ada data presensi" />
      ) : (
        <Table
          columns={[
            { key: 'mentee', label: 'Mentee' },
            { key: 'jadwal', label: 'Pertemuan' },
            { key: 'status', label: 'Status' },
            { key: 'waktu', label: 'Waktu Input' },
            ...(canEditPresensi(user) ? [{ key: 'aksi', label: 'Aksi' }] : []),
          ]}
          data={filtered}
          renderRow={(row) => {
            const status = PRESENSI_STATUS[row.status] || { label: row.status, variant: 'neutral' }
            const j = jadwal?.find((x) => x.id === row.jadwal)
            return (
              <>
                <td className="px-4 py-3 font-medium">{menteeMap[row.mentee] || row.mentee}</td>
                <td className="px-4 py-3">Pertemuan {j?.pertemuan_ke ?? row.jadwal}</td>
                <td className="px-4 py-3">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDateTime(row.waktu_input)}</td>
                {canEditPresensi(user) && (
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {STATUS_CYCLE.map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={row.status === s ? 'primary' : 'secondary'}
                          onClick={() => cycleStatus(row, s)}
                        >
                          {PRESENSI_STATUS[s]?.label || s}
                        </Button>
                      ))}
                      <Button size="sm" variant="ghost" onClick={() => cycleStatus(row, nextStatus(row.status))}>
                        Berikutnya
                      </Button>
                    </div>
                  </td>
                )}
              </>
            )
          }}
        />
      )}
    </>
  )
}
