import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { HiOutlinePlus, HiOutlineDatabase, HiOutlineSearch } from 'react-icons/hi'
import axios from 'axios'
import { useAuthStore } from '../../store/authStore'
import { useApi } from '../../hooks/useApi'

import { menteeService } from '../../services/menteeService'
import { mentorService } from '../../services/mentorService'
import { halaqahService } from '../../services/halaqahService'

export default function Sertifikat() {
  const [sertifikatData, setSertifikatData] = useState([])
  const [userData, setUserData] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [activeTab, setActiveTab] = useState('MENTEE')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedHalaqah, setSelectedHalaqah] = useState('ALL')

  const [showAddModal, setShowAddModal] = useState(false)
  const [searchModalUser, setSearchModalUser] = useState('') 
  const [formManual, setFormManual] = useState({
    user_id: '',
    sebagai: '', 
    link_sertifikat: '',
  })

  const user = useAuthStore((state) => state.user)
  // 👇 Cek apakah user adalah KMF/Koordinator (Punya hak akses penuh)
  const isKMF = user?.role?.toUpperCase() === 'KMF' || user?.role?.toUpperCase() === 'KOORDINATOR'
  const accessToken = localStorage.getItem('mine_toring_access')

  const { data: menteeDataRaw, loading: loadingMentee } = useApi(menteeService.getAll, [])
  const { data: mentorDataRaw, loading: loadingMentor } = useApi(mentorService.getAll, [])
  const { data: halaqahDataRaw } = useApi(halaqahService.getAll, [])

  const menteeList = Array.isArray(menteeDataRaw) ? menteeDataRaw : (menteeDataRaw?.results || [])
  const mentorList = Array.isArray(mentorDataRaw) ? mentorDataRaw : (mentorDataRaw?.results || [])
  const halaqahList = Array.isArray(halaqahDataRaw) ? halaqahDataRaw : (halaqahDataRaw?.results || [])

  const fetchSertifikat = () => {
    setLoading(true)
    axios.get('http://localhost:8000/api/sertifikat/', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data.results || [])
      setSertifikatData(data)
    })
    .catch(err => toast.error("Gagal memuat data sertifikat"))
    .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSertifikat()
    if (isKMF) {
      axios.get('http://localhost:8000/api/users/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.results || [])
        setUserData(data)
      })
      .catch(err => console.error("Gagal memuat data user untuk manual add."))
    }
  }, [accessToken, isKMF])

  const getNamaHalaqah = (item) => {
    if (item.nama_kelompok_halaqah) return item.nama_kelompok_halaqah
    if (item.halaqah?.nama_kelompok) return item.halaqah.nama_kelompok
    
    const hId = item.halaqah?.id || item.halaqah
    const found = halaqahList.find(h => String(h.id) === String(hId))
    return found?.nama_kelompok || 'Tanpa Kelompok'
  }

  const listHalaqahUnik = useMemo(() => {
    const setHalaqah = new Set()
    halaqahList.forEach(h => setHalaqah.add(h.nama_kelompok))
    menteeList.forEach(m => setHalaqah.add(getNamaHalaqah(m)))
    mentorList.forEach(m => setHalaqah.add(getNamaHalaqah(m)))
    
    setHalaqah.delete('Tanpa Kelompok')
    setHalaqah.delete('-')
    setHalaqah.delete(undefined)
    
    return ['ALL', ...Array.from(setHalaqah).sort()]
  }, [halaqahList, menteeList, mentorList])

  // ===================== LOGIKA PENGGABUNGAN DATA MENTEE =====================
  const filteredMentee = useMemo(() => {
    const mappedData = menteeList.map(mentee => {
      const cert = sertifikatData.find(s => 
        String(s.sebagai).toUpperCase() === 'MENTEE' && 
        (String(s.user) === String(mentee.user_id) || String(s.nim) === String(mentee.nim))
      )
      
      const namaHalaqah = getNamaHalaqah(mentee)
      const hId = mentee.halaqah?.id || mentee.halaqah
      const halaqahObj = halaqahList.find(h => String(h.id) === String(hId))
      const tingkatLabel = halaqahObj?.tingkat || mentee.tingkat || 'TAHSIN'

      return {
        id: mentee.id,
        nama_lengkap: mentee.nama_lengkap || mentee.nama || 'Tanpa Nama',
        nim: mentee.nim || '-',
        nama_halaqah: namaHalaqah,
        tingkat: tingkatLabel,
        link_sertifikat: cert?.link_sertifikat || cert?.tautan_drive || cert?.file_url || null,
        tanggal_terbit: cert?.tanggal_terbit || cert?.created_at || null,
        hasCert: !!cert
      }
    })

    return mappedData.filter(item => {
      const query = searchQuery.toLowerCase()
      const matchSearch = item.nama_lengkap.toLowerCase().includes(query) || item.nim.toLowerCase().includes(query)
      const matchHalaqah = selectedHalaqah === 'ALL' || (item.nama_halaqah && item.nama_halaqah.toLowerCase() === selectedHalaqah.toLowerCase())
      
      return matchSearch && matchHalaqah
    }).sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap))
  }, [menteeList, sertifikatData, halaqahList, searchQuery, selectedHalaqah])

  // ===================== LOGIKA PENGGABUNGAN DATA MENTOR =====================
  const filteredMentor = useMemo(() => {
    const mappedData = mentorList.map(mentor => {
      const cert = sertifikatData.find(s => 
        String(s.sebagai).toUpperCase() === 'MENTOR' && 
        (String(s.user) === String(mentor.user_id) || String(s.nim) === String(mentor.nim))
      )

      const namaHalaqah = getNamaHalaqah(mentor)

      return {
        id: mentor.id,
        nama_lengkap: mentor.nama_lengkap || mentor.nama || mentor.user?.nama || 'Tanpa Nama',
        nim: mentor.nim || mentor.user?.username || '-',
        tingkat: 'MENTOR',
        nama_halaqah: namaHalaqah,
        link_sertifikat: cert?.link_sertifikat || cert?.tautan_drive || cert?.file_url || null,
        tanggal_terbit: cert?.tanggal_terbit || cert?.created_at || null,
        hasCert: !!cert
      }
    })

    return mappedData.filter(item => {
      const query = searchQuery.toLowerCase()
      const matchSearch = item.nama_lengkap.toLowerCase().includes(query) || item.nim.toLowerCase().includes(query)
      const matchHalaqah = selectedHalaqah === 'ALL' || (item.nama_halaqah && item.nama_halaqah.toLowerCase() === selectedHalaqah.toLowerCase())
      
      return matchSearch && matchHalaqah
    }).sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap))
  }, [mentorList, sertifikatData, halaqahList, searchQuery, selectedHalaqah])

  const dataTerfilter = activeTab === 'MENTEE' ? filteredMentee : filteredMentor
  const totalSertifikatTerbit = dataTerfilter.filter(item => item.hasCert).length
  const isDataLoading = loading || loadingMentee || loadingMentor

  const handleSubmitManual = (e) => {
    e.preventDefault()
    if (!formManual.sebagai) {
      toast.error('Pilih User terlebih dahulu!')
      return
    }

    setSubmitting(true)
    axios.post('http://localhost:8000/api/sertifikat/add_user_sertifikat/', formManual, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(res => {
      toast.success('Sertifikat berhasil ditambahkan!')
      setShowAddModal(false)
      setFormManual({ user_id: '', sebagai: '', link_sertifikat: '' }) 
      setSearchModalUser('') 
      fetchSertifikat() 
    })
    .catch(err => toast.error('Gagal menambahkan sertifikat manual.'))
    .finally(() => setSubmitting(false))
  }

  const renderUserPov = () => (
    <div className="w-full pb-12">
      <PageHeader title="Sertifikat Anda" subtitle="Unduh sertifikat kelulusan atau partisipasi mentoring Anda di sini" />
      <div className="mt-8 space-y-6">
        {loading ? <TableSkeleton /> : sertifikatData.length > 0 ? (
          sertifikatData.map((cert) => (
            <div key={cert.id} className="w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative transition-all hover:border-gray-200">
              <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-award text-3xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Sertifikat <span className="font-bold text-emerald-600">{cert.sebagai}</span></h3>
                  <p className="text-sm text-gray-400 mt-2 font-medium">Atas Nama: <span className="text-gray-900 font-bold">{user?.first_name} {user?.last_name}</span></p>
                  <p className="text-xs text-gray-400 mt-1">Diterbitkan pada: <span className="font-semibold text-gray-600">{cert.tanggal_terbit}</span></p>
                </div>
              </div>
              {cert.link_sertifikat ? (
                <a href={cert.link_sertifikat} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto relative z-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-2xl transition-all active:scale-95 text-center flex items-center justify-center gap-2">
                  Unduh Sertifikat <i className="fa-solid fa-download"></i>
                </a>
              ) : <Badge variant="neutral">Proses Penerbitan</Badge>}
            </div>
          ))
        ) : <EmptyState title="Sertifikat Belum Tersedia" description={"Hai " + (user?.first_name) + ", sertifikat biasanya dibagikan di akhir semester. Cek kembali nanti."} />}
      </div>
    </div>
  )

  // TAMPILAN UNTUK ADMIN (KMF & LPPIK)
  const renderKmfPov = () => (
    <div className="w-full pb-12">
      
      {/* HEADER & TOGGLE TABS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
        <PageHeader 
          title="Rekap Sertifikat" 
          subtitle="Distribusi dan manajemen tautan sertifikat Mentoring AIK" 
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white border border-gray-100 p-1.5 rounded-3xl shadow-sm w-fit">
            <button
              onClick={() => setActiveTab('MENTEE')}
              className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                activeTab === 'MENTEE' ? 'bg-[#0f172a] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Mentee
            </button>
            <button
              onClick={() => setActiveTab('MENTOR')}
              className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                activeTab === 'MENTOR' ? 'bg-[#0f172a] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Mentor
            </button>
          </div>

          <div className="bg-white border border-gray-100 px-5 py-3 rounded-2xl shadow-sm flex items-center gap-2 h-[46px]">
            <span className="text-sm text-gray-500 font-medium">Sertifikat Terbit:</span>
            <span className="text-base font-black text-emerald-600">{totalSertifikatTerbit}</span>
          </div>
        </div>
      </div>

      {/* TOOLBAR FILTER */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="w-full lg:flex-1">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="Cari nama atau NIM..." 
            className="w-full m-0 shadow-none border-none bg-gray-50/50" 
          />
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full lg:w-auto">
          <select 
            value={selectedHalaqah} 
            onChange={e => setSelectedHalaqah(e.target.value)}
            className="flex-1 md:w-64 bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="ALL">Halaqah (Semua)</option>
            {listHalaqahUnik.filter(h => h !== 'ALL').map((h, idx) => (
              <option key={idx} value={h}>{h}</option>
            ))}
          </select>

          {/* 👇 KONDISIONAL: Tombol Tambah Manual HANYA muncul di KMF 👇 */}
          {isKMF && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-gray-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all h-[42px] w-full md:w-auto whitespace-nowrap"
            >
              <HiOutlinePlus className="text-lg" />
              Tambah Manual
            </button>
          )}
        </div>
      </div>

      {/* RENDER TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm mt-6 overflow-hidden mb-8">
        {isDataLoading ? <TableSkeleton /> : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold min-w-[200px]">Penerima</th>
                  <th className="py-4 px-6 font-semibold text-center">Tingkat</th>
                  <th className="py-4 px-6 font-semibold min-w-[150px]">Halaqah</th>
                  <th className="py-4 px-6 font-semibold text-center min-w-[250px]">Tautan Drive</th>
                  <th className="py-4 px-6 font-semibold text-center">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                {dataTerfilter.length > 0 ? (
                  dataTerfilter.map((row) => {
                    const badgeColor = row.tingkat.toUpperCase() === 'TAKHASUS' ? 'bg-emerald-100 text-emerald-700' : row.tingkat.toUpperCase() === 'TAHFIDZ' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'

                    return (
                      <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-gray-900 uppercase">{row.nama_lengkap}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{row.nim}</p>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${badgeColor}`}>{row.tingkat}</span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-gray-700">{row.nama_halaqah}</td>
                        <td className="py-4 px-6 text-center">
                          {row.hasCert && row.link_sertifikat ? (
                            <a href={row.link_sertifikat} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline break-all">
                              Buka di Drive <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-xs"></i>
                            </a>
                          ) : (
                            <span className="text-gray-400 italic font-normal text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded">Belum ada</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center text-gray-500 font-mono text-xs">
                          {row.tanggal_terbit ? row.tanggal_terbit.split('T')[0] : '-'}
                        </td>
                      </tr>
                    )
                  })
                ) : <tr><td colSpan="5" className="text-center py-12 text-gray-400 italic">Tidak ada data rekapitulasi.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 👇 KONDISIONAL: Kartu Impor Django HANYA muncul di KMF 👇 */}
      {isKMF && (
        <div className="bg-gray-50 rounded-3xl border border-gray-200 p-8 text-center flex flex-col items-center justify-center gap-4 mt-8">
          <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <HiOutlineDatabase className="text-2xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Impor Massal (Via Admin Django)</h3>
            <p className="text-sm text-gray-500 mt-1">Untuk menambahkan ratusan tautan sertifikat sekaligus, unggah melalui Panel Admin Django.</p>
          </div>
          <a 
            href="http://localhost:8000/admin/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-2 text-sm font-bold text-gray-900 hover:text-emerald-600 transition-colors"
          >
            Masuk ke Django Admin
          </a>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Jika akun LPPIK, dia otomatis diarahkan ke renderKmfPov() tapi dengan filter tombol yang sudah kita kondisikan */}
      {user?.role?.toUpperCase() === 'LPPIK' || isKMF ? renderKmfPov() : renderUserPov()}
      
      <Modal open={showAddModal} onClose={() => { setShowAddModal(false); setSearchModalUser(''); }} title="Tambah Sertifikat Manual" size="lg">
        <form onSubmit={handleSubmitManual} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cari & Pilih User</label>
            <div className="relative mb-2">
              <HiOutlineSearch className="absolute left-3 top-3.5 text-gray-400" />
              <input type="text" placeholder="Ketik Nama atau NIM untuk mencari..." value={searchModalUser} onChange={(e) => setSearchModalUser(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"/>
            </div>
            <select 
              value={formManual.user_id} 
              onChange={e => {
                const selectedId = e.target.value;
                const selectedUser = userData.find(u => u.id.toString() === selectedId);
                const autoRole = selectedUser ? (selectedUser.role || 'MENTEE').toUpperCase() : '';
                setFormManual({ ...formManual, user_id: selectedId, sebagai: autoRole });
              }} 
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none bg-white" required
            >
              <option value="">-- Pilih User Dari Hasil Pencarian --</option>
              {userData
                .filter(u => u.nim)
                .filter(u => {
                  const q = searchModalUser.toLowerCase()
                  return u.nim.toLowerCase().includes(q) || (u.first_name || '').toLowerCase().includes(q)
                })
                .map(u => (
                  <option key={u.id} value={u.id}>{u.nim} — {u.first_name} ({u.role})</option>
                ))
              }
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Role (Terdeteksi Otomatis)</label>
            <input type="text" value={formManual.sebagai || 'Pilih user di atas terlebih dahulu...'} disabled className="w-full rounded-xl border border-gray-200 p-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed font-bold" />
          </div>
          <Input label="Link Sertifikat Google Drive" placeholder="Paste link Drive unik mahasiswa di sini..." value={formManual.link_sertifikat} onChange={e => setFormManual({ ...formManual, link_sertifikat: e.target.value })} required />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
            <Button variant="gray" onClick={() => { setShowAddModal(false); setSearchModalUser(''); }}>Batal</Button>
            <Button type="submit" loading={submitting}>Simpan Tautan</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}