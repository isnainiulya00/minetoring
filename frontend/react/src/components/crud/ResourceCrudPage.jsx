import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '../common/PageHeader'
import SearchBar from '../common/SearchBar'
import Table, { Pagination } from '../common/Table'
import Button from '../common/Button'
import Modal from '../common/Modal'
import Input from '../common/Input'
import EmptyState from '../common/EmptyState'
import { TableSkeleton } from '../common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'

const PAGE_SIZE = 8

/**
 * Generic CRUD table for REST resources.
 * fields: [{ key, label, type?: 'text'|'number'|'select', options?: [{value,label}] }]
 */
export default function ResourceCrudPage({
  title,
  subtitle,
  service,
  columns,
  fields,
  searchKeys = [],
  canCreate = true,
  canDelete = true,
  getInitialForm,
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(getInitialForm?.() ?? {})

  const debounced = useDebounce(search)
  const { data: rows, loading, refetch } = useApi(service.getAll, [])

  const filtered = useMemo(() => {
    if (!debounced) return rows ?? []
    const q = debounced.toLowerCase()
    return (rows ?? []).filter((row) =>
      searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)),
    )
  }, [rows, debounced, searchKeys])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await service.create(form)
      toast.success('Data berhasil ditambahkan')
      setModalOpen(false)
      setForm(getInitialForm?.() ?? {})
      refetch()
    } catch (err) {
      const msg = err.response?.data
      toast.error(typeof msg === 'object' ? JSON.stringify(msg) : 'Gagal menyimpan data')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus data ini?')) return
    try {
      await service.delete(id)
      toast.success('Data dihapus')
      refetch()
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={canCreate ? <Button onClick={() => setModalOpen(true)}>Tambah</Button> : null}
      />
      <SearchBar value={search} onChange={setSearch} placeholder="Cari..." className="mb-6 max-w-md" />

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState title="Tidak ada data" />
      ) : (
        <>
          <Table
            columns={columns}
            data={paginated}
            renderRow={(row) => (
              <>
                {columns
                  .filter((c) => c.key !== 'aksi')
                  .map((c) => (
                    <td key={c.key} className="px-4 py-3 text-sm">
                      {row[c.key] ?? '-'}
                    </td>
                  ))}
                {canDelete && (
                  <td className="px-4 py-3">
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>
                      Hapus
                    </Button>
                  </td>
                )}
              </>
            )}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {canCreate && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Tambah ${title}`}>
          <form onSubmit={handleCreate} className="space-y-4">
            {fields.map((f) =>
              f.type === 'select' ? (
                <div key={f.key}>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">{f.label}</label>
                  <select
                    value={form[f.key] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm"
                    required={f.required}
                  >
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <Input
                  key={f.key}
                  label={f.label}
                  type={f.type || 'text'}
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  required={f.required}
                />
              ),
            )}
            <Button type="submit" className="w-full">
              Simpan
            </Button>
          </form>
        </Modal>
      )}
    </>
  )
}
