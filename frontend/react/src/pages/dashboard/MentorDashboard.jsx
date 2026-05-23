import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import { useAuthStore } from '../../store/authStore'

export default function MentorDashboard() {
  const user = useAuthStore((s) => s.user)

  return (
    <>
      <PageHeader 
        title={`Ahlan wa Sahlan, Mentor ${user?.first_name || ''}!`} 
        subtitle="Pantau perkembangan halaqah dan anak didik Anda di sini" 
      />
      
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card glass>
          <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-3 mb-3">Tugas Anda Minggu Ini</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Mengisi presensi kehadiran mentee</li>
            <li>• Menilai tugas / resume mentee</li>
            <li>• Memperbarui catatan mutabaah</li>
          </ul>
        </Card>

        <Card className="bg-blue-50 border-blue-100 text-blue-900">
          <h3 className="font-semibold pb-3">Informasi</h3>
          <p className="text-sm opacity-80">
            Pastikan seluruh presensi dan nilai telah diisi sebelum akhir semester agar sertifikat mentee dapat diterbitkan oleh KMF.
          </p>
        </Card>
      </div>
    </>
  )
}