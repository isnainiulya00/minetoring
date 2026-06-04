import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import AttendanceModal from './AttendanceModal'
import { useApi } from '../../hooks/useApi'
import { jadwalService } from '../../services/jadwalService'
import { presensiService } from '../../services/presensiService'
import { mentorService } from '../../services/mentorService'
import { PRESENSI_STATUS } from '../../utils/constants'
import { exportRowsToExcel } from '../../utils/exportExcel'
// 👇 Import icon untuk tombol Excel
import { HiOutlineArrowDownTray } from 'react-icons/hi2'

export default function PresensiMentor() {
  const [selectedJadwal, setSelectedJadwal] = useState('')
  const [modalRow, setModalRow] = useState(null)

  // Ambil semua data (Jadwal, Presensi, dan Mentor)
  const { data: presensiData, loading: loadingPresensi, refetch: refetchPresensi } = useApi(presensiService.getAll, []) 
  const { data: jadwal } = useApi(jadwalService.getAll, [])
  const { data: mentorData, loading: loadingMentor } = useApi(mentorService.getAll, [])

  const jadwalList = useMemo(() => {
    return [...(jadwal ?? [])].sort((a, b) => a.pertemuan_ke - b.pertemuan_ke)
  }, [jadwal])

  // Cari detail jadwal yang sedang dipilih untuk keperluan nama pertemuan
  const selectedJadwalDetail = useMemo(() => {
    return jadwalList.find(j => String(j.id) === String(selectedJadwal))
  }, [selectedJadwal, jadwalList])

  // Logika baru: Gabungkan Mentor dengan Presensinya
  const filtered = useMemo(() => {
    if (!selectedJadwal) return []

    const mentors = Array.isArray(mentorData) ? mentorData : (mentorData?.results || [])
    const presensi = Array.isArray(presensiData) ? presensiData : (presensiData?.results || [])

    const presensiJadwal = presensi.filter(p => String(p.jadwal) === String(selectedJadwal))

    return mentors.map(mentor => {
      const existingPresensi = presensiJadwal.find(p => p.mentor === mentor.id)
      
      if (existingPresensi) {
        return {
          ...existingPresensi,
          mentor_nama: mentor.nama_lengkap, 
          nama_kelompok: mentor.nama_kelompok_halaqah || mentor.halaqah?.nama_kelompok || '-',
          pertemuan_ke: selectedJadwalDetail?.pertemuan_ke
        }
      } else {
        return {
          id: `new-${mentor.id}`, 
          jadwal: selectedJadwal,
          pertemuan_ke: selectedJadwalDetail?.pertemuan_ke,
          mentor: mentor.id,
          mentor_nama: mentor.nama_lengkap,
          nama_kelompok: mentor.nama_kelompok_halaqah || mentor.halaqah?.nama_kelompok || '-',
          status: 'ALPHA', 
          catatan: ''
        }
      }
    })
  }, [mentorData, presensiData, selectedJadwal, selectedJadwalDetail])

  const isLoading = loadingPresensi || loadingMentor

  const handleInputClick = (row) => {
    setModalRow(row) 
  }

  // 👇 FUNGSI SAKTI EXPORT EXCEL 👇
  const handleExportExcel = () => {
    if (!selectedJadwal || filtered.length === 0) {
      toast.error("Pilih pertemuan dan pastikan ada data untuk diexport!")
      return
    }

    const rows = filtered.map((r, index) => {
      // Tentukan status untuk di excel (Kalau masih dummy 'new-', tulis 'BELUM DIISI')
      const isDummy = String(r.id).startsWith('new-')
      const statusLabel = isDummy ? 'BELUM DIISI' : (PRESENSI_STATUS[r.status]?.label || r.status)

      return [
        index + 1,
        r.mentor_nama || '-',
        r.nama_kelompok || '-',
        `Pertemuan ${r.pertemuan_ke || '-'}`,
        statusLabel,
      ]
    })

    const fileName = `Rekap_Presensi_Mentor_P${selectedJadwalDetail?.pertemuan_ke || '?'}`
    exportRowsToExcel({
      columns: ['No', 'Nama Mentor', 'Kelompok Halaqah', 'Pertemuan Ke', 'Status'],
      rows,
      filename: `${fileName}_${new Date().toISOString().split('T')[0]}.xls`,
      sheetName: 'Presensi Mentor',
    })
    toast.success("Berhasil mendownload Excel!")
  }

  return (
    <>
      <PageHeader 
        title="Presensi Mentor" 
        subtitle="Kelola kehadiran mentor (Khusus KMF)" 
      />

      {/* 👇 Area Dropdown & Tombol Export Dijejerkan 👇 */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Filter Pertemuan</label>
          <select
            value={selectedJadwal}
            onChange={(e) => setSelectedJadwal(e.target.value)}
            className="w-full md:w-80 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all shadow-sm"
          >
            <option value="">-- Pilih Jadwal Pertemuan --</option>
            {jadwalList.map((j) => (
              <option key={j.id} value={j.id}>Pertemuan {j.pertemuan_ke} — {j.topik || 'Mentoring'}</option>
            ))}
          </select>
        </div>

        <Button variant="secondary" onClick={handleExportExcel} className="h-fit">
          <HiOutlineArrowDownTray className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : !selectedJadwal ? (
        <EmptyState title="Pilih Pertemuan" description="Silakan pilih jadwal pertemuan di atas untuk melihat daftar mentor." />
      ) : filtered.length === 0 ? (
        <EmptyState title="Belum ada mentor" description="Data mentor kosong. Tambahkan mentor di menu Manajemen Mentor terlebih dahulu." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama Mentor</th>
                <th className="px-6 py-4 font-semibold">Kelompok Halaqah</th>
                <th className="px-6 py-4 font-semibold text-center">Pertemuan</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
              {filtered.map((row) => {
                const meta = PRESENSI_STATUS[row.status] || { label: 'Belum Ada', variant: 'neutral' }
                const isDummy = String(row.id).startsWith('new-')

                return (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{row.mentor_nama}</td>
                    <td className="px-6 py-4 text-gray-600">{row.nama_kelompok}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-800">
                        P-{row.pertemuan_ke || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={isDummy ? 'neutral' : meta.variant}>
                        {isDummy ? 'Belum Diisi' : meta.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button size="sm" onClick={() => handleInputClick(row)} className="rounded-xl">
                        {isDummy ? 'Isi Kehadiran' : 'Edit'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL INPUT PRESENSI */}
      <AttendanceModal 
        open={Boolean(modalRow)} 
        presensiRow={modalRow} 
        onClose={() => setModalRow(null)} 
        onSaved={refetchPresensi} 
        type="Mentor"
      />
    </>
  )
}
