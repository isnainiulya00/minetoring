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
import { mentorService } from '../../services/mentorService' // 👈 TAMBAHKAN INI
import { PRESENSI_STATUS } from '../../utils/constants'


export default function PresensiMentor() {
  const [selectedJadwal, setSelectedJadwal] = useState('')
  const [modalRow, setModalRow] = useState(null)

  // Ambil semua data (Jadwal, Presensi, dan Mentor)
  const { data: presensiData, loading: loadingPresensi, refetch: refetchPresensi } = useApi(presensiService.getAll, []) 
  const { data: jadwal } = useApi(jadwalService.getAll, [])
  const { data: mentorData, loading: loadingMentor } = useApi(mentorService.getAll, []) // 👈 TAMBAHKAN INI

  const jadwalList = useMemo(() => {
    return [...(jadwal ?? [])].sort((a, b) => a.pertemuan_ke - b.pertemuan_ke)
  }, [jadwal])

  // Cari detail jadwal yang sedang dipilih untuk keperluan nama pertemuan
  const selectedJadwalDetail = useMemo(() => {
    return jadwalList.find(j => String(j.id) === String(selectedJadwal))
  }, [selectedJadwal, jadwalList])

  // Logika baru: Gabungkan Mentor dengan Presensinya
  const filtered = useMemo(() => {
    // Jangan tampilkan apa-apa kalau belum memilih jadwal
    if (!selectedJadwal) return []

    // Pastikan data berbentuk array
    const mentors = Array.isArray(mentorData) ? mentorData : (mentorData?.results || [])
    const presensi = Array.isArray(presensiData) ? presensiData : (presensiData?.results || [])

    // Filter daftar presensi hanya untuk jadwal yang dipilih (dan asumsikan ini presensi mentor)
    // Jika backend kamu membedakan presensi mentor/mentee, pastikan filter 'is_mentor' diaktifkan.
    const presensiJadwal = presensi.filter(p => String(p.jadwal) === String(selectedJadwal))

    // Looping daftar semua mentor, lalu pasangkan dengan data presensinya (jika ada)
    return mentors.map(mentor => {
      // Cari apakah mentor ini sudah punya baris presensi di jadwal ini
      const existingPresensi = presensiJadwal.find(p => p.mentor === mentor.id)
      
      if (existingPresensi) {
        // Kalau sudah ada di database, gunakan data presensi tersebut
        return {
          ...existingPresensi,
          mentor_nama: mentor.nama_lengkap, // Ambil nama dari data mentor (karena API presensi kadang cuma kirim ID)
          nama_kelompok: mentor.nama_kelompok_halaqah || mentor.halaqah?.nama_kelompok || '-',
          pertemuan_ke: selectedJadwalDetail?.pertemuan_ke
        }
      } else {
        // Kalau BELUM ADA, buat objek "Presensi Kosong" / Default Alpha
        return {
          id: `new-${mentor.id}`, // ID sementara, sebagai tanda bahwa ini belum ada di DB
          jadwal: selectedJadwal,
          pertemuan_ke: selectedJadwalDetail?.pertemuan_ke,
          mentor: mentor.id,
          mentor_nama: mentor.nama_lengkap,
          nama_kelompok: mentor.nama_kelompok_halaqah || mentor.halaqah?.nama_kelompok || '-',
          status: 'ALPHA', // Default status
          catatan: ''
        }
      }
    })
  }, [mentorData, presensiData, selectedJadwal, selectedJadwalDetail])

  // Loading jika salah satu API belum selesai dipanggil
  const isLoading = loadingPresensi || loadingMentor

  // Custom handler saat tombol Input diklik
  const handleInputClick = (row) => {
    setModalRow(row) // Langsung lempar semua datanya utuh-utuh ke Modal!
  }

  return (
    <>
      <PageHeader 
        title="Presensi Mentor" 
        subtitle="Kelola kehadiran mentor (Khusus KMF)" 
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Pilih Pertemuan:</label>
        <select
          value={selectedJadwal}
          onChange={(e) => setSelectedJadwal(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">-- Pilih Jadwal Pertemuan --</option>
          {jadwalList.map((j) => (
            <option key={j.id} value={j.id}>#{j.pertemuan_ke} — {j.topik || 'Mentoring'}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : !selectedJadwal ? (
        <EmptyState title="Pilih Pertemuan" description="Silakan pilih jadwal pertemuan di atas untuk melihat daftar mentor." />
      ) : filtered.length === 0 ? (
        <EmptyState title="Belum ada mentor" description="Data mentor kosong. Tambahkan mentor di menu Manajemen Mentor terlebih dahulu." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Nama Mentor</th>
                <th className="px-4 py-3">Kelompok Halaqah</th>
                <th className="px-4 py-3">Pertemuan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const meta = PRESENSI_STATUS[row.status] || { label: 'Belum Ada', variant: 'neutral' }
                // Beri penanda visual jika presensi ini belum pernah disimpan sama sekali (hanya data dummy)
                const isDummy = String(row.id).startsWith('new-')

                return (
                  <tr key={row.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-medium">{row.mentor_nama}</td>
                    <td className="px-4 py-3">{row.nama_kelompok}</td>
                    <td className="px-4 py-3">#{row.pertemuan_ke || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={isDummy ? 'neutral' : meta.variant}>
                        {isDummy ? 'Belum Diisi' : meta.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" onClick={() => handleInputClick(row)}>
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