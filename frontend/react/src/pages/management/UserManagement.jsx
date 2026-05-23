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
import { userService } from '../../services/userService'

const PAGE_SIZE = 8

const emptyForm = () => ({
  nim: '',
  first_name: '', 
  last_name: '',  
  email: '',
  role: '',
  no_hp: '',
})

export default function UserManagement() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebounce(search)

  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm())

  const { data: users, loading, refetch } = useApi(userService.getAll, [])

  useEffect(() => { setPage(1) }, [debounced])

  const filtered = useMemo(() => {
    const q = debounced.toLowerCase()
    return (users ?? []).filter(u => 
      (u.first_name || '').toLowerCase().includes(q) ||
      (u.last_name || '').toLowerCase().includes(q) ||
      (u.nim || '').toLowerCase().includes(q)
    )
  }, [users, debounced])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id)
      setForm({
        nim: item.nim || '',
        first_name: item.first_name || '',
        last_name: item.last_name || '',
        email: item.email || '',
        role: item.role || '',
        fakultas: item.fakultas || '',
        program_studi: item.program_studi || '',
        no_hp: item.no_hp || '',
      })
    } else {
      setEditingId(null)
      setForm(emptyForm())
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validasi Wajib Isi
    if (!form.nim.trim() || !form.first_name.trim() || !form.email.trim() || !form.role || !form.no_hp.trim()) {
      toast.error('Semua kolom bertanda bintang (*) wajib diisi!')
      return
    }

    setSaving(true)
    try {
      const payload = { ...form }
      
      if (!editingId) {
        payload.password = form.nim
        payload.username = form.nim 
      }

      if (editingId) {
        await userService.update(editingId, payload)
        toast.success('Data user berhasil diperbarui')
      } else {
        await userService.createCustom(payload)
        toast.success('User baru berhasil ditambahkan')
      }
      setModalOpen(false)
      refetch()
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Cek apakah error berbentuk JSON Object dari Django
        if (typeof errorData === 'object' && !Array.isArray(errorData)) {
          // Ambil kunci error pertama (misal: 'nim' atau 'email')
          const firstKey = Object.keys(errorData)[0];
          const firstMessage = Array.isArray(errorData[firstKey]) 
            ? errorData[firstKey][0] 
            : errorData[firstKey];
            
          // Tampilkan Alert Merah yang cantik
          toast.error(`Peringatan: ${firstMessage}`);
        } else {
          toast.error('Gagal menyimpan. Periksa kembali inputan Anda.');
        }
      } else {
        toast.error('Gagal terhubung ke server. Pastikan internet lancar.');
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus user ini? Perhatian: Profil mentor/mentee yang terkait dengan akun ini juga akan terhapus!')) return
    try {
      await userService.delete(id)
      toast.success('User berhasil dihapus')
      refetch()
    } catch {
      toast.error('Gagal menghapus user')
    }
  }

  const getRoleBadge = (role) => {
    switch(role) {
      case 'KMF': return <Badge variant="danger">KMF</Badge>
      case 'MENTOR': return <Badge variant="warning">Mentor</Badge>
      case 'MENTEE': return <Badge variant="success">Mentee</Badge>
      case 'LPPIK': return <Badge variant="info">LPPIK</Badge> 
      default: return <Badge variant="neutral">{role}</Badge>
    }
  }

  return (
    <>
      <PageHeader
        title="Manajemen Pengguna (User)"
        subtitle="Kelola data akun mahasiswa, mentor, dan pengurus KMF"
        action={<Button onClick={() => handleOpenModal()}>Tambah User</Button>}
      />

      <SearchBar value={search} onChange={setSearch} placeholder="Cari berdasarkan Nama atau NIM..." className="mb-6 max-w-md" />

      {loading ? <TableSkeleton /> : (
        <>
          <Table
            columns={[
              { key: 'nim', label: 'NIM' },
              { key: 'nama', label: 'Nama Lengkap' },
              { key: 'role', label: 'Role Akses' },
              { key: 'aksi', label: 'Aksi' },
            ]}
            data={paginated}
            renderRow={(row) => (
              <>
                <td className="px-4 py-3 font-mono text-sm text-gray-600">{row.nim}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {`${row.first_name || ''} ${row.last_name || ''}`.trim() || '-'}
                </td>
                <td className="px-4 py-3">{getRoleBadge(row.role)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleOpenModal(row)}>Edit / Detail</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Hapus</Button>
                  </div>
                </td>
              </>
            )}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* MODAL FORM TAMBAH / EDIT */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Detail & Edit User' : 'Tambah User Baru'}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          
          {!editingId && (
            <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg border border-blue-100 mb-4">
              <strong>Info:</strong> Akun ini akan otomatis menggunakan NIM sebagai Username dan Password awal.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="NIM *" 
              placeholder="Contoh: L200..." 
              value={form.nim} 
              onChange={e => setForm({ ...form, nim: e.target.value })} 
              required 
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role / Akses <span className="text-red-500">*</span></label>
              <select 
                value={form.role} 
                onChange={e => setForm({ ...form, role: e.target.value })} 
                required 
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 outline-none transition bg-white"
              >
                <option value="">Pilih Role...</option>
                <option value="MENTEE">Mentee</option>
                <option value="MENTOR">Mentor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Nama Depan *" 
              placeholder="Nama depan" 
              value={form.first_name} 
              onChange={e => setForm({ ...form, first_name: e.target.value })} 
              required 
            />

            <Input 
              label="Nama Belakang" 
              placeholder="Nama belakang (opsional)" 
              value={form.last_name} 
              onChange={e => setForm({ ...form, last_name: e.target.value })} 
            />
          </div>

          <Input 
            type="email"
            label="Alamat Email *" 
            placeholder="email@example.com" 
            value={form.email} 
            onChange={e => setForm({ ...form, email: e.target.value })} 
            required 
          />


          <Input 
            type="tel"
            label="Nomor Handphone (WA) *" 
            placeholder="081234567890" 
            value={form.no_hp} 
            onChange={e => setForm({ ...form, no_hp: e.target.value })} 
            required 
          />

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" className="flex-1" loading={saving}>
              {editingId ? 'Simpan Perubahan' : 'Buat User Baru'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}