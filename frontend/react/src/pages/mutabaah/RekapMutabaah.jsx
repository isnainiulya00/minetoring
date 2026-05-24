import React, { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import { HiOutlineDocumentDownload, HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi'

export default function RekapMutabaah() {
  const [dataRekap, setDataRekap] = useState([])
  const [loading, setLoading] = useState(true)
  
  // State untuk Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKategori, setSelectedKategori] = useState('ALL')
  const [selectedHalaqah, setSelectedHalaqah] = useState('ALL')

  const accessToken = localStorage.getItem('mine_toring_access')

  // 1. Tarik Data dari Backend
  useEffect(() => {
    const fetchGlobalMutabaah = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/mutabaahs/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        const data = Array.isArray(res.data) ? res.data : (res.data.results || [])
        setDataRekap(data)
      } catch (err) {
        toast.error("Gagal memuat data rekap mutabaah")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchGlobalMutabaah()
  }, [accessToken])

  // 2. Ambil List Halaqah Unik untuk Dropdown Filter
  const listHalaqahUnik = useMemo(() => {
    const setHalaqah = new Set(dataRekap.map(item => item.nama_halaqah || 'Tanpa Kelompok'))
    return ['ALL', ...Array.from(setHalaqah)]
  }, [dataRekap])

  // 3. Logika Filter Data (Search + Dropdown)
  const dataTerfilter = useMemo(() => {
    return dataRekap.filter(item => {
      const namaMentee = (item.nama_mentee || '').toLowerCase()
      const nimMentee = (item.nim_mentee || '').toLowerCase()
      const materi = (item.materi_bacaan || '').toString().toLowerCase()
      const halaqah = item.nama_halaqah || 'Tanpa Kelompok'
      
      let kategoriItem = 'TAHSIN' // Default
      
      // Deteksi Takhasus: Jika ada kata "iqro" ATAU isinya cuma angka (misal: "6")
      if (materi.includes('iqro') || /^[0-9]+$/.test(materi.trim())) {
        kategoriItem = 'TAKHASUS'
      } 
      // Deteksi Tahfidz: Jika ada kata "juz", "surah", atau "hafal"
      else if (materi.includes('juz') || materi.includes('surah') || materi.includes('hafal')) {
        kategoriItem = 'TAHFIDZ'
      }

      const matchSearch = namaMentee.includes(searchQuery.toLowerCase()) || nimMentee.includes(searchQuery.toLowerCase())
      const matchKategori = selectedKategori === 'ALL' || kategoriItem === selectedKategori
      const matchHalaqah = selectedHalaqah === 'ALL' || halaqah === selectedHalaqah

      return matchSearch && matchKategori && matchHalaqah
    })
  }, [dataRekap, searchQuery, selectedKategori, selectedHalaqah])

  // 4. Hitung Statistik Cepat (KPI Cards)
  const stats = useMemo(() => {
    const total = dataTerfilter.length
    const totalNilai = dataTerfilter.reduce((acc, curr) => acc + (curr.nilai || 0), 0)
    const rataRata = total > 0 ? (totalNilai / total).toFixed(1) : '0'
    return { totalMentee: total, rataNilai: rataRata }
  }, [dataTerfilter])

  // 5. Logika Grouping per Halaqah untuk Tabel
  const groupedData = useMemo(() => {
    const groups = {}
    dataTerfilter.forEach(item => {
      const halaqahName = item.nama_halaqah || 'Tanpa Kelompok'
      if (!groups[halaqahName]) {
        groups[halaqahName] = []
      }
      groups[halaqahName].push(item)
    })
    return groups
  }, [dataTerfilter])

  // 6. FUNGSI SAKTI EXPORT TO EXCEL
  const handleExportExcel = () => {
    if (dataTerfilter.length === 0) {
      toast.error("Tidak ada data untuk diexport")
      return
    }

    let csvContent = "No,Nama Mentee,Halaqah/Kelompok,Pertemuan Ke,Materi Bacaan,Rentang Halaman,Nilai,Tanggal Input\n"
    
    dataTerfilter.forEach((r, index) => {
      const baris = [
        index + 1,
        `"${r.nama_mentee || 'Mentee'}"`,
        `"${r.nama_halaqah || '-'}"`,
        `"Pertemuan ${r.pertemuan_ke}"`,
        `"${r.materi_bacaan || '-'}"`,
        `"${r.rentang_bacaan || '-'}"`,
        r.nilai || 0,
        `"${r.tanggal}"`
      ]
      csvContent += baris.join(",") + "\n"
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Rekap_Mutabaah_KMF_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Berhasil mendownload laporan Excel!")
  }

  if (loading) return <div className="p-10 text-gray-400">Membuat Rekapan Global...</div>

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader title="Rekapitulasi Mutabaah" subtitle="Pantau progres capaian Al-Quran seluruh mahasiswa" />
        <button 
          onClick={handleExportExcel}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
        >
          <HiOutlineDocumentDownload className="text-xl" />
          Export ke Excel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Data Input</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{stats.totalMentee} <span className="text-sm font-medium text-gray-400">Setoran</span></p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rata-rata Nilai Mahasiswa</p>
          <p className="text-3xl font-black text-blue-600 mt-2">{stats.rataNilai} <span className="text-sm font-medium text-gray-400">/ 100</span></p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sm:col-span-2 md:col-span-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status Kelancaran</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">Baik <span className="text-sm font-medium text-gray-400">(Sesuai Target)</span></p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mt-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <HiOutlineSearch className="absolute left-4 top-3.5 text-gray-400 text-lg" />
          <input 
            type="text"
            placeholder="Cari nama mentee atau NIM..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950 focus:bg-white transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <HiOutlineFilter className="text-gray-400 hidden sm:block" />
          <select 
            value={selectedKategori} 
            onChange={e => setSelectedKategori(e.target.value)}
            className="w-full md:w-44 bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
          >
            <option value="ALL">Semua Program</option>
            <option value="TAHSIN">Tahsin</option>
            <option value="TAKHASUS">Takhasus</option>
            <option value="TAHFIDZ">Tahfidz</option>
          </select>
        </div>

        <select 
          value={selectedHalaqah} 
          onChange={e => setSelectedHalaqah(e.target.value)}
          className="w-full md:w-52 bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
        >
          <option value="ALL">Semua Halaqah</option>
          {listHalaqahUnik.filter(h => h !== 'ALL').map((h, idx) => (
            <option key={idx} value={h}>{h}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6 text-center w-16">No</th>
                <th className="py-4 px-6">Mentee</th>
                <th className="py-4 px-6">Halaqah</th>
                <th className="py-4 px-6">Capaian Terakhir</th>
                <th className="py-4 px-6 text-center">Nilai</th>
                <th className="py-4 px-6">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
              {Object.keys(groupedData).length > 0 ? (
                Object.entries(groupedData).map(([halaqahName, mentees]) => (
                  <React.Fragment key={halaqahName}>
                    <tr className="bg-gray-100/80 border-y border-gray-200">
                      <td colSpan="6" className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-users text-blue-600"></i>
                          <span className="font-black text-gray-900 uppercase tracking-wider text-xs">
                            Halaqah: <span className="text-blue-700">{halaqahName}</span>
                          </span>
                          <span className="ml-auto text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-200">
                            {mentees.length} Data Capaian
                          </span>
                        </div>
                      </td>
                    </tr>

                    {mentees.map((row, index) => {
                      // Deteksi Program UI
                      const materiStr = (row.materi_bacaan || '').toLowerCase()
                      const isTakhasus = materiStr.includes('iqro') || /^[0-9]+$/.test(materiStr.trim())
                      const isTahfidz = materiStr.includes('juz') || materiStr.includes('surah') || materiStr.includes('hafal')
                      
                      const badgeText = isTakhasus ? 'Takhasus' : isTahfidz ? 'Tahfidz' : 'Tahsin'
                      const badgeColor = isTakhasus ? 'bg-emerald-100 text-emerald-700' : isTahfidz ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'

                      return (
                        <tr key={row.id || `${halaqahName}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6 text-center font-bold text-gray-400">{index + 1}</td>
                          <td className="py-4 px-6">
                            <p className="font-bold text-gray-900">{row.nama_mentee || 'Mahasiswa'}</p>
                            <p className="text-xs text-gray-400 font-normal mt-0.5">{row.nim_mentee || 'NIM N/A'}</p>
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${badgeColor}`}>
                              {badgeText}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 rounded mr-2 text-gray-800">P-{row.pertemuan_ke}</span>
                            <span className="text-gray-900 font-semibold">{row.materi_bacaan}</span>
                            <span className="text-gray-400 text-xs block mt-0.5">Rentang: {row.rentang_bacaan}</span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`text-sm font-black px-3 py-1 rounded-xl ${row.nilai >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {row.nilai || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-400">{row.tanggal}</td>
                        </tr>
                      )
                    })}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400 italic">Tidak ada data rekapitulasi yang cocok dengan kriteria filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}