import { useState } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import { ROLE_LABELS } from '../../utils/constants'
import { getInitials } from '../../utils/formatters'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await authService.updateUser(user.id, form)
      updateUser(updated)
      toast.success('Profil diperbarui')
    } catch {
      toast.error('Gagal memperbarui profil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Profil" subtitle="Informasi akun Anda" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center text-center lg:col-span-1">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-900 text-2xl font-bold text-white">
            {getInitials(user?.first_name || user?.username)}
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold">{user?.username}</h2>
          <Badge variant="neutral" className="mt-2">
            {ROLE_LABELS[user?.role] || user?.role}
          </Badge>
        </Card>

        <Card className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Nama Depan" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <Input label="Nama Belakang" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Username" value={user?.username || ''} disabled />
            <Button type="submit" loading={saving}>Simpan Perubahan</Button>
          </form>
        </Card>
      </div>
    </>
  )
}
