import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Label from '../../components/ui/Label'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'

let _id = 3
const seed = [
  { id: 1, name: 'Halaqoh AA-01', mentor: 'Aina'},
  { id: 2, name: 'Halaqoh AB-01', mentor: 'Fatimah' },
]

export default function CoordinatorHalaqoh() {
  const [rows, setRows] = useState(seed)
  const [form, setForm] = useState({ name: '', mentor: '' })
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)

  const columns = [
    { key: 'name', header: 'Nama' },
    { key: 'mentor', header: 'Mentor' },
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
    setForm({ name: '', mentor: '' })
    setOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm({ name: row.name, mentor: row.mentor})
    setOpen(true)
  }

  function save(e) {
    e.preventDefault()
    if (editing) {
      setRows((r) =>
        r.map((x) => (x.id === editing.id ? { ...x, ...form } : x))
      )
    } else {
      _id += 1
      setRows((r) => [...r, { id: _id, ...form }])
    }
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Halaqoh"
        // description="CRUD data halaqoh — sambungkan ke viewset DRF."
        action={
          <Button type="button" onClick={openCreate}>
            Tambah halaqoh
          </Button>
        }
      />
      <Card>
        <Table columns={columns} data={rows} keyExtractor={(r) => r.id} />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Ubah halaqoh' : 'Tambah halaqoh'}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="halaqoh-form">
              Simpan
            </Button>
          </div>
        }
      >
        <form id="halaqoh-form" className="space-y-3" onSubmit={save}>
          <div>
            <Label htmlFor="name" required>
              Nama
            </Label>
            <Input
              id="name"
              required
              className="mt-1.5"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="mentor">Mentor</Label>
            <Input
              id="mentor"
              className="mt-1.5"
              value={form.mentor}
              onChange={(e) => setForm((f) => ({ ...f, mentor: e.target.value }))}
            />
          </div>
        </form>
      </Modal>
    </>
  )
}
