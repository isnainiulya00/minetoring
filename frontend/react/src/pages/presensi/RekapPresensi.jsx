import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'

import { jadwalService } from '../../services/jadwalService'
import { presensiService } from '../../services/presensiService'
import { menteeService } from '../../services/menteeService' 
import { halaqahService } from '../../services/halaqahService' 
import { mentorService } from '../../services/mentorService'

import { PRESENSI_STATUS } from '../../utils/constants'
import { HiOutlineDocumentDownload } from 'react-icons/hi'
import { useAuthStore } from '../../store/authStore'

export default function RekapPresensi() {
  const [selectedJadwal, setSelectedJadwal] = useState('')
  const [selectedHalaqah, setSelectedHalaqah] = useState('') 
  const [activeTab, setActiveTab] = useState('mentee')

  const user = useAuthStore((state) => state.user)
  const isKMF = user?.role?.toUpperCase() === 'KMF' || user?.role?.toUpperCase() === 'KOORDINATOR'

  // Fetch API
  const { data: jadwalData } = useApi(jadwalService.getAll, [])
  const { data: halaqahData } = useApi(halaqahService.getAll, [])
  
  // Fetch Data Mentee
  const { data: menteeData, loading: loadingMentee } = useApi(menteeService.getAll, [])
  const { data: presensiData } = useApi(presensiService.getAll, [])
  
  // Fetch Data Mentor
  const { data: mentorData, loading: loadingMentor } = useApi(mentorService.getAll, [])
  const { data: presensiMentorData } = useApi(presensiService.getAll, [])

  const jadwalList = Array.isArray(jadwalData) ? jadwalData : (jadwalData?.results || [])
  const halaqahList = Array.isArray(halaqahData) ? halaqahData : (halaqahData?.results || [])
  
  const menteeList = Array.isArray(menteeData) ? menteeData : (menteeData?.results || [])
  const presensiList = Array.isArray(presensiData) ? presensiData : (presensiData?.results || [])

  const mentorList = Array.isArray(mentorData) ? mentorData : (mentorData?.results || [])
  const presensiMentorList = Array.isArray(presensiMentorData) ? presensiMentorData : (presensiMentorData?.results || [])

  const sortedJadwal = useMemo(() => {
    return [...jadwalList].sort((a, b) => a.pertemuan_ke - b.pertemuan_ke)
  }, [jadwalList])

  const selectedJadwalDetail = useMemo(() => {
    return sortedJadwal.find(j => String(j.id) === String(selectedJadwal))
  }, [selectedJadwal, sortedJadwal])

  // ===================== LOGIKA DATA MENTEE =====================
  const filteredMentee = useMemo(() => {
    if (!selectedJadwal) return []
    let menteeKelompok = menteeList
    if (selectedHalaqah) {
      menteeKelompok = menteeList.filter(m => String(m.halaqah) === String(selectedHalaqah) || String(m.halaqah?.id) === String(selectedHalaqah))
    }
    const presensiJadwal = presensiList.filter(p => String(p.jadwal) === String(selectedJadwal))
    const mappedData = menteeKelompok.map(mentee => {
      const existingPresensi = presensiJadwal.find(p => p.mentee === mentee.id)
      const hId = mentee.halaqah?.id || mentee.halaqah
      const namaHalaqah = halaqahList.find(h => String(h.id) === String(hId))?.nama_kelompok || 'Belum Ada Kelompok'
      return existingPresensi 
        ? { ...existingPresensi, mentee_nama: mentee.nama_lengkap, nama_kelompok: namaHalaqah, pertemuan_ke: selectedJadwalDetail?.pertemuan_ke, isDummy: false }
        : { id: `new-mentee-${mentee.id}`, jadwal: selectedJadwal, pertemuan_ke: selectedJadwalDetail?.pertemuan_ke, mentee: mentee.id, mentee_nama: mentee.nama_lengkap, nama_kelompok: namaHalaqah, status: 'ALPHA', isDummy: true }
    })
    return mappedData.sort((a, b) => a.nama_kelompok.localeCompare(b.nama_kelompok) || (a.mentee_nama || '').localeCompare(b.mentee_nama || ''))
  }, [selectedJadwal, selectedHalaqah, menteeList, presensiList, selectedJadwalDetail, halaqahList]) 

  // ===================== LOGIKA DATA MENTOR =====================
  const filteredMentor = useMemo(() => {
    if (!selectedJadwal) return []
    const presensiJadwalMentor = presensiMentorList.filter(p => String(p.jadwal) === String(selectedJadwal))
    const mappedData = mentorList.map(mentor => {
      const existingPresensi = presensiJadwalMentor.find(p => p.mentor === mentor.id)
      const namaLengkap = mentor.nama_lengkap || mentor.user?.nama || mentor.nama || 'Tanpa Nama'
      const nimMentor = mentor.nim || mentor.user?.username || '-'
      return existingPresensi
        ? { ...existingPresensi, mentor_nama: namaLengkap, mentor_nim: nimMentor, pertemuan_ke: selectedJadwalDetail?.pertemuan_ke, isDummy: false }
        : { id: `new-mentor-${mentor.id}`, jadwal: selectedJadwal, pertemuan_ke: selectedJadwalDetail?.pertemuan_ke, mentor: mentor.id, mentor_nama: namaLengkap, mentor_nim: nimMentor, status: 'ALPHA', isDummy: true }
    })
    return mappedData.sort((a, b) => (a.mentor_nama || '').localeCompare(b.mentor_nama || ''))
  }, [selectedJadwal, mentorList, presensiMentorList, selectedJadwalDetail])

  const isLoading = activeTab === 'mentee' ? loadingMentee : loadingMentor
  const currentTotalFilled = activeTab === 'mentee' 
    ? filteredMentee.filter(item => !item.isDummy).length 
    : filteredMentor.filter(item => !item.isDummy).length

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* HEADER & TOGGLE/TOTAL DI KANAN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <PageHeader 
          title="Rekapitulasi Presensi Global" 
          subtitle="Monitoring kehadiran seluruh peserta dan mentor" 
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Tab */}
          <div className="flex bg-white border border-gray-100 p-1 rounded-2xl shadow-sm">
            <button
              onClick={() => setActiveTab('mentee')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'mentee' ? 'bg-[#0f172a] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Mentee
            </button>
            <button
              onClick={() => setActiveTab('mentor')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'mentor' ? 'bg-[#0f172a] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Mentor
            </button>
          </div>

          {/* Indikator Sudah Presensi */}
          <div className="bg-white border border-gray-100 px-5 py-2 rounded-2xl shadow-sm flex items-center gap-2 h-[42px]">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Sudah Presensi:</span>
            <span className={`text-base font-black ${activeTab === 'mentee' ? 'text-blue-600' : 'text-emerald-600'}`}>
              {currentTotalFilled}
            </span>
          </div>
        </div>
      </div>

      {/* TOOLBAR FILTER */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
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

          {activeTab === 'mentee' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Kelompok Halaqah:</label>
              <select
                value={selectedHalaqah}
                onChange={(e) => setSelectedHalaqah(e.target.value)}
                className="w-full md:w-64 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
              >
                <option value="">-- Semua Kelompok --</option>
                {halaqahList.map((h) => (
                  <option key={h.id} value={h.id}>{h.nama_kelompok} ({h.tingkat})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {isKMF && (
          <button 
            onClick={() => toast.error("Fitur Export Excel segera hadir")}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 h-[42px]"
          >
            <HiOutlineDocumentDownload className="text-xl" />
            Export Excel
          </button>
        )}
      </div>

      {/* RENDER TABEL */}
      {isLoading ? (
        <TableSkeleton />
      ) : !selectedJadwal ? (
        <EmptyState title="Pilih Pertemuan" description="Pilih Jadwal Pertemuan terlebih dahulu untuk memantau data presensi." />
      ) : activeTab === 'mentee' ? (
        filteredMentee.length === 0 ? (
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                {filteredMentee.map((row) => {
                  const meta = PRESENSI_STATUS[row.status] || { label: 'Belum Ada', variant: 'neutral' }
                  return (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
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
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        filteredMentor.length === 0 ? (
          <EmptyState title="Kosong" description="Tidak ada data mentor yang ditemukan." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Identitas Mentor</th>
                  <th className="px-6 py-4 font-semibold text-center">Pertemuan</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                {filteredMentor.map((row) => {
                  const meta = PRESENSI_STATUS[row.status] || { label: 'Belum Ada', variant: 'neutral' }
                  return (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{row.mentor_nama}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{row.mentor_nim}</p>
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
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}