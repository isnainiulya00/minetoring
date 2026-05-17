import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import Table, { Pagination } from '../../components/common/Table'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { userService } from '../../services/userService'
import { authService } from '../../services/authService'
import { ROLE_LABELS, ROLES } from '../../utils/constants'

const PAGE_SIZE = 8

const emptyForm = () => ({
  username: '',
  password: '',
  email: '',
  role: ROLES.MENTEE,
  first_name: '',
  last_name: '',
  is_active: true,
})

function parseApiError(err) {
  const data = err.response?.data
  if (!data) return 'Gagal menambahkan user'
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  return Object.entries(data)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
    .join(' · ')
}

export default function UserManagement() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)

  const debounced = useDebounce(search)
  const { data: users, loading, refetch } = useApi(userService.getAll, [])

  const filtered = useMemo(
    () =>
      (users ?? []).filter(
        (u) =>
          u.username?.toLowerCase().includes(debounced.toLowerCase()) ||
          u.email?.toLowerCase().includes(debounced.toLowerCase()) ||
          u.first_name?.toLowerCase().includes(debounced.toLowerCase()),
      ),
    [users, debounced],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.password || form.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    setSaving(true)
    try {
      await userService.create(form)
      toast.success('User berhasil ditambahkan — password di-hash di server')

      try {
        await authService.login(form.username, form.password)
        toast.success('Verifikasi login JWT berhasil')
      } catch {
        toast.error('User dibuat, tetapi uji login gagal — periksa is_active dan password')
      }

      setModalOpen(false)
      setForm(emptyForm())
      refetch()
    } catch (err) {
      toast.error(parseApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus user ini?')) return
    try {
      await userService.delete(id)
      toast.success('User dihapus')
      refetch()
    } catch {
      toast.error('Gagal menghapus user')
    }
  }

  return (
    <>
      <PageHeader
        title="Manajemen User"
        subtitle="KMF · CRUD pengguna dengan password ter-hash (set_password)"
        action={<Button onClick={() => setModalOpen(true)}>Tambah User</Button>}
      />
      <SearchBar value={search} onChange={setSearch} placeholder="Cari username atau email..." className="mb-6 max-w-md" />

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState title="Tidak ada user" />
      ) : (
        <>
          <Table
            columns={[
              { key: 'username', label: 'Username' },
              { key: 'name', label: 'Nama' },
              { key: 'role', label: 'Role' },
              { key: 'email', label: 'Email' },
              { key: 'active', label: 'Status' },
              { key: 'aksi', label: 'Aksi' },
            ]}
            data={paginated}
            renderRow={(row) => (
              <>
                <td className="px-4 py-3 font-medium">{row.username}</td>
                <td className="px-4 py-3">
                  {[row.first_name, row.last_name].filter(Boolean).join(' ') || '-'}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="neutral">{ROLE_LABELS[row.role] || row.role}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{row.email || '-'}</td>
                <td className="px-4 py-3">
                  <Badge variant={row.is_active ? 'success' : 'danger'}>
                    {row.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>
                    Hapus
                  </Button>
                </td>
              </>
            )}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah User">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nama Depan"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
            <Input
              label="Nama Belakang"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded border-gray-300"
            />
            Akun aktif (dapat login JWT)
          </label>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm"
            >
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full" loading={saving}>
            Simpan
          </Button>
        </form>
      </Modal>
    </>
  )
}
