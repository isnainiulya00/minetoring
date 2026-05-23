import { useState } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import { useApi } from '../../hooks/useApi'
import { jadwalService } from '../../services/jadwalService'
import { formatDate } from '../../utils/formatters'
import { mediaUrl } from '../../utils/mediaUrl'
import { HiPlus, HiTrash, HiOutlineDocumentArrowDown, HiPencilSquare, HiOutlineLink } from 'react-icons/hi2'

const emptyForm = () => ({
  pertemuan_ke: '',
  tanggal: '',
  // Tambahkan 'url' ke kerangka dasar materi
  materi: [{ topik: '', deskripsi: '', file: null, url: '' }]
})

export default function JadwalMateri() {
  const { data: jadwal, loading, refetch } = useApi(jadwalService.getAll, [])
  
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm())

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id)
      setForm({
        pertemuan_ke: item.pertemuan_ke,
        tanggal: item.tanggal,
        materi: item.materi?.length > 0 
          ? item.materi.map(m => ({ 
              id: m.id, 
              topik: m.topik, 
              deskripsi: m.deskripsi, 
              file: null, 
              file_url: m.file,
              url: m.url || '' // Tarik url lama dari backend jika ada
            }))
          : [{ topik: '', deskripsi: '', file: null, url: '' }]
      })
    } else {
      setEditingId(null)
      setForm(emptyForm())
    }
    setModalOpen(true)
  }

  const addMateriField = () => {
    setForm({ ...form, materi: [...form.materi, { topik: '', deskripsi: '', file: null, url: '' }] })
  }

  const removeMateriField = (index) => {
    const newMateri = form.materi.filter((_, i) => i !== index)
    setForm({ ...form, materi: newMateri.length > 0 ? newMateri : [{ topik: '', deskripsi: '', file: null, url: '' }] })
  }

  const handleMateriChange = (index, field, value) => {
    const newMateri = [...form.materi]
    newMateri[index][field] = value
    setForm({ ...form, materi: newMateri })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('pertemuan_ke', form.pertemuan_ke)
      fd.append('tanggal', form.tanggal)
      
      form.materi.forEach((m, index) => {
        if (m.id) fd.append(`materi[${index}][id]`, m.id)
        fd.append(`materi[${index}][topik]`, m.topik)
        fd.append(`materi[${index}][deskripsi]`, m.deskripsi)
        
        // Kirim url jika diisi
        if (m.url) fd.append(`materi[${index}][url]`, m.url)
        
        if (m.file) {
          fd.append(`materi[${index}][file]`, m.file)
        }
      })

      if (editingId) {
        await jadwalService.update(editingId, fd)
        toast.success('Jadwal & Materi berhasil diperbarui')
      } else {
        await jadwalService.create(fd)
        toast.success('Jadwal & Materi berhasil ditambahkan')
      }

      setModalOpen(false)
      refetch()
    } catch (err) {
      toast.error('Gagal menyimpan data.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus jadwal pertemuan ini beserta seluruh materinya?')) return
    try {
      await jadwalService.delete(id)
      toast.success('Jadwal berhasil dihapus')
      refetch()
    } catch {
      toast.error('Gagal menghapus data')
    }
  }

  return (
    <>
      <PageHeader title="Jadwal & Materi Pertemuan" action={<Button onClick={() => handleOpenModal()}>Tambah Jadwal</Button>} />

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4 w-24">Pert.</th>
              <th className="px-6 py-4 w-44">Tanggal</th>
              <th className="px-6 py-4">Materi Terlampir</th>
              <th className="px-6 py-4 text-right w-40">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-400">Memuat data...</td></tr>
            ) : jadwal?.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-400">Belum ada jadwal.</td></tr>
            ) : (
              jadwal?.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-5 font-bold text-blue-600">#{j.pertemuan_ke}</td>
                  <td className="px-6 py-5 text-gray-600">{formatDate(j.tanggal)}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      {j.materi?.map((m, i) => (
                        <div key={i} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-xl shadow-sm max-w-xl">
                          <div className="min-w-0 pr-4">
                            <p className="font-semibold text-gray-800 truncate">{m.topik}</p>
                            <p className="text-gray-500 text-xs truncate">{m.deskripsi}</p>
                          </div>
                          
                          <div className="flex shrink-0 border-l border-gray-100 pl-2">
                            {/* Tombol Link Eksternal */}
                            {m.url && (
                              <a href={m.url} target="_blank" rel="noreferrer" 
                                 className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Buka Tautan Materi">
                                <HiOutlineLink className="h-5 w-5" />
                              </a>
                            )}
                            
                            {/* Tombol Download File */}
                            {(m.file || m.file_url) && (
                              <a href={mediaUrl(m.file || m.file_url)} target="_blank" rel="noreferrer" 
                                 className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Download Materi">
                                <HiOutlineDocumentArrowDown className="h-5 w-5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleOpenModal(j)}>
                        <HiPencilSquare className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(j.id)}>
                        <HiTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? `Edit Pertemuan #${form.pertemuan_ke}` : 'Tambah Jadwal & Materi'} >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
           <Input 
              label="Pertemuan Ke" 
              type="number" 
              required 
              min="1" 
              max="30" 
              value={form.pertemuan_ke} 
              onChange={e => {
                const val = e.target.value;
                // Mencegah pengetikan angka minus secara langsung
                if (val === '' || parseInt(val) >= 1) {
                  setForm({ ...form, pertemuan_ke: val });
                }
              }} 
            />
       <Input label="Tanggal" type="date" required value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} />
          </div>
          
          <div className="border-t border-gray-100 pt-4 max-h-[55vh] overflow-y-auto pr-2 scrollbar-thin">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-gray-700">Konten Materi</label>
              <button type="button" onClick={addMateriField} className="text-xs font-semibold text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100">
                <HiPlus /> Tambah Materi
              </button>
            </div>
            
            <div className="space-y-4">
              {form.materi.map((m, index) => (
                <div key={index} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 relative group">
                  <button type="button" onClick={() => removeMateriField(index)} 
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition">
                    <HiTrash className="h-5 w-5" />
                  </button>
                  
                  <div className="space-y-3">
                    <Input label="Topik" value={m.topik} onChange={e => handleMateriChange(index, 'topik', e.target.value)} required />
                    
                    <div>
                      <label className="text-xs font-medium text-gray-500 ml-1">Deskripsi Ringkas</label>
                      <textarea rows="2" className="w-full text-sm rounded-xl border border-gray-200 p-3 mt-1 outline-none focus:border-blue-500" 
                                value={m.deskripsi} onChange={e => handleMateriChange(index, 'deskripsi', e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-white border border-gray-100 rounded-xl mt-2">
                      {/* Input URL */}
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tautan / Link</label>
                        <input type="url" placeholder="https://..." className="w-full text-xs rounded-lg border border-gray-200 p-2 mt-1 focus:border-blue-500 outline-none"
                               value={m.url} onChange={e => handleMateriChange(index, 'url', e.target.value)} />
                      </div>
                      
                      {/* Input File */}
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          {editingId && m.file_url ? 'Ganti File (Opsional)' : 'Upload File (Opsional)'}
                        </label>
                        <input type="file" className="block w-full text-[11px] mt-1 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700"
                               onChange={e => handleMateriChange(index, 'file', e.target.files[0])} />
                        {m.file_url && !m.file && <p className="text-[10px] text-gray-400 mt-1 italic truncate">File: {m.file_url.split('/').pop()}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" className="flex-1" loading={saving}>
              {editingId ? 'Simpan Perubahan' : 'Terbitkan Jadwal'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}