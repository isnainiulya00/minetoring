import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import PageHeader from '../../components/common/PageHeader'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

// 👇 1. IMPORT USEAUTHSTORE UNTUK MENDETEKSI ROLE 👇
import { useAuthStore } from '../../store/authStore'

export default function Takhasus() {
  // 👇 2. AMBIL DATA USER DAN CEK ROLE-NYA SECARA AMAN 👇
  const user = useAuthStore((state) => state.user)
  const isMentee = user?.role?.toUpperCase() === 'MENTEE'

  const [mentees, setMentees] = useState([])
  const [selectedMentee, setSelectedMentee] = useState(null)
  const [jadwalList, setJadwalList] = useState([])
  const [riwayatMutabaah, setRiwayatMutabaah] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    pertemuan: '',
    tanggal: new Date().toISOString().split('T')[0],
    materi_bacaan: '',
    rentang_bacaan: '',
    
    catatan_mentor: ''
  })

  const accessToken = localStorage.getItem('mine_toring_access')

  const fetchRiwayat = () => {
    axios.get('http://localhost:8000/api/mutabaahs/', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data.results || [])
      setRiwayatMutabaah(data)
    })
    .catch(err => console.error("Gagal ambil riwayat:", err))
  }

  useEffect(() => {
    fetchRiwayat()
    
    // Mentor butuh data halaqah/jadwal, Mentee cuma butuh riwayat
    if (isMentee) {
      setLoading(false)
      return
    }

    const fetchInitialData = async () => {
      try {
        const [resJadwal, resHalaqah] = await Promise.all([
          axios.get('http://localhost:8000/api/jadwal/', { headers: { Authorization: `Bearer ${accessToken}` } }),
          axios.get('http://localhost:8000/api/halaqah/', { headers: { Authorization: `Bearer ${accessToken}` } })
        ])

        const dataJadwal = Array.isArray(resJadwal.data) ? resJadwal.data : (resJadwal.data.results || [])
        const sortedJadwal = dataJadwal.sort((a, b) => a.pertemuan_ke - b.pertemuan_ke)
        setJadwalList(sortedJadwal)
        if (sortedJadwal.length > 0) {
          setForm(prev => ({ ...prev, pertemuan: sortedJadwal[0].pertemuan_ke.toString() }))
        }

        if (resHalaqah.data.length > 0) {
          const halaqahId = resHalaqah.data[0].id
          const resDetail = await axios.get(`http://localhost:8000/api/halaqah/${halaqahId}/`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
          const list = resDetail.data.anggota_mentee || resDetail.data.mentees || []
          setMentees(list)
          if (list.length > 0) setSelectedMentee(list[0])
        }
      } catch (err) {
        toast.error("Gagal memuat data")
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [isMentee, accessToken])

  const handleStartEdit = (riwayat) => {
    setEditingId(riwayat.id)
    setForm({
      pertemuan: riwayat.pertemuan_ke.toString(),
      tanggal: riwayat.tanggal,
      materi_bacaan: riwayat.materi_bacaan,
      rentang_bacaan: riwayat.rentang_bacaan,
  
      catatan_mentor: riwayat.catatan_mentor || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    toast('Silakan ubah data di form atas', { icon: '📝' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(prev => ({ ...prev, materi_bacaan: '', rentang_bacaan: '', catatan_mentor: '' }))
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data mutabaah ini?")) return

    try {
      await axios.delete(`http://localhost:8000/api/mutabaahs/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      toast.success('Data mutabaah berhasil dihapus!')
      
      if (editingId === id) cancelEdit()
      fetchRiwayat()
    } catch (err) {
      toast.error('Gagal menghapus data')
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const payload = {
      mentee: selectedMentee.id,
      pertemuan_ke: parseInt(form.pertemuan),
      tanggal: form.tanggal,
      materi_bacaan: form.materi_bacaan,
      rentang_bacaan: form.rentang_bacaan,
      catatan_mentor: form.catatan_mentor
    }

    try {
      if (editingId) {
        await axios.patch(`http://localhost:8000/api/mutabaahs/${editingId}/`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        toast.success('Perubahan berhasil disimpan!')
      } else {
        await axios.post('http://localhost:8000/api/mutabaahs/', payload, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        toast.success('Data mutabaah baru disimpan!')
      }

      setEditingId(null)
      setForm(prev => ({ ...prev, materi_bacaan: '', rentang_bacaan: '', catatan_mentor: '' }))
      fetchRiwayat()
    } catch (err) {
      toast.error('Gagal memproses data')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-10 text-gray-400">Menghubungkan...</div>

  // 👇 3. LOGIKA UNTUK MENAMPILKAN DATA RIWAYAT 👇
  // Jika mentee, tampilkan semua datanya (krn API django sudah memfilter milik dia)
  // Jika mentor, tampilkan hanya data milik mentee yang sedang diklik
  const displayedRiwayat = isMentee 
    ? riwayatMutabaah 
    : riwayatMutabaah.filter(r => r.mentee === selectedMentee?.id);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <PageHeader 
        title="Mutabaah Takhasus" 
        subtitle={isMentee ? "Riwayat perkembangan bacaan Anda" : "Input, Edit, & Hapus progres harian mentee"} 
      />
      
      {/* Ubah grid agar Mentee jadi 1 kolom (lebar penuh), Mentor 3 kolom */}
      <div className={`${isMentee ? 'w-full' : 'lg:col-span-2'} space-y-8`}>
        
        {/* 👇 SEMBUNYIKAN LIST MENTEE JIKA YANG BUKA ADALAH MENTEE 👇 */}
        {!isMentee && (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm h-fit">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-4">Anggota Kelompok</h3>
            <div className="space-y-1">
              {mentees.map(m => (
                <button 
                  key={m.id} 
                  onClick={() => { setSelectedMentee(m); cancelEdit(); }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition flex justify-between items-center ${selectedMentee?.id === m.id ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span className="text-sm font-semibold truncate">{m.nama_lengkap}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Jika Mentee, penuhi layarnya (max-w-4xl mx-auto w-full), jika Mentor ambil 2 kolom */}
        <div className={`${isMentee ? 'w-full' : 'lg:col-span-2'} space-y-8`}>
          
          {/* 👇 SEMBUNYIKAN FORM INPUT JIKA YANG BUKA ADALAH MENTEE 👇 */}
          {!isMentee && (
            <div className={`rounded-3xl border ${editingId ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100 bg-white'} p-8 shadow-sm transition-all`}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-50 pb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Capaian' : 'Input Capaian'}</h2>
                    <p className="text-sm text-gray-400">{selectedMentee?.nama_lengkap}</p>
                  </div>
                  {editingId && (
                    <button type="button" onClick={cancelEdit} className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-lg hover:bg-amber-200">Batal Edit</button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pertemuan</label>
                    <select 
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none bg-white"
                      value={form.pertemuan}
                      onChange={e => setForm({...form, pertemuan: e.target.value})}
                    >
                      {jadwalList.map(j => <option key={j.id} value={j.pertemuan_ke}>Pertemuan {j.pertemuan_ke}</option>)}
                    </select>
                  </div>
                  <Input label="Tanggal" type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Jilid Iqro'" placeholder="Iqro Jilid 1-6" value={form.materi_bacaan} onChange={e => setForm({...form, materi_bacaan: e.target.value})} required />
                  <Input label="Halaman" placeholder="Halaman 10-15" value={form.rentang_bacaan} onChange={e => setForm({...form, rentang_bacaan: e.target.value})} required />
                </div>

                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Catatan Progres</label>
                  <textarea rows="3" className="w-full rounded-xl border border-gray-200 p-4 text-sm bg-white focus:ring-2 focus:ring-gray-900 focus:outline-none resize-none" placeholder="Catatan perkembangan..." value={form.catatan_mentor} onChange={e => setForm({...form, catatan_mentor: e.target.value})} />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" loading={submitting} className={`px-10 py-3 rounded-2xl shadow-xl ${editingId ? 'bg-amber-600 hover:bg-amber-700' : ''}`}>
                    {editingId ? 'Simpan Perubahan' : 'Simpan Mutabaah'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Riwayat Table (TAMPIL UNTUK MENTOR DAN MENTEE) */}
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Riwayat Capaian</h3>
            <div className="space-y-4">
              {displayedRiwayat.length > 0 ? (
                displayedRiwayat.reverse().map((r, i) => (
                  <div key={i} className="group flex justify-between items-center p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition-all">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-white bg-gray-900 px-2 py-0.5 rounded">P-{r.pertemuan_ke}</span>
                        <span className="text-xs text-gray-400 font-medium">{r.tanggal}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-800">Iqro' {r.materi_bacaan} <span className="text-gray-400 mx-2">•</span>Halaman {r.rentang_bacaan}</p>
                      {r.catatan_mentor && <p className="text-xs text-gray-500 mt-1 italic">"{r.catatan_mentor}"</p>}
                    </div>
                    
                     
                      
                      {/* 👇 SEMBUNYIKAN TOMBOL EDIT/HAPUS JIKA YANG BUKA ADALAH MENTEE 👇 */}
                      {!isMentee && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => handleStartEdit(r)}
                            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all"
                            title="Edit Data"
                          >
                            <i className="fa-solid fa-pen-to-square text-sm"></i>
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(r.id)}
                            className="p-2 bg-white border border-gray-200 rounded-lg text-red-400 hover:text-red-600 hover:border-red-600 transition-all"
                            title="Hapus Data"
                          >
                            <i className="fa-solid fa-trash text-sm"></i>
                          </button>
                        </div>
                      )}

                    </div>
               
                ))
              ) : (
                <div className="text-center py-10 text-gray-300 text-sm italic">Belum ada riwayat.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}