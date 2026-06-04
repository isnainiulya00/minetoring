import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePencilSquare } from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import SearchBar from '../../components/common/SearchBar'
import Table from '../../components/common/Table'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { gradeService } from '../../services/gradeService'
import { menteeService } from '../../services/menteeService'

const ASPECTS = [
  { key: 'aspek_1', label: 'Aspek 1' },
  { key: 'aspek_2', label: 'Aspek 2' },
  { key: 'aspek_3', label: 'Aspek 3' },
  { key: 'aspek_4', label: 'Aspek 4' },
  { key: 'aspek_5', label: 'Aspek 5' },
]

const emptyForm = {
  aspek_1: '',
  aspek_2: '',
  aspek_3: '',
  aspek_4: '',
  aspek_5: '',
}

function normalizeList(data) {
  if (Array.isArray(data)) return data
  return data?.results ?? []
}

function getStatusBadge(grade) {
  if (!grade) return <Badge variant="warning">Belum Dinilai</Badge>
  return grade.status_lulus ? <Badge variant="success">Lulus</Badge> : <Badge variant="danger">Belum Lulus</Badge>
}

export default function GradingForm() {
  const { data: gradesData, loading: gradesLoading, refetch } = useApi(gradeService.getAll, [])
  const { data: menteesData, loading: menteesLoading } = useApi(menteeService.getAll, [])

  const [search, setSearch] = useState('')
  const [selectedMentee, setSelectedMentee] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const grades = useMemo(() => normalizeList(gradesData), [gradesData])
  const mentees = useMemo(() => normalizeList(menteesData), [menteesData])

  const gradeByUserId = useMemo(() => {
    const map = new Map()
    grades.forEach((grade) => map.set(String(grade.mentee), grade))
    return map
  }, [grades])

  const filteredMentees = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return mentees
    return mentees.filter((mentee) => (
      `${mentee.nama_lengkap ?? ''} ${mentee.nim ?? ''} ${mentee.halaqah_nama ?? ''}`
        .toLowerCase()
        .includes(q)
    ))
  }, [mentees, search])

  const stats = useMemo(() => {
    const completed = mentees.filter((mentee) => gradeByUserId.has(String(mentee.user))).length
    const totalScore = grades.reduce((sum, grade) => sum + Number(grade.total_nilai || 0), 0)
    return {
      completed,
      pending: Math.max(mentees.length - completed, 0),
      average: grades.length ? Math.round(totalScore / grades.length) : 0,
    }
  }, [grades, gradeByUserId, mentees])

  const totalPreview = ASPECTS.reduce((sum, aspect) => sum + Number(form[aspect.key] || 0), 0)

  const openForm = (mentee) => {
    const existing = gradeByUserId.get(String(mentee.user))
    setSelectedMentee(mentee)
    setSelectedGrade(existing ?? null)
    setForm(existing ? {
      aspek_1: existing.aspek_1 ?? '',
      aspek_2: existing.aspek_2 ?? '',
      aspek_3: existing.aspek_3 ?? '',
      aspek_4: existing.aspek_4 ?? '',
      aspek_5: existing.aspek_5 ?? '',
    } : emptyForm)
  }

  const handleChange = (key, value) => {
    const number = value === '' ? '' : Math.max(0, Math.min(20, Number(value)))
    setForm((current) => ({ ...current, [key]: number }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedMentee?.user) {
      toast.error('Data akun mentee tidak ditemukan.')
      return
    }

    const hasEmpty = ASPECTS.some((aspect) => form[aspect.key] === '')
    if (hasEmpty) {
      toast.error('Lengkapi semua aspek penilaian.')
      return
    }

    const payload = {
      mentee: selectedMentee.user,
      aspek_1: Number(form.aspek_1),
      aspek_2: Number(form.aspek_2),
      aspek_3: Number(form.aspek_3),
      aspek_4: Number(form.aspek_4),
      aspek_5: Number(form.aspek_5),
    }

    setSaving(true)
    try {
      if (selectedGrade?.id) await gradeService.update(selectedGrade.id, payload)
      else await gradeService.create(payload)
      toast.success('Nilai ujian berhasil disimpan.')
      setSelectedMentee(null)
      setSelectedGrade(null)
      setForm(emptyForm)
      refetch()
    } catch (error) {
      const message = error.response?.data?.detail || 'Gagal menyimpan nilai ujian.'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const loading = gradesLoading || menteesLoading

  return (
    <>
      <PageHeader
        title="Input Nilai Ujian"
        subtitle="Kelola penilaian akhir mentee berdasarkan lima aspek utama"
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Sudah Dinilai</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.completed}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Belum Dinilai</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Rata-rata</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.average}</p>
        </div>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Cari nama, NIM, atau halaqah..."
        className="mb-5 max-w-md"
      />

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : !mentees.length ? (
        <EmptyState title="Belum ada mentee" description="Data mentee akan tampil setelah anggota halaqah tersedia." />
      ) : (
        <Table
          columns={[
            { key: 'mentee', label: 'Mentee' },
            { key: 'halaqah', label: 'Halaqah' },
            { key: 'nilai', label: 'Total' },
            { key: 'status', label: 'Status' },
            { key: 'aksi', label: 'Aksi' },
          ]}
          data={filteredMentees}
          emptyMessage="Tidak ada mentee yang cocok."
          renderRow={(mentee) => {
            const grade = gradeByUserId.get(String(mentee.user))
            return (
              <>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{mentee.nama_lengkap}</p>
                  <p className="text-xs text-gray-500">{mentee.nim || '-'}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{mentee.halaqah_nama || '-'}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{grade?.total_nilai ?? '-'}</td>
                <td className="px-4 py-3">{getStatusBadge(grade)}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="secondary" onClick={() => openForm(mentee)}>
                    <HiOutlinePencilSquare className="h-4 w-4" />
                    {grade ? 'Edit' : 'Nilai'}
                  </Button>
                </td>
              </>
            )
          }}
        />
      )}

      <Modal
        open={Boolean(selectedMentee)}
        onClose={() => setSelectedMentee(null)}
        title={`${selectedGrade ? 'Edit' : 'Input'} Nilai`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="font-semibold text-gray-900">{selectedMentee?.nama_lengkap}</p>
            <p className="text-sm text-gray-500">{selectedMentee?.nim || '-'} - {selectedMentee?.halaqah_nama || '-'}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {ASPECTS.map((aspect) => (
              <Input
                key={aspect.key}
                label={`${aspect.label} (0-20)`}
                type="number"
                min={0}
                max={20}
                value={form[aspect.key]}
                onChange={(event) => handleChange(aspect.key, event.target.value)}
                required
              />
            ))}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3">
            <span className="text-sm font-medium text-gray-600">Total otomatis</span>
            <span className="text-xl font-bold text-gray-900">{totalPreview}</span>
          </div>

          <Button type="submit" loading={saving} className="w-full">
            Simpan Nilai
          </Button>
        </form>
      </Modal>
    </>
  )
}
