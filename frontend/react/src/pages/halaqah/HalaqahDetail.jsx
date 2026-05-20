import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { HiOutlineArrowLeft } from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import Card, { CardHeader } from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { TableSkeleton } from '../../components/common/Skeleton'
import Table from '../../components/common/Table'
import { useApi } from '../../hooks/useApi'
import { halaqahService } from '../../services/halaqahService'
import { jadwalService } from '../../services/jadwalService'
import { menteeService } from '../../services/menteeService'
import { mentorService } from '../../services/mentorService'
import { useAuthStore } from '../../store/authStore'
import { canManageHalaqah } from '../../utils/roleHelpers'
import { formatDate } from '../../utils/formatters'
import { TINGKAT_HALAQAH } from '../../utils/constants'

export default function HalaqahDetail() {
  const { id } = useParams()
  const user = useAuthStore((s) => s.user)
  const canManage = canManageHalaqah(user)
  const { data: halaqah, loading, refetch } = useApi(() => halaqahService.getById(id), [id])
  const { data: jadwal, refetch: refetchJadwal } = useApi(jadwalService.getAll, [])
  const { data: mentees } = useApi(menteeService.getAll, [])
  const { data: mentors } = useApi(mentorService.getAll, [])

  const [semesterInput, setSemesterInput] = useState('')
  const [initLoading, setInitLoading] = useState(false)

  const mentor = mentors?.find((m) => m.id === halaqah?.mentor)
  const jadwalHalaqah = (jadwal ?? []).filter((j) => j.halaqah === Number(id))
  const menteesHalaqah = (mentees ?? []).filter((m) => m.halaqah === Number(id))

  const handleInitSemester = async () => {
    const semester = semesterInput || halaqah?.semester_aktif || `Ganjil-${new Date().getFullYear()}`
    setInitLoading(true)
    try {
      await halaqahService.initSemester(id, semester)
      toast.success(`Lembar semester ${semester} dibuat (12 pertemuan)`)
      refetch()
      refetchJadwal()
    } catch (err) {
      const msg = err.response?.data?.semester?.[0] || err.response?.data?.detail || 'Gagal inisialisasi'
      toast.error(String(msg))
    } finally {
      setInitLoading(false)
    }
  }

  if (loading) return <TableSkeleton rows={6} cols={4} />

  return (
    <>
      <Link to="/halaqah" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <HiOutlineArrowLeft /> Kembali
      </Link>
      <PageHeader
        title={halaqah?.nama_kelompok || 'Detail Halaqah'}
        subtitle={`Mentor: ${mentor?.nama_lengkap || '-'} · Semester: ${halaqah?.semester_aktif || '-'}`}
        action={<Badge variant="neutral">{TINGKAT_HALAQAH[halaqah?.tingkat] || halaqah?.tingkat}</Badge>}
      />

      {canManage && (
        <Card className="mb-6" glass>
          <CardHeader title="Inisialisasi Semester" subtitle="Buat 12 pertemuan + lembar presensi otomatis" />
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Nama semester</label>
              <input
                type="text"
                placeholder={halaqah?.semester_aktif || 'Ganjil-2026'}
                value={semesterInput}
                onChange={(e) => setSemesterInput(e.target.value)}
                className="mt-1 block rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <Button onClick={handleInitSemester} disabled={initLoading}>
              {initLoading ? 'Memproses...' : 'Buat Lembar Semester'}
            </Button>
          </div>
        </Card>
      )}

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
          <CardHeader title="Mentee" subtitle="Anggota kelompok & rekap kehadiran" />
          <ul className="space-y-2">
            {menteesHalaqah.length === 0 && (
              <p className="text-sm text-gray-500">Belum ada mentee di halaqah ini.</p>
            )}
            {menteesHalaqah.map((m) => (
              <li key={m.id} className="rounded-xl bg-gray-50 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{m.nama_lengkap}</span>
                  <span className="text-gray-500">{m.nim}</span>
                </div>
                {m.presensi_summary && (
                  <p className="mt-1 text-xs text-gray-500">
                    Hadir {m.presensi_summary.hadir}x · Izin {m.presensi_summary.izin}x · Sakit{' '}
                    {m.presensi_summary.sakit}x · Alpha {m.presensi_summary.alpha}x
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
