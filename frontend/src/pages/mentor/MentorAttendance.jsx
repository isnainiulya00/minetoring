import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import Table from '../../components/ui/Table'

const initialRows = [
  { id: 1, name: 'Aisyah Rahma', nis: 'L100', status: 'Hadir', note: '' },
  { id: 2, name: 'Bima Pratama', nis: 'L200', status: 'Izin', note: 'Sakit' },
  { id: 3, name: 'Citra Lestari', nis: 'L300', status: 'Belum', note: '' },
]

export default function MentorAttendance() {
  const [rows, setRows] = useState(initialRows)
  const [modal, setModal] = useState(null)

  const columns = [
    { key: 'name', header: 'Mentee' },
    { key: 'nis', header: 'NIM' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={
            row.status === 'Hadir'
              ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800'
              : row.status === 'Izin'
                ? 'rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800'
                : 'rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600'
          }
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'aksi',
      header: '',
      render: (row) => (
        <Button type="button" variant="secondary" size="sm" onClick={() => setModal(row)}>
          Ubah
        </Button>
      ),
    },
  ]

  function saveModal(status) {
    if (!modal) return
    setRows((prev) =>
      prev.map((r) => (r.id === modal.id ? { ...r, status } : r))
    )
    setModal(null)
  }

  return (
    <>
      <PageHeader
        title="Presensi"
        // description="Catat kehadiran mentee per pertemuan. Integrasikan dengan endpoint DRF Anda."
        action={
          <Button type="button" variant="secondary">
            Pilih pertemuan
          </Button>
        }
      />
      <Card title="Halaqoh AA-01 — Pertemuan 5">
        {/* description="Contoh tabel; data dari API mengganti state lokal." */}
        <Table columns={columns} data={rows} keyExtractor={(r) => r.id} />
      </Card>

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal ? `Presensi: ${modal.name}` : ''}
        description="Pilih status kehadiran."
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)}>
              simpan
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700" htmlFor="st">
            Status
          </label>
          <Select
            id="st"
            defaultValue={modal?.status}
            onChange={(e) =>
              modal &&
              setRows((prev) =>
                prev.map((r) => (r.id === modal.id ? { ...r, status: e.target.value } : r))
              )
            }
          >
            <option value="Belum">Belum</option>
            <option value="Hadir">Hadir</option>
            <option value="Izin">Izin</option>
            <option value="Alpha">Alpha</option>
          </Select>
        </div>
      </Modal>
    </>
  )
}
