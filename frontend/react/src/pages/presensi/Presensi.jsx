import { useMemo, useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import AttendanceModal from '../../components/presensi/AttendanceModal'
import HalaqohRekapTable from '../../components/rekap/HalaqohRekapTable'
import { useApi } from '../../hooks/useApi'
import { presensiService } from '../../services/presensiService'
import { jadwalService } from '../../services/jadwalService'
import { analyticsService } from '../../services/analyticsService'
import { PRESENSI_STATUS } from '../../utils/constants'
import { useAuthStore } from '../../store/authStore'
import { canEditPresensi, canViewRekapHalaqoh, isMonitoring, isMentor } from '../../utils/roleHelpers'

export default function Presensi() {
  const user = useAuthStore((s) => s.user)
  const [selectedJadwal, setSelectedJadwal] = useState('')
  const [modalRow, setModalRow] = useState(null)
  const [viewMode, setViewMode] = useState('input')

  const { data: presensi, loading, refetch } = useApi(presensiService.getAll, [])
  const { data: jadwal } = useApi(jadwalService.getAll, [])
  const { data: rekap, loading: rekapLoading } = useApi(
    () => (canViewRekapHalaqoh(user) ? analyticsService.rekapHalaqah() : Promise.resolve([])),
    [user?.role],
  )

  const jadwalList = useMemo(() => {
    const list = [...(jadwal ?? [])].sort((a, b) => a.pertemuan_ke - b.pertemuan_ke)
    return list
  }, [jadwal])

  const filtered = useMemo(() => {
    if (!selectedJadwal) return presensi ?? []
    return (presensi ?? []).filter((p) => String(p.jadwal) === String(selectedJadwal))
  }, [presensi, selectedJadwal])

  const groupedByMeeting = useMemo(() => {
    const map = {}
    for (const j of jadwalList) {
      map[j.id] = (presensi ?? []).filter((p) => p.jadwal === j.id)
    }
    return map
  }, [jadwalList, presensi])

  if (isMonitoring(user)) {
    return (
      <>
        <PageHeader title="Rekap Presensi" subtitle="Monitoring kehadiran per halaqah (LPPIK/KMF)" />
        <HalaqohRekapTable data={rekap} loading={rekapLoading} showResume={false} showHafalan={false} />
      </>
    )
  }

  if (isMentor(user) && viewMode === 'rekap') {
    return (
      <>
        <PageHeader
          title="Rekap Presensi"
          subtitle="Ringkasan kehadiran halaqah Anda"
          action={
            <Button variant="secondary" onClick={() => setViewMode('input')}>
              Mode Input
            </Button>
          }
        />
        <HalaqohRekapTable data={rekap} loading={rekapLoading} showResume={false} showHafalan={false} />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Presensi"
        subtitle={canEditPresensi(user) ? 'Isi kehadiran mentee per pertemuan' : 'Riwayat kehadiran Anda'}
        action={
          isMentor(user) && (
            <Button variant="secondary" onClick={() => setViewMode('rekap')}>
              Rekap Halaqah
            </Button>
          )
        }
      />

      {canEditPresensi(user) && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Pertemuan:</label>
          <select
            value={selectedJadwal}
            onChange={(e) => setSelectedJadwal(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Semua pertemuan</option>
            {jadwalList.map((j) => (
              <option key={j.id} value={j.id}>
                #{j.pertemuan_ke} — {j.topik || 'Pertemuan'} ({j.semester})
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Belum ada lembar presensi"
          description="KMF perlu inisialisasi semester di halaman Halaqah terlebih dahulu."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Mentee</th>
                <th className="px-4 py-3">Pertemuan</th>
                <th className="px-4 py-3">Status</th>
                {canEditPresensi(user) && <th className="px-4 py-3">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const meta = PRESENSI_STATUS[row.status] || { label: row.status, variant: 'neutral' }
                return (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium">{row.mentee_nama || row.mentee}</td>
                    <td className="px-4 py-3">#{row.pertemuan_ke}</td>
                    <td className="px-4 py-3">
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </td>
                    {canEditPresensi(user) && (
                      <td className="px-4 py-3">
                        <Button size="sm" onClick={() => setModalRow(row)}>
                          Input
                        </Button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <AttendanceModal
        open={Boolean(modalRow)}
        presensiRow={modalRow}
        onClose={() => setModalRow(null)}
        onSaved={refetch}
      />
    </>
  )
}
