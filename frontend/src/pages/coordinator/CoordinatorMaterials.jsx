import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Label from '../../components/ui/Label'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import Table from '../../components/ui/Table'

let _id = 2
const seed = [
  {
    id: 1,
    title: 'Berorganisasi yang baik sesuai ajaran islam',
    pertemuan: 'Pertemuan 5',
    halaqoh: 'Semua',
    tipe: 'PDF',
  },
]

export default function CoordinatorMaterials() {
  const [rows, setRows] = useState(seed)
  const [form, setForm] = useState({
    title: '',
    pertemuan: '',
    halaqoh: 'Semua',
    tipe: 'PDF',
  })
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)

  const columns = [
    { key: 'title', header: 'Judul' },
    { key: 'pertemuan', header: 'Pertemuan' },
    { key: 'halaqoh', header: 'Halaqoh' },
    { key: 'tipe', header: 'Tipe' },
    {
      key: 'aksi',
      header: '',
      render: (row) => (
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => openEdit(row)}>
            Ubah
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setRows((r) => r.filter((x) => x.id !== row.id))}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ]

  function openCreate() {
    setEditing(null)
    setForm({ title: '', pertemuan: '', halaqoh: 'Semua', tipe: 'PDF' })
    setOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm({
      title: row.title,
      pertemuan: row.pertemuan,
      halaqoh: row.halaqoh,
      tipe: row.tipe,
    })
    setOpen(true)
  }

  function save(e) {
    e.preventDefault()
    if (editing) {
      setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, ...form } : x)))
    } else {
      _id += 1
      setRows((r) => [...r, { id: _id, ...form }])
    }
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Materi"
        // description="Unggah dan kelola materi per pertemuan / halaqoh."
        action={
          <Button type="button" onClick={openCreate}>
            Tambah materi
          </Button>
        }
      />
      <Card>
        <Table columns={columns} data={rows} keyExtractor={(r) => r.id} />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Ubah materi' : 'Unggah materi'}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="mat-form">
              Simpan
            </Button>
          </div>
        }
      >
        <form id="mat-form" className="space-y-3" onSubmit={save}>
          <div>
            <Label htmlFor="mat-title" required>
              Judul
            </Label>
            <Input
              id="mat-title"
              required
              className="mt-1.5"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="mat-pt">Pertemuan</Label>
            <Input
              id="mat-pt"
              className="mt-1.5"
              value={form.pertemuan}
              onChange={(e) => setForm((f) => ({ ...f, pertemuan: e.target.value }))}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="mat-hq">Halaqoh</Label>
              <Select
                id="mat-hq"
                className="mt-1.5"
                value={form.halaqoh}
                onChange={(e) => setForm((f) => ({ ...f, halaqoh: e.target.value }))}
              >
                <option>Semua</option>
                <option>Halaqoh AA-01</option>
                <option>Halaqoh AB-01</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="mat-type">Tipe</Label>
              <Select
                id="mat-type"
                className="mt-1.5"
                value={form.tipe}
                onChange={(e) => setForm((f) => ({ ...f, tipe: e.target.value }))}
              >
                <option>PDF</option>
                <option>Slide</option>
                <option>Tautan</option>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="mat-file">Berkas (contoh)</Label>
            <Input id="mat-file" type="file" className="mt-1.5 py-2" />
          </div>
        </form>
      </Modal>
    </>
  )
}
