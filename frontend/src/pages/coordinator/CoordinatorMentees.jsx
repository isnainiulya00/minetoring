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
  { id: 1, name: 'Aisyah Rahma', email: 'L200@ums.ac.id', halaqoh: 'Halaqoh AA-01' },
]

export default function CoordinatorMentees() {
  const [rows, setRows] = useState(seed)
  const [form, setForm] = useState({ name: '', email: '', halaqoh: 'Halaqoh AA-01' })
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)

  const columns = [
    { key: 'name', header: 'Nama' },
    { key: 'email', header: 'Email' },
    { key: 'halaqoh', header: 'Halaqoh' },
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
    setForm({ name: '', email: '', halaqoh: 'Halaqoh A' })
    setOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm({ name: row.name, email: row.email, halaqoh: row.halaqoh })
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
        title="Mentee"
        // description="Kelola data mentee dan penempatan halaqoh."
        action={
          <Button type="button" onClick={openCreate}>
            Tambah mentee
          </Button>
        }
      />
      <Card>
        <Table columns={columns} data={rows} keyExtractor={(r) => r.id} />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Ubah mentee' : 'Tambah mentee'}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="mentee-form">
              Simpan
            </Button>
          </div>
        }
      >
        <form id="mentee-form" className="space-y-3" onSubmit={save}>
          <div>
            <Label htmlFor="m-name" required>
              Nama
            </Label>
            <Input
              id="m-name"
              required
              className="mt-1.5"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="m-email" required>
              Email
            </Label>
            <Input
              id="m-email"
              type="email"
              required
              className="mt-1.5"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="m-hq">Halaqoh</Label>
            <Select
              id="m-hq"
              className="mt-1.5"
              value={form.halaqoh}
              onChange={(e) => setForm((f) => ({ ...f, halaqoh: e.target.value }))}
            >
              <option>Halaqoh AA-01</option>
              <option>Halaqoh AB-01</option>
            </Select>
          </div>
        </form>
      </Modal>
    </>
  )
}
