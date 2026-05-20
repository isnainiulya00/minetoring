import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus } from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import EmptyState from '../../components/common/EmptyState'
import HalaqohRekapTable from '../../components/rekap/HalaqohRekapTable'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { hafalanService } from '../../services/hafalanService'
import { menteeService } from '../../services/menteeService'
import { analyticsService } from '../../services/analyticsService'
import { useAuthStore } from '../../store/authStore'
import { canEditHafalan, isMonitoring } from '../../utils/roleHelpers'

export default function Hafalan() {
  const user = useAuthStore((s) => s.user)
  const { data: hafalan, loading, refetch } = useApi(hafalanService.getAll, [])
  const { data: mentees } = useApi(menteeService.getAll, [])
  const { data: rekap, loading: rekapLoading } = useApi(
    () => (isMonitoring(user) ? analyticsService.rekapHalaqah() : Promise.resolve([])),
    [user?.role],
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    mentee: '',
    nama_surah: '',
    ayat_awal: 1,
    ayat_akhir: 1,
    nilai: '',
    is_lulus: false,
    catatan_mentor: '',
    tanggal: new Date().toISOString().slice(0, 10),
  })
  const [saving, setSaving] = useState(false)

  const menteeMap = useMemo(
    () => Object.fromEntries((mentees ?? []).map((m) => [m.id, m.nama_lengkap])),
    [mentees],
  )

  const groupedByMentee = useMemo(() => {
    const map = {}
    for (const h of hafalan ?? []) {
      const key = h.mentee
      if (!map[key]) map[key] = []
      map[key].push(h)
    }
    return map
  }, [hafalan])

  const openCreate = () => {
    setEditing(null)
    setForm({
      mentee: mentees?.[0]?.id || '',
      nama_surah: '',
      ayat_awal: 1,
      ayat_akhir: 1,
      nilai: '',
      is_lulus: false,
      catatan_mentor: '',
      tanggal: new Date().toISOString().slice(0, 10),
    })
    setModalOpen(true)
  }

  const openEdit = (h) => {
    setEditing(h)
    setForm({
      mentee: h.mentee,
      nama_surah: h.nama_surah,
      ayat_awal: h.ayat_awal,
      ayat_akhir: h.ayat_akhir,
      nilai: h.nilai ?? '',
      is_lulus: h.is_lulus,
      catatan_mentor: h.catatan_mentor || '',
      tanggal: h.tanggal || new Date().toISOString().slice(0, 10),
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        nilai: form.nilai ? Number(form.nilai) : null,
        is_lulus: Boolean(form.is_lulus),
      }
      if (editing) await hafalanService.update(editing.id, payload)
      else await hafalanService.create(payload)
      toast.success('Data hafalan disimpan')
      setModalOpen(false)
      refetch()
    } catch {
      toast.error('Gagal menyimpan hafalan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus data hafalan?')) return
    try {
      await hafalanService.delete(id)
      toast.success('Data dihapus')
      refetch()
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  if (isMonitoring(user)) {
    return (
      <>
        <PageHeader title="Rekap Mutabaah / Hafalan" subtitle="Monitoring progress hafalan per halaqah" />
        <HalaqohRekapTable data={rekap} loading={rekapLoading} showResume={false} showPresensi={false} />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Mutabaah / Hafalan"
        subtitle={canEditHafalan(user) ? 'Catat hafalan per mentee' : 'Progress hafalan pribadi'}
        action={
          canEditHafalan(user) && (
            <Button onClick={openCreate}>
              <HiOutlinePlus className="mr-1 h-4 w-4" />
              Tambah Hafalan
            </Button>
          )
        }
      />

      {loading ? (
        <TableSkeleton rows={4} cols={2} />
      ) : !hafalan?.length ? (
        <EmptyState title="Belum ada data hafalan" description="Mentor dapat mencatat mutabaah mentee." />
      ) : canEditHafalan(user) ? (
        <div className="space-y-8">
          {Object.entries(groupedByMentee).map(([menteeId, items]) => (
            <section key={menteeId}>
              <h2 className="mb-3 font-display text-lg font-semibold text-gray-900">
                {menteeMap[Number(menteeId)] || items[0]?.mentee_nama || 'Mentee'}
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {items.map((h) => (
                  <Card key={h.id} glass>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{h.nama_surah}</h3>
                        <p className="text-xs text-gray-500">
                          Ayat {h.ayat_awal} – {h.ayat_akhir}
                          {h.nilai != null && ` · Nilai: ${h.nilai}`}
                        </p>
                        {h.catatan_mentor && (
                          <p className="mt-1 text-sm text-gray-600">{h.catatan_mentor}</p>
                        )}
                      </div>
                      <Badge variant={h.is_lulus ? 'success' : 'neutral'}>
                        {h.is_lulus ? 'Lulus' : 'Proses'}
                      </Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(h)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(h.id)}>
                        Hapus
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(hafalan ?? []).map((h) => (
            <Card key={h.id} glass>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{h.nama_surah}</h3>
                  <p className="text-xs text-gray-500">
                    Ayat {h.ayat_awal} – {h.ayat_akhir}
                  </p>
                  {h.catatan_mentor && (
                    <p className="mt-1 text-sm text-gray-600">{h.catatan_mentor}</p>
                  )}
                </div>
                <Badge variant={h.is_lulus ? 'success' : 'neutral'}>
                  {h.is_lulus ? 'Lulus' : 'Proses'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Hafalan' : 'Tambah Hafalan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Mentee</label>
            <select
              required
              value={form.mentee}
              onChange={(e) => setForm({ ...form, mentee: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              disabled={Boolean(editing)}
            >
              {(mentees ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama_lengkap}
                </option>
              ))}
            </select>
          </div>
          <Input label="Nama Surah" required value={form.nama_surah} onChange={(e) => setForm({ ...form, nama_surah: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ayat awal" type="number" min={1} value={form.ayat_awal} onChange={(e) => setForm({ ...form, ayat_awal: e.target.value })} />
            <Input label="Ayat akhir" type="number" min={1} value={form.ayat_akhir} onChange={(e) => setForm({ ...form, ayat_akhir: e.target.value })} />
          </div>
          <Input label="Nilai (0-100)" type="number" min={0} max={100} value={form.nilai} onChange={(e) => setForm({ ...form, nilai: e.target.value })} />
          <Input label="Tanggal" type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_lulus} onChange={(e) => setForm({ ...form, is_lulus: e.target.checked })} />
            Tandai lulus
          </label>
          <div>
            <label className="text-sm font-medium text-gray-700">Catatan mentor</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              rows={2}
              value={form.catatan_mentor}
              onChange={(e) => setForm({ ...form, catatan_mentor: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </form>
      </Modal>
    </>
  )
}
