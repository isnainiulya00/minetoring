import { useState, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import Table, { Pagination } from '../../components/common/Table'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { halaqahService } from '../../services/halaqahService'
import { mentorService } from '../../services/mentorService'
import { menteeService } from '../../services/menteeService'

const PAGE_SIZE = 8
const emptyForm = () => ({
  nama_kelompok: '',
  tingkat: '',
  mentor: '',
  semester_aktif: '2025-Ganjil',
  mentees: [] 
})

export default function HalaqahManagement() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebounce(search)

  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm())

  const { data: halaqahs, loading, refetch } = useApi(halaqahService.getAll, [])
  const { data: mentors } = useApi(mentorService.getAll, [])
  const { data: mentees } = useApi(menteeService.getAll, [])

  useEffect(() => { setPage(1) }, [debounced])

  const filtered = useMemo(() => {
    const q = debounced.toLowerCase()
    return (halaqahs ?? []).filter(h => 
      (h.nama_kelompok || '').toLowerCase().includes(q)
    )
  }, [halaqahs, debounced])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const getMentorNim = (mentorId) => {
    if (!mentorId) return 'Belum Ada Mentor'
    const found = mentors?.find(m => m.id === mentorId)
    return found?.nim || mentorId
  }

  const getMenteeNims = (menteeIds) => {
    if (!menteeIds || !Array.isArray(menteeIds) || menteeIds.length === 0) {
      return []
    }
    return menteeIds.map(id => {
      const found = mentees?.find(m => m.id === id)
      return found?.nim || id
    })
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id)
      setForm({
        nama_kelompok: item.nama_kelompok,
        tingkat: item.tingkat,
        mentor: item.mentor ? String(item.mentor) : '', 
        semester_aktif: item.semester_aktif,
        mentees: item.mentees || [] 
      })
    } else {
      setEditingId(null)
      setForm(emptyForm())
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Cek Nama Duplikat
    const isDuplicateName = halaqahs?.some(h => 
      h.nama_kelompok.toLowerCase() === form.nama_kelompok.trim().toLowerCase() && 
      h.id !== editingId
    )

    if (isDuplicateName) {
      toast.error(`Nama kelompok "${form.nama_kelompok}" sudah digunakan!`)
      return
    }

    // Validasi Wajib Isi
    if (!form.nama_kelompok.trim()) {
      toast.error('Nama kelompok wajib diisi!')
      return
    }
    if (!form.tingkat) {
      toast.error('Tingkat / Kategori wajib dipilih!')
      return
    }
    if (!form.mentor) {
      toast.error('Mentor wajib dipilih!')
      return
    }
    if (form.mentees.length === 0) {
      toast.error('Wajib memilih minimal satu mentee!')
      return
    }
    if (!form.semester_aktif.trim()) {
      toast.error('Semester aktif wajib diisi!')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        mentor: parseInt(form.mentor)
      }

      if (editingId) {
        await halaqahService.update(editingId, payload)
        toast.success('Kelompok halaqah diperbarui')
      } else {
        await halaqahService.create(payload)
        toast.success('Kelompok halaqah dibuat')
      }
      setModalOpen(false)
      refetch()
    } catch {
      toast.error('Gagal menyimpan data halaqah')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus kelompok halaqah ini?')) return
    try {
      await halaqahService.delete(id)
      toast.success('Halaqah dihapus')
      refetch()
    } catch {
      toast.error('Gagal menghapus data')
    }
  }

  const getTingkatBadge = (tingkat) => {
    switch(tingkat) {
      case 'TAKHASUS': return <Badge variant="danger">Takhasus</Badge>
      case 'TAHSIN': return <Badge variant="warning">Tahsin</Badge>
      case 'TAHFIDZ': return <Badge variant="success">Tahfidz</Badge>
      default: return <Badge variant="neutral">{tingkat}</Badge>
    }
  }

  // 👇 FILTER SEKARANG ADA DI TEMPAT YANG BENAR (Di luar fungsi lain, sebelum return utama)

  // 1. FILTER MENTOR: Tampilkan yang nganggur + Mentor yang sedang diedit
  const availableMentors = (mentors || []).filter(m => {
    if (editingId && String(m.id) === String(form.mentor)) return true
    return !m.nama_kelompok_halaqah && !m.halaqah?.nama_kelompok
  })

  // 2. FILTER MENTEE: Tampilkan yang nganggur + Mentee yang sudah ada di kelompok ini
  const availableMentees = (mentees || []).filter(m => {
    if (editingId && form.mentees.includes(m.id)) return true
    return !m.halaqah_nama && !m.halaqah
  })

  return (
    <>
      <PageHeader
        title="Manajemen Kelompok Halaqah"
        subtitle="Kelola pembagian kelompok mentoring mahasiswa"
        action={<Button onClick={() => handleOpenModal()}>Tambah Halaqah</Button>}
      />

      <SearchBar value={search} onChange={setSearch} placeholder="Cari nama kelompok..." className="mb-6 max-w-md" />

      {loading ? <TableSkeleton /> : (
        <>
          <Table
            columns={[
              { key: 'nama', label: 'Nama Kelompok' },
              { key: 'tingkat', label: 'Tingkat' },
              { key: 'mentor', label: 'Mentor (NIM)' },
              { key: 'mentees', label: 'Mentee (NIM)' },
              { key: 'semester', label: 'Semester Aktif' },
              { key: 'aksi', label: 'Aksi' },
            ]}
            data={paginated}
            renderRow={(row) => (
              <>
                <td className="px-4 py-3 font-medium text-gray-900">{row.nama_kelompok}</td>
                <td className="px-4 py-3">{getTingkatBadge(row.tingkat)}</td>
                <td className="px-4 py-3 text-gray-600 font-mono text-sm">{getMentorNim(row.mentor)}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-sm">
                  {Array.isArray(getMenteeNims(row.mentees)) && getMenteeNims(row.mentees).length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {getMenteeNims(row.mentees).map((nim, index) => (
                        <span key={index} className="bg-gray-50 px-2 py-0.5 rounded border border-gray-100 w-fit">
                          {nim}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{row.semester_aktif}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleOpenModal(row)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Hapus</Button>
                  </div>
                </td>
              </>
            )}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Kelompok Halaqah' : 'Tambah Kelompok Halaqah'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <Input 
            label="Nama Kelompok Halaqah *" 
            placeholder="Contoh: Kelompok A / Abu Bakar 1" 
            value={form.nama_kelompok} 
            onChange={e => setForm({ ...form, nama_kelompok: e.target.value })} 
            required 
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tingkat / Kategori <span className="text-red-500">*</span></label>
            <select 
              value={form.tingkat} 
              onChange={e => setForm({ ...form, tingkat: e.target.value })} 
              required 
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="">Pilih Tingkat Mentoring...</option>
              <option value="TAKHASUS">Takhasus</option>
              <option value="TAHSIN">Tahsin</option>
              <option value="TAHFIDZ">Tahfidz</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Mentor Pengampu <span className="text-red-500">*</span></label>
            <select 
              required
              value={form.mentor} 
              onChange={e => setForm({ ...form, mentor: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="">Pilih NIM Mentor...</option>
              {/* 👇 SUDAH MEMAKAI FILTER availableMentors */}
              {availableMentors.map(m => (
                <option key={m.id} value={m.id}>{m.nim}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Pilih Anggota Mentee <span className="text-red-500">*</span>
            </label>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 p-3 bg-white space-y-2">
              {/* 👇 SUDAH MEMAKAI FILTER availableMentees */}
              {availableMentees.length > 0 ? (
                availableMentees.map(m => (
                  <label key={m.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                    <input 
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={form.mentees.includes(m.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({ ...form, mentees: [...form.mentees, m.id] })
                        } else {
                          setForm({ ...form, mentees: form.mentees.filter(id => id !== m.id) })
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700 font-mono">
                      {m.nim}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">Semua mentee sudah mendapat kelompok.</p>
              )}
            </div>
            {form.mentees.length === 0 && (
              <p className="text-xs text-red-500 mt-1">Minimal satu mentee harus dipilih.</p>
            )}
          </div>

          <Input 
            label="Semester Aktif *" 
            placeholder="Contoh: 2025-Ganjil" 
            value={form.semester_aktif} 
            onChange={e => setForm({ ...form, semester_aktif: e.target.value })} 
            required 
          />

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" className="flex-1" loading={saving}>
              {editingId ? 'Simpan Perubahan' : 'Buat Kelompok'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}