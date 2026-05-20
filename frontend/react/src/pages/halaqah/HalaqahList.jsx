import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { HiOutlineChevronRight } from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { halaqahService } from '../../services/halaqahService'
import { mentorService } from '../../services/mentorService'
import { useAuthStore } from '../../store/authStore'
import { canManageHalaqah } from '../../utils/roleHelpers'
import { TINGKAT_HALAQAH } from '../../utils/constants'
import toast from 'react-hot-toast'

const TINGKAT_OPTIONS = Object.keys(TINGKAT_HALAQAH)

export default function HalaqahList() {
  const user = useAuthStore((s) => s.user)
  const canManage = canManageHalaqah(user)
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)
  const { data: halaqah, loading, refetch } = useApi(halaqahService.getAll, [])
  const { data: mentors } = useApi(mentorService.getAll, [])

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    nama_kelompok: '',
    tingkat: 'TAHFIDZ',
    mentor: '',
    semester_aktif: '',
  })

  const mentorMap = useMemo(
    () => Object.fromEntries((mentors ?? []).map((m) => [m.id, m.nama_lengkap])),
    [mentors],
  )

  const filtered = useMemo(
    () =>
      (halaqah ?? []).filter((h) =>
        h.nama_kelompok?.toLowerCase().includes(debounced.toLowerCase()),
      ),
    [halaqah, debounced],
  )

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await halaqahService.create({
        ...form,
        mentor: form.mentor ? Number(form.mentor) : null,
      })
      toast.success('Halaqah ditambahkan')
      setModalOpen(false)
      setForm({ nama_kelompok: '', tingkat: 'TAHFIDZ', mentor: '', semester_aktif: '' })
      refetch()
    } catch {
      toast.error('Gagal menambah halaqah')
    }
  }

  return (
    <>
      <PageHeader
        title="Halaqah"
        subtitle={canManage ? 'Kelola kelompok mentoring fakultas' : 'Daftar halaqah mentoring'}
        action={canManage && <Button onClick={() => setModalOpen(true)}>Tambah Halaqah</Button>}
      />
      <SearchBar value={search} onChange={setSearch} placeholder="Cari halaqah..." className="mb-6 max-w-md" />

      {loading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Belum ada halaqah" description="Data halaqah akan muncul setelah ditambahkan." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((h) => (
            <Link key={h.id} to={`/halaqah/${h.id}`}>
              <Card hover className="group h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-gray-900 group-hover:text-gray-700">
                      {h.nama_kelompok}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Mentor: {mentorMap[h.mentor] || h.mentor_nama || '-'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {h.jumlah_mentee ?? 0} mentee · {h.semester_aktif || '—'}
                    </p>
                  </div>
                  <HiOutlineChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-600" />
                </div>
                <div className="mt-4 flex gap-2">
                  <Badge variant="neutral">{TINGKAT_HALAQAH[h.tingkat] || h.tingkat}</Badge>
                  <Badge variant="success">Aktif</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Halaqah">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nama kelompok" required value={form.nama_kelompok} onChange={(e) => setForm({ ...form, nama_kelompok: e.target.value })} />
          <div>
            <label className="text-sm font-medium text-gray-700">Tingkat</label>
            <select
              value={form.tingkat}
              onChange={(e) => setForm({ ...form, tingkat: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              {TINGKAT_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {TINGKAT_HALAQAH[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Mentor</label>
            <select
              value={form.mentor}
              onChange={(e) => setForm({ ...form, mentor: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Pilih mentor</option>
              {(mentors ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama_lengkap}
                </option>
              ))}
            </select>
          </div>
          <Input label="Semester aktif" value={form.semester_aktif} onChange={(e) => setForm({ ...form, semester_aktif: e.target.value })} placeholder="Ganjil-2026" />
          <Button type="submit" className="w-full">
            Simpan
          </Button>
        </form>
      </Modal>
    </>
  )
}
