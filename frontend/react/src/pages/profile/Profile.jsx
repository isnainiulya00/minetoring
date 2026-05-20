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
import { mediaUrl } from '../../utils/mediaUrl'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    no_hp: user?.no_hp || '',
  })
  const [password, setPassword] = useState('')
  const [foto, setFoto] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('first_name', form.first_name)
      fd.append('last_name', form.last_name)
      fd.append('email', form.email)
      fd.append('no_hp', form.no_hp)
      if (password) fd.append('password', password)
      if (foto) fd.append('foto', foto)
      const updated = await authService.updateMe(fd)
      updateUser(updated)
      setPassword('')
      setFoto(null)
      toast.success('Profil diperbarui')
    } catch {
      toast.error('Gagal memperbarui profil')
    } finally {
      setSaving(false)
    }
  }

  const fotoSrc = user?.foto_url ? mediaUrl(user.foto_url) : null

  return (
    <>
      <PageHeader title="Profil" subtitle="Kelola informasi akun dan keamanan" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center text-center lg:col-span-1">
          {fotoSrc ? (
            <img src={fotoSrc} alt="" className="h-24 w-24 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-900 text-2xl font-bold text-white">
              {getInitials(user?.first_name || user?.username)}
            </div>
          )}
          <h2 className="mt-4 font-display text-lg font-semibold">{user?.username}</h2>
          <Badge variant="neutral" className="mt-2">
            {ROLE_LABELS[user?.role] || user?.role}
          </Badge>
          <label className="mt-4 cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
            Ganti foto profil
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFoto(e.target.files?.[0] || null)}
            />
          </label>
          {foto && <p className="mt-1 text-xs text-gray-500">{foto.name}</p>}
        </Card>

        <Card className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nama Depan" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              <Input label="Nama Belakang" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="No. HP" value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} />
            <Input label="Username" value={user?.username || ''} disabled />
            <Input
              label="Password baru (kosongkan jika tidak diubah)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Button type="submit" loading={saving}>
              Simpan Perubahan
            </Button>
          </form>
        </Card>
      </div>
    </>
  )
}
