import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  HiOutlineBookOpen,
  HiOutlineArrowDownTray,
  HiOutlineLink,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
} from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import Card, { CardHeader } from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { materiService } from '../../services/materiService'
import { jadwalService } from '../../services/jadwalService'
import { halaqahService } from '../../services/halaqahService'
import { useAuthStore } from '../../store/authStore'
import { canManageMateri } from '../../utils/roleHelpers'
import { mediaUrl } from '../../utils/mediaUrl'

const TIPE_OPTIONS = [
  { value: 'FILE', label: 'File (PDF/Dokumen)' },
  { value: 'LINK', label: 'Tautan' },
  { value: 'VIDEO', label: 'Video (URL)' },
]

export default function Materi() {
  const user = useAuthStore((s) => s.user)
  const canManage = canManageMateri(user)
  const { data: materi, loading, refetch } = useApi(materiService.getAll, [])
  const { data: jadwal } = useApi(jadwalService.getAll, [])
  const { data: halaqah } = useApi(halaqahService.getAll, [])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    jadwal: '',
    judul: '',
    deskripsi: '',
    tipe: 'FILE',
    link_url: '',
  })
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const halaqahMap = useMemo(
    () => Object.fromEntries((halaqah ?? []).map((h) => [h.id, h.nama_kelompok])),
    [halaqah],
  )

  const jadwalMap = useMemo(
    () =>
      Object.fromEntries(
        (jadwal ?? []).map((j) => [
          j.id,
          `#${j.pertemuan_ke} ${j.topik || 'Pertemuan'} · ${halaqahMap[j.halaqah] || ''}`,
        ]),
      ),
    [jadwal, halaqahMap],
  )

  const openCreate = () => {
    setEditing(null)
    setForm({ jadwal: '', judul: '', deskripsi: '', tipe: 'FILE', link_url: '' })
    setFile(null)
    setModalOpen(true)
  }

  const openEdit = (m) => {
    setEditing(m)
    setForm({
      jadwal: m.jadwal,
      judul: m.judul,
      deskripsi: m.deskripsi || '',
      tipe: m.tipe,
      link_url: m.link_url || '',
    })
    setFile(null)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.jadwal || !form.judul) {
      toast.error('Jadwal dan judul wajib diisi')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('jadwal', form.jadwal)
      fd.append('judul', form.judul)
      fd.append('deskripsi', form.deskripsi)
      fd.append('tipe', form.tipe)
      if (form.link_url) fd.append('link_url', form.link_url)
      if (file) fd.append('file', file)
      if (editing) await materiService.update(editing.id, fd)
      else await materiService.create(fd)
      toast.success(editing ? 'Materi diperbarui' : 'Materi ditambahkan')
      setModalOpen(false)
      refetch()
    } catch (err) {
      const msg = err.response?.data
      toast.error(typeof msg === 'object' ? JSON.stringify(msg) : 'Gagal menyimpan materi')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus materi ini?')) return
    try {
      await materiService.delete(id)
      toast.success('Materi dihapus')
      refetch()
    } catch {
      toast.error('Gagal menghapus materi')
    }
  }

  const openMateri = (m) => {
    if (m.tipe === 'LINK' || m.tipe === 'VIDEO') {
      if (m.link_url) window.open(m.link_url, '_blank')
      return
    }
    if (m.file_url) window.open(mediaUrl(m.file_url), '_blank')
  }

  return (
    <>
      <PageHeader
        title="Materi Mentoring"
        subtitle={canManage ? 'Kelola materi per jadwal pertemuan' : 'Lihat materi mentoring halaqah Anda'}
        action={
          canManage && (
            <Button onClick={openCreate}>
              <HiOutlinePlus className="mr-1 h-4 w-4" />
              Tambah Materi
            </Button>
          )
        }
      />

      {loading ? (
        <TableSkeleton rows={4} cols={2} />
      ) : !materi?.length ? (
        <EmptyState
          title="Belum ada materi"
          description={
            canManage
              ? 'Unggah materi dan tautkan ke jadwal pertemuan.'
              : 'Materi akan muncul setelah KMF mengunggahnya.'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materi.map((m) => (
            <Card key={m.id} hover glass>
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <HiOutlineBookOpen className="h-5 w-5" />
                </div>
                <Badge variant="neutral">{m.tipe}</Badge>
              </div>
              <CardHeader title={m.judul} subtitle={m.jadwal_label || jadwalMap[m.jadwal]} />
              {m.deskripsi && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">{m.deskripsi}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openMateri(m)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {m.tipe === 'LINK' || m.tipe === 'VIDEO' ? (
                    <HiOutlineLink className="h-4 w-4" />
                  ) : (
                    <HiOutlineArrowDownTray className="h-4 w-4" />
                  )}
                  {m.tipe === 'LINK' || m.tipe === 'VIDEO' ? 'Buka tautan' : 'Unduh file'}
                </button>
                {canManage && (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => openEdit(m)}>
                      <HiOutlinePencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(m.id)}>
                      <HiOutlineTrash className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Materi' : 'Tambah Materi'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Jadwal pertemuan</label>
            <select
              required
              value={form.jadwal}
              onChange={(e) => setForm({ ...form, jadwal: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              disabled={Boolean(editing)}
            >
              <option value="">Pilih jadwal</option>
              {(jadwal ?? []).map((j) => (
                <option key={j.id} value={j.id}>
                  {jadwalMap[j.id]}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Judul"
            required
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
          />
          <div>
            <label className="text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              rows={2}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tipe materi</label>
            <select
              value={form.tipe}
              onChange={(e) => setForm({ ...form, tipe: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              {TIPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {(form.tipe === 'LINK' || form.tipe === 'VIDEO') && (
            <Input
              label="URL"
              type="url"
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
            />
          )}
          {form.tipe === 'FILE' && (
            <div>
              <label className="text-sm font-medium text-gray-700">File (PDF/DOC)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                className="mt-1 block w-full text-sm"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          )}
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </form>
      </Modal>
    </>
  )
}
