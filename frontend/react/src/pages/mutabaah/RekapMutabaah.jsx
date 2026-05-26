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
  const [selectedPertemuan, setSelectedPertemuan] = useState('ALL')

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
        console.error("Error Fetch:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchGlobalMutabaah()
  }, [accessToken])

  // 2. Ambil List Unik untuk Dropdown (Halaqah & Pertemuan)
  const listHalaqahUnik = useMemo(() => {
    const setHalaqah = new Set(dataRekap.map(item => item.nama_halaqah || 'Tanpa Kelompok'))
    return ['ALL', ...Array.from(setHalaqah)]
  }, [dataRekap])

  const listPertemuanUnik = useMemo(() => {
    const setPertemuan = new Set(dataRekap.map(item => item.pertemuan_ke).filter(Boolean))
    return ['ALL', ...Array.from(setPertemuan).sort((a, b) => a - b)]
  }, [dataRekap])

  // 3. Logika Filter Data (Search + 3 Dropdown)
  const dataTerfilter = useMemo(() => {
    return dataRekap.filter(item => {
      const namaMentee = (item.nama_mentee || '').toLowerCase()
      const nimMentee = (item.nim_mentee || '').toLowerCase()
      const materi = (item.materi_bacaan || '').toString().toLowerCase()
      const halaqah = item.nama_halaqah || 'Tanpa Kelompok'
      const pertemuan = item.pertemuan_ke?.toString()
      
      let kategoriItem = item.tingkat && item.tingkat !== '-' 
        ? item.tingkat.toUpperCase() 
        : 'TAHSIN'
      
      if (!item.tingkat || item.tingkat === '-') {
        if (materi.includes('iqro') || /^[0-9]+$/.test(materi.trim())) {
          kategoriItem = 'TAKHASUS'
        } else if (materi.includes('juz') || materi.includes('surah') || materi.includes('hafal')) {
          kategoriItem = 'TAHFIDZ'
        }
      }

      const matchSearch = namaMentee.includes(searchQuery.toLowerCase()) || nimMentee.includes(searchQuery.toLowerCase())
      const matchKategori = selectedKategori === 'ALL' || kategoriItem === selectedKategori
      const matchHalaqah = selectedHalaqah === 'ALL' || halaqah === selectedHalaqah
      const matchPertemuan = selectedPertemuan === 'ALL' || pertemuan === selectedPertemuan.toString()

      return matchSearch && matchKategori && matchHalaqah && matchPertemuan
    })
  }, [dataRekap, searchQuery, selectedKategori, selectedHalaqah, selectedPertemuan])

  // 4. EXPORT TO EXCEL
  const handleExportExcel = () => {
    if (dataTerfilter.length === 0) {
      toast.error("Tidak ada data untuk diexport")
      return
    }

    // Tambah kolom catatan di Excel
    let csvContent = "No,Nama Mentee,NIM,Tingkat,Halaqah,Materi Bacaan,Rentang Halaman,Catatan\n"
    
    dataTerfilter.forEach((r, index) => {
      // Bersihkan enter atau koma di dalam catatan biar Excel nggak berantakan
      const cleanCatatan = (r.catatan_mentor || '-').replace(/"/g, '""').replace(/\n/g, ' ')
      
      const baris = [
        index + 1,
        `"${r.nama_mentee || 'Mentee'}"`,
        `"${r.nim_mentee || '-'}"`,
        `"${r.tingkat || '-'}"`,
        `"${r.nama_halaqah || '-'}"`,
        `"${r.materi_bacaan || '-'}"`,
        `"${r.rentang_bacaan || '-'}"`,
        `"${cleanCatatan}"`
      ]
      csvContent += baris.join(",") + "\n"
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Rekap_Mutabaah_${selectedPertemuan !== 'ALL' ? 'P'+selectedPertemuan : 'Semua'}_${new Date().toISOString().split('T')[0]}.csv`)
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

      {/* KPI Card */}
      <div className="mt-8">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm inline-block min-w-[250px]">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Data Input</p>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {dataTerfilter.length} <span className="text-sm font-medium text-gray-400">Setoran</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mt-8 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:flex-1">
          <HiOutlineSearch className="absolute left-4 top-3.5 text-gray-400 text-lg" />
          <input 
            type="text"
            placeholder="Cari nama mentee atau NIM..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950 focus:bg-white transition-all"
          />
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full lg:w-auto">
          <HiOutlineFilter className="text-gray-400 hidden lg:block" />
          
          <select 
            value={selectedKategori} 
            onChange={e => setSelectedKategori(e.target.value)}
            className="flex-1 md:w-36 bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
          >
            <option value="ALL">Program (Semua)</option>
            <option value="TAHSIN">Tahsin</option>
            <option value="TAKHASUS">Takhasus</option>
            <option value="TAHFIDZ">Tahfidz</option>
          </select>

          <select 
            value={selectedPertemuan} 
            onChange={e => setSelectedPertemuan(e.target.value)}
            className="flex-1 md:w-40 bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
          >
            <option value="ALL">Pertemuan (Semua)</option>
            {listPertemuanUnik.filter(p => p !== 'ALL').map((p, idx) => (
              <option key={idx} value={p}>Pertemuan {p}</option>
            ))}
          </select>

          <select 
            value={selectedHalaqah} 
            onChange={e => setSelectedHalaqah(e.target.value)}
            className="flex-1 md:w-48 bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
          >
            <option value="ALL">Halaqah (Semua)</option>
            {listHalaqahUnik.filter(h => h !== 'ALL').map((h, idx) => (
              <option key={idx} value={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold min-w-[200px]">Mentee</th>
                <th className="py-4 px-6 font-semibold text-center">Tingkat</th>
                <th className="py-4 px-6 font-semibold">Halaqah</th>
                <th className="py-4 px-6 font-semibold min-w-[300px]">Detail Mutabaah</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
              {dataTerfilter.length > 0 ? (
                dataTerfilter.map((row, index) => {
                  
                  const tingkatLabel = row.tingkat && row.tingkat !== '-' 
                    ? row.tingkat 
                    : (row.materi_bacaan || '').toLowerCase().includes('iqro') ? 'Takhasus' : 'Tahsin'

                  const badgeColor = tingkatLabel.toUpperCase() === 'TAKHASUS' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : tingkatLabel.toUpperCase() === 'TAHFIDZ' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-blue-100 text-blue-700'

                  return (
                    <tr key={row.id || index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900">{row.nama_mentee || 'Mahasiswa'}</p>
                        <p className="text-xs text-gray-400 font-normal mt-0.5">{row.nim_mentee || 'NIM N/A'}</p>
                      </td>
                      
                      <td className="py-4 px-6 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${badgeColor}`}>
                          {tingkatLabel}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-semibold text-gray-700">
                        {row.nama_halaqah}
                      </td>

                      {/* Tampilan Isi Mutabaah Baru: Bersih dan Langsung */}
                      {/* Tampilan Isi Mutabaah Baru: Bersih dan Langsung */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5">
                          <p className="text-sm font-bold text-gray-900">
                            
                            {/* 👇 LOGIKA IQRO-NYA PINDAH KE SINI 👇 */}
                            {tingkatLabel.toUpperCase() === 'TAKHASUS' 
                              ? `Iqro' ${row.materi_bacaan || '-'}` 
                              : row.materi_bacaan || '-'} 
                              
                            <span className="text-gray-300 font-normal mx-2">|</span> 
                            
                            {/* Tambahkan kata 'Jilid' atau 'Ayat' biar makin jelas */}
                            <span className="text-gray-600 font-medium">
                              {tingkatLabel.toUpperCase() === 'TAKHASUS' ? 'Hal. ' : 'Ayat '} 
                              {row.rentang_bacaan || '-'}
                            </span>
                          </p>
                          
                          {/* 👇 CATATAN MENTOR KEMBALI KE FUNGSI ASLINYA 👇 */}
                          {row.catatan_mentor && row.catatan_mentor.trim() !== '' && (
                            <p className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 italic leading-relaxed mt-1">
                              "{row.catatan_mentor}"
                            </p>
                          )}
                        </div>
                      </td>
                      
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-400 italic">
                    Tidak ada data rekapitulasi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}