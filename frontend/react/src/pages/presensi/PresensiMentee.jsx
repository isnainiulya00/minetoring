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
import { menteeService } from '../../services/menteeService' 
import { halaqahService } from '../../services/halaqahService' 
import { PRESENSI_STATUS } from '../../utils/constants'
import { exportRowsToExcel } from '../../utils/exportExcel'

// Import Icon & Auth Store
import { HiOutlineArrowDownTray } from 'react-icons/hi2'
import { useAuthStore } from '../../store/authStore'

export default function PresensiMentee() {
  const [selectedJadwal, setSelectedJadwal] = useState('')
  const [selectedHalaqah, setSelectedHalaqah] = useState('') 
  const [modalRow, setModalRow] = useState(null)

  // Cek Role User
  const user = useAuthStore((state) => state.user)
  const isKMF = user?.role?.toUpperCase() === 'KMF' || user?.role?.toUpperCase() === 'KOORDINATOR'

  // Fetch API
  const { data: presensiData, refetch: refetchPresensi } = useApi(presensiService.getAll, [])
  const { data: jadwalData } = useApi(jadwalService.getAll, [])
  const { data: halaqahData } = useApi(halaqahService.getAll, [])
  const { data: menteeData, loading: loadingMentee } = useApi(menteeService.getAll, [])

  const jadwalList = Array.isArray(jadwalData) ? jadwalData : (jadwalData?.results || [])
  const halaqahList = Array.isArray(halaqahData) ? halaqahData : (halaqahData?.results || [])
  const menteeList = Array.isArray(menteeData) ? menteeData : (menteeData?.results || [])
  const presensiList = Array.isArray(presensiData) ? presensiData : (presensiData?.results || [])

  const sortedJadwal = useMemo(() => {
    return [...jadwalList].sort((a, b) => a.pertemuan_ke - b.pertemuan_ke)
  }, [jadwalList])

  const selectedJadwalDetail = useMemo(() => {
    return sortedJadwal.find(j => String(j.id) === String(selectedJadwal))
  }, [selectedJadwal, sortedJadwal])

  // Logika Filter & Penggabungan Data
  const filtered = useMemo(() => {
    if (!selectedJadwal) return []
    // Mentor wajib pilih halaqah, KMF boleh melihat semua (kosong)
    if (!isKMF && !selectedHalaqah) return []

    let menteeKelompok = menteeList
    if (selectedHalaqah) {
      menteeKelompok = menteeList.filter(m => String(m.halaqah) === String(selectedHalaqah) || String(m.halaqah?.id) === String(selectedHalaqah))
    }

    const presensiJadwal = presensiList.filter(p => String(p.jadwal) === String(selectedJadwal))

    const mappedData = menteeKelompok.map(mentee => {
      const existingPresensi = presensiJadwal.find(p => p.mentee === mentee.id)
      
      const hId = mentee.halaqah?.id || mentee.halaqah
      const namaHalaqah = halaqahList.find(h => String(h.id) === String(hId))?.nama_kelompok || 'Belum Ada Kelompok'

      if (existingPresensi) {
        return {
          ...existingPresensi,
          mentee_nama: mentee.nama_lengkap, 
          nama_kelompok: namaHalaqah,
          pertemuan_ke: selectedJadwalDetail?.pertemuan_ke,
          isDummy: false
        }
      } else {
        return {
          id: `new-mentee-${mentee.id}`,
          jadwal: selectedJadwal,
          pertemuan_ke: selectedJadwalDetail?.pertemuan_ke,
          mentee: mentee.id, 
          mentee_nama: mentee.nama_lengkap,
          nama_kelompok: namaHalaqah,
          status: 'ALPHA', 
          catatan: '',
          isDummy: true
        }
      }
    })

    // Auto-sort A-Z berdasarkan kelompok, lalu nama
    return mappedData.sort((a, b) => {
      const compareHalaqah = a.nama_kelompok.localeCompare(b.nama_kelompok)
      if (compareHalaqah !== 0) return compareHalaqah
      return (a.mentee_nama || '').localeCompare(b.mentee_nama || '')
    })
  }, [selectedJadwal, selectedHalaqah, menteeList, presensiList, selectedJadwalDetail, halaqahList, isKMF])

  // FUNGSI EXPORT KHUSUS KMF
  const handleExportExcel = () => {
    if (!selectedJadwal) {
      toast.error("Pilih pertemuan terlebih dahulu!")
      return
    }

    const presensiJadwal = presensiList.filter(p => String(p.jadwal) === String(selectedJadwal))
    
    const allDataForExport = menteeList.map(mentee => {
      const existingPresensi = presensiJadwal.find(p => p.mentee === mentee.id)
      const hId = mentee.halaqah?.id || mentee.halaqah
      const namaHalaqah = halaqahList.find(h => String(h.id) === String(hId))?.nama_kelompok || 'Belum Ada Kelompok'

      return {
        mentee_nama: mentee.nama_lengkap,
        nama_kelompok: namaHalaqah,
        pertemuan_ke: selectedJadwalDetail?.pertemuan_ke,
        statusLabel: existingPresensi ? (PRESENSI_STATUS[existingPresensi.status]?.label || existingPresensi.status) : 'BELUM DIISI'
      }
    })

    allDataForExport.sort((a, b) => {
      const compareHalaqah = a.nama_kelompok.localeCompare(b.nama_kelompok)
      if (compareHalaqah !== 0) return compareHalaqah
      return (a.mentee_nama || '').localeCompare(b.mentee_nama || '')
    })

    const rows = allDataForExport.map((r, index) => [
        index + 1,
        r.mentee_nama || '-',
        r.nama_kelompok || '-',
        `Pertemuan ${r.pertemuan_ke || '-'}`,
        r.statusLabel,
    ])

    const fileName = `Rekap_Presensi_Mentee_Global_P${selectedJadwalDetail?.pertemuan_ke || '?'}`
    exportRowsToExcel({
      columns: ['No', 'Nama Mentee', 'Kelompok Halaqah', 'Pertemuan Ke', 'Status Kehadiran'],
      rows,
      filename: `${fileName}_${new Date().toISOString().split('T')[0]}.xls`,
      sheetName: 'Presensi Mentee',
    })
    toast.success("Berhasil mendownload Excel Global!")
  }

  const isLoading = loadingMentee

  return (
    <>
      <PageHeader 
        title="Presensi Mentee" 
        subtitle={isKMF ? "Rekapitulasi dan kelola kehadiran seluruh mahasiswa" : "Kelola kehadiran mentee berdasarkan kelompok halaqah"} 
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Pertemuan:</label>
            <select
              value={selectedJadwal}
              onChange={(e) => setSelectedJadwal(e.target.value)}
              className="w-full md:w-64 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
            >
              <option value="">-- Pilih Jadwal --</option>
              {sortedJadwal.map((j) => (
                <option key={j.id} value={j.id}>Pertemuan {j.pertemuan_ke} — {j.topik || 'Mentoring'}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Kelompok Halaqah:</label>
            <select
              value={selectedHalaqah}
              onChange={(e) => setSelectedHalaqah(e.target.value)}
              className="w-full md:w-64 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
            >
              <option value="">{isKMF ? '-- Semua Kelompok --' : '-- Pilih Kelompok Anda --'}</option>
              {halaqahList.map((h) => (
                <option key={h.id} value={h.id}>{h.nama_kelompok} ({h.tingkat})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tombol Export KHUSUS KMF */}
        {isKMF && (
          <Button variant="secondary" onClick={handleExportExcel} className="h-fit">
            <HiOutlineArrowDownTray className="h-4 w-4" />
            Export Excel
          </Button>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : !selectedJadwal ? (
        <EmptyState title="Pilih Pertemuan" description="Silakan pilih Jadwal Pertemuan terlebih dahulu." />
      ) : (!isKMF && !selectedHalaqah) ? (
        <EmptyState title="Pilih Kelompok" description="Silakan pilih Kelompok Halaqah Anda untuk melihat dan mengisi daftar hadir." />
      ) : filtered.length === 0 ? (
        <EmptyState title="Kosong" description="Tidak ada mentee di kelompok yang dipilih." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama Mentee</th>
                <th className="px-6 py-4 font-semibold">Kelompok Halaqah</th>
                <th className="px-6 py-4 font-semibold text-center">Pertemuan</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                {/* Kolom Aksi sekarang nyala untuk KMF & Mentor */}
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
              {filtered.map((row) => {
                const meta = PRESENSI_STATUS[row.status] || { label: 'Belum Ada', variant: 'neutral' }

                return (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{row.mentee_nama}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-100">
                        {row.nama_kelompok}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-800">
                        P-{row.pertemuan_ke || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={row.isDummy ? 'neutral' : meta.variant}>
                        {row.isDummy ? 'Belum Diisi' : meta.label}
                      </Badge>
                    </td>
                    
                    {/* Tombol Input & Edit nyala untuk semua yang punya akses ke halaman ini */}
                    <td className="px-6 py-4 text-center">
                      <Button size="sm" onClick={() => setModalRow(row)} className="rounded-lg">
                        {row.isDummy ? 'Isi Kehadiran' : 'Edit'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nyala untuk semuanya */}
      <AttendanceModal 
        open={Boolean(modalRow)} 
        presensiRow={modalRow} 
        onClose={() => setModalRow(null)} 
        onSaved={refetchPresensi} 
        type="Mentee" 
      />
    </>
  )
}
