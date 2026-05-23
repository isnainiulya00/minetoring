import { useState, useMemo } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import AttendanceModal from './AttendanceModal'
import { useApi } from '../../hooks/useApi'

// Pastikan kamu punya service ini, kalau belum, buat formatnya persis seperti presensiService
import { jadwalService } from '../../services/jadwalService'
import { presensiService } from '../../services/presensiService'
import { menteeService } from '../../services/menteeService' 
import { halaqahService } from '../../services/halaqahService' 

import { PRESENSI_STATUS } from '../../utils/constants'

export default function PresensiMentee() {
  const [selectedJadwal, setSelectedJadwal] = useState('')
  const [selectedHalaqah, setSelectedHalaqah] = useState('') // 👈 Filter tambahan untuk kelompok
  const [modalRow, setModalRow] = useState(null)

  // Fetch semua data yang dibutuhkan
  const { data: presensiData, refetch: refetchPresensi } = useApi(presensiService.getAll, [])
  const { data: jadwalData } = useApi(jadwalService.getAll, [])
  const { data: halaqahData } = useApi(halaqahService.getAll, [])
  const { data: menteeData, loading: loadingMentee } = useApi(menteeService.getAll, [])

  // Normalisasi data dari Django (karena kadang dibungkus 'results')
  const jadwalList = Array.isArray(jadwalData) ? jadwalData : (jadwalData?.results || [])
  const halaqahList = Array.isArray(halaqahData) ? halaqahData : (halaqahData?.results || [])
  const menteeList = Array.isArray(menteeData) ? menteeData : (menteeData?.results || [])
  const presensiList = Array.isArray(presensiData) ? presensiData : (presensiData?.results || [])

  // Urutkan jadwal
  const sortedJadwal = useMemo(() => {
    return [...jadwalList].sort((a, b) => a.pertemuan_ke - b.pertemuan_ke)
  }, [jadwalList])

  // Cari detail pertemuan yang dipilih
  const selectedJadwalDetail = useMemo(() => {
    return sortedJadwal.find(j => String(j.id) === String(selectedJadwal))
  }, [selectedJadwal, sortedJadwal])

  // Logika Penggabungan Data (Mentee + Presensi)
  const filtered = useMemo(() => {
    if (!selectedJadwal || !selectedHalaqah) return []

    // 1. Saring Mentee yang hanya masuk di Kelompok/Halaqah yang dipilih
    const menteeKelompok = menteeList.filter(m => String(m.halaqah) === String(selectedHalaqah) || String(m.halaqah?.id) === String(selectedHalaqah))

    // 2. Saring Presensi hanya untuk Jadwal yang dipilih
    const presensiJadwal = presensiList.filter(p => String(p.jadwal) === String(selectedJadwal))

    // 3. Gabungkan Mentee dengan status absennya
    return menteeKelompok.map(mentee => {
      const existingPresensi = presensiJadwal.find(p => p.mentee === mentee.id)
      
      const namaHalaqah = halaqahList.find(h => String(h.id) === String(selectedHalaqah))?.nama_kelompok || '-'

      if (existingPresensi) {
        return {
          ...existingPresensi,
          mentee_nama: mentee.nama_lengkap, // Nama property disesuaikan dengan Modal kita
          nama_kelompok: namaHalaqah,
          pertemuan_ke: selectedJadwalDetail?.pertemuan_ke
        }
      } else {
        // Kalau belum diabsen, buat data dummy sementara
        return {
          id: `new-mentee-${mentee.id}`,
          jadwal: selectedJadwal,
          pertemuan_ke: selectedJadwalDetail?.pertemuan_ke,
          mentee: mentee.id, 
          mentee_nama: mentee.nama_lengkap,
          nama_kelompok: namaHalaqah,
          status: 'ALPHA', // Default
          catatan: ''
        }
      }
    })
  }, [selectedJadwal, selectedHalaqah, menteeList, presensiList, selectedJadwalDetail, halaqahList])

  return (
    <>
      <PageHeader 
        title="Presensi Mentee" 
        subtitle="Kelola kehadiran mentee berdasarkan kelompok halaqah" 
      />

      {/* FILTERING AREA */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {/* Filter Jadwal */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Pertemuan:</label>
          <select
            value={selectedJadwal}
            onChange={(e) => setSelectedJadwal(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">-- Pilih Jadwal --</option>
            {sortedJadwal.map((j) => (
              <option key={j.id} value={j.id}>#{j.pertemuan_ke} — {j.topik || 'Mentoring'}</option>
            ))}
          </select>
        </div>

        {/* Filter Kelompok / Halaqah */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Kelompok Halaqah:</label>
          <select
            value={selectedHalaqah}
            onChange={(e) => setSelectedHalaqah(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">-- Pilih Kelompok --</option>
            {halaqahList.map((h) => (
              <option key={h.id} value={h.id}>{h.nama_kelompok} ({h.tingkat})</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE AREA */}
      {loadingMentee ? (
        <TableSkeleton />
      ) : !selectedJadwal || !selectedHalaqah ? (
        <EmptyState title="Pilih Filter" description="Silakan pilih Jadwal dan Kelompok di atas untuk melihat daftar Mentee." />
      ) : filtered.length === 0 ? (
        <EmptyState title="Kosong" description="Tidak ada mentee di kelompok ini." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Nama Mentee</th>
                <th className="px-4 py-3">Pertemuan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const meta = PRESENSI_STATUS[row.status] || { label: 'Belum Ada', variant: 'neutral' }
                const isDummy = String(row.id).startsWith('new-')

                return (
                  <tr key={row.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-medium">{row.mentee_nama}</td>
                    <td className="px-4 py-3">#{row.pertemuan_ke || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={isDummy ? 'neutral' : meta.variant}>
                        {isDummy ? 'Belum Diisi' : meta.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" onClick={() => setModalRow(row)}>
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

      {/* MODAL KITA YANG SAKTI! 
        Tinggal panggil, ubah type="Mentee", dan serahkan semuanya padanya.
      */}
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