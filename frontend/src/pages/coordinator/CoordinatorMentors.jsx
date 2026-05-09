import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Label from '../../components/ui/Label'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'

let _id = 2
const seed = [
  { id: 1, name: 'Ahmad', nim:'LXXX', email: 'Lxx@ums.ac.id', phone: '0812…' },
]

export default function CoordinatorMentors() {
  const [rows, setRows] = useState(seed)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)

  const columns = [
    { key: 'name', header: 'Nama' },
    { key: 'nim', header: 'NIM' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Kontak' },
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
    setForm({ name: '', nim: '', email: '', phone: '' })
    setOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm({ name: row.name, nim: row.nim, email: row.email, phone: row.phone })
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
        title="Mentor"
        // description="CRUD data mentor."
        action={
          <Button type="button" onClick={openCreate}>
            Tambah mentor
          </Button>
        }
      />
      <Card>
        <Table columns={columns} data={rows} keyExtractor={(r) => r.id} />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Ubah mentor' : 'Tambah mentor'}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="mentor-form">
              Simpan
            </Button>
          </div>
        }
      >
        <form id="mentor-form" className="space-y-3" onSubmit={save}>
          <div>
            <Label htmlFor="t-name" required>
              Nama
            </Label>
            <Input
              id="t-name"
              required
              className="mt-1.5"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="t-name" required>
              NIM
            </Label>
            <Input
              id="t-nim"
              required
              className="mt-1.5"
              value={form.nim}
              onChange={(e) => setForm((f) => ({ ...f, nim: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="t-email" required>
              Email
            </Label>
            <Input
              id="t-email"
              type="email"
              required
              className="mt-1.5"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="t-phone">Kontak</Label>
            <Input
              id="t-phone"
              className="mt-1.5"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
        </form>
      </Modal>
    </>
  )
}
