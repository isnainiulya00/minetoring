import { useState, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'

// Pastikan semua import ini ada dan jalurnya benar!
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import Table, { Pagination } from '../../components/common/Table'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { menteeService } from '../../services/menteeService'
import { halaqahService } from '../../services/halaqahService'

const PAGE_SIZE = 8

export default function MenteeManagement({ isHubMode }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebounce(search)

  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // Data Mentee aslinya disimpan di sini untuk ditampilkan di Modal (Read-Only)
  const [selectedMentee, setSelectedMentee] = useState(null)
  
  const [form, setForm] = useState({
    halaqah: '' // Form sekarang murni cuma butuh ID halaqah
  })

  // Mengambil data dari API
  const { data: mentees, loading, refetch } = useApi(menteeService.getAll, [])
  const { data: halaqahs } = useApi(halaqahService.getAll, [])

  useEffect(() => { setPage(1) }, [debounced])

  // Filter pencarian dengan pengaman Array (Anti-Pingsan)
  const filtered = useMemo(() => {
    const q = debounced.toLowerCase()
    const menteeList = Array.isArray(mentees) ? mentees : (mentees?.results || [])
    
    return menteeList.filter(m => 
      (m.nama_lengkap || '').toLowerCase().includes(q) ||
      (m.nim || '').toLowerCase().includes(q)
    )
  }, [mentees, debounced])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  // Amankan data halaqah agar siap di-map di dalam dropdown
  const halaqahList = Array.isArray(halaqahs) ? halaqahs : (halaqahs?.results || [])

  const handleOpenModal = (item) => {
    setEditingId(item.id)
    setSelectedMentee(item)
    // Ambil ID halaqahnya saja
    const halaqahId = item.halaqah?.id || item.halaqah || ''
    setForm({ halaqah: halaqahId })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Kita hanya melempar data halaqah yang baru ke API
      await menteeService.update(editingId, { halaqah: form.halaqah })
      toast.success('Kelompok halaqah berhasil diperbarui')
      setModalOpen(false)
      refetch()
    } catch {
      toast.error('Gagal memperbarui halaqah mentee')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data mentee ini?')) return
    try {
      await menteeService.delete(id)
      toast.success('Mentee berhasil dihapus')
      refetch()
    } catch {
      toast.error('Gagal menghapus mentee')
    }
  }

  return (
    <>
      
      <SearchBar value={search} onChange={setSearch} placeholder="Cari nama atau NIM mentee..." className="mb-6 max-w-md" />

      {loading ? <TableSkeleton /> : (
        <>
          <Table
            columns={[
              { key: 'nim', label: 'NIM' },
              { key: 'nama', label: 'Nama Lengkap' },
              { key: 'halaqah', label: 'Kelompok Halaqah' },
              { key: 'aksi', label: 'Aksi' },
            ]}
            data={paginated}
            renderRow={(row) => (
              <>
                <td className="px-4 py-3 font-mono text-sm text-gray-600">{row.nim || row.user?.nim || '-'}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{row.nama_lengkap || '-'}</td>
                <td className="px-4 py-3 text-gray-600">
                  {row.halaqah_nama || row.halaqah?.nama_kelompok || <span className="text-gray-400 italic">Belum masuk kelompok</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleOpenModal(row)}>Ubah Halaqah</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Hapus</Button>
                  </div>
                </td>
              </>
            )}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* MODAL UBAH HALAQAH */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Pindah Kelompok Halaqah">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {selectedMentee && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm space-y-2">
              <p><span className="text-gray-500 font-medium w-24 inline-block">NIM:</span> {selectedMentee.nim || selectedMentee.user?.nim}</p>
              <p><span className="text-gray-500 font-medium w-24 inline-block">Nama:</span> {selectedMentee.nama_lengkap}</p>
              <p><span className="text-gray-500 font-medium w-24 inline-block">Prodi:</span> {selectedMentee.prodi}</p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Pilih Halaqah</label>
            <select 
              value={form.halaqah} 
              onChange={e => setForm({ ...form, halaqah: e.target.value })} 
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="">-- Kosongkan / Belum Ada Kelompok --</option>
              {halaqahList.map(h => (
                <option key={h.id} value={h.id}>
                  {h.nama_kelompok} ({h.tingkat})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" className="flex-1" loading={saving}>Simpan Perubahan</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}