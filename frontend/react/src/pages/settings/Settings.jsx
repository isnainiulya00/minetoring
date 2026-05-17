import PageHeader from '../../components/common/PageHeader'
import Card, { CardHeader } from '../../components/common/Card'
import Button from '../../components/common/Button'
import { useAuthStore } from '../../store/authStore'

export default function Settings() {
  const logout = useAuthStore((s) => s.logout)

  return (
    <>
      <PageHeader title="Pengaturan" subtitle="Preferensi aplikasi" />

      <div className="max-w-2xl space-y-4">
        <Card>
          <CardHeader title="Notifikasi" subtitle="Atur pemberitahuan sistem" />
          <label className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm">
            <span>Email reminder mentoring</span>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
          </label>
        </Card>

        <Card>
          <CardHeader title="Keamanan" subtitle="Kelola sesi login" />
          <Button variant="danger" onClick={logout}>
            Keluar dari semua perangkat
          </Button>
        </Card>

        <Card glass>
          <CardHeader title="Tentang" subtitle="MINE-TORING v1.0" />
          <p className="text-sm text-gray-600">
            Sistem manajemen mentoring AIK terintegrasi — presensi, materi, resume, dan monitoring halaqah.
          </p>
        </Card>
      </div>
    </>
  )
}
