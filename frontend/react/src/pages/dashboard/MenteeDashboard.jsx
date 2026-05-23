import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import { useAuthStore } from '../../store/authStore'

export default function MenteeDashboard() {
  const user = useAuthStore((s) => s.user)

  return (
    <>
      <PageHeader 
        title={`Halo, ${user?.first_name || 'Sobat'}!`} 
        subtitle="Selamat datang di MINE-TORING (Mentoring AIK)" 
      />
      
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <h3 className="font-semibold opacity-90">Progress Mentoring</h3>
          <p className="mt-4 text-sm opacity-75">Kelompok dan Jadwal Anda dapat dilihat melalui menu di samping.</p>
        </Card>

        <Card glass className="col-span-1 md:col-span-2">
          <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-3 mb-3">Pengingat Penting</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold">1.</span> 
              Jangan lupa melakukan presensi di setiap pertemuan bersama Mentor.
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 font-bold">2.</span> 
              Bagi kelompok Tahfidz/Tahsin, wajib mengunggah Resume materi.
            </li>
          </ul>
        </Card>
      </div>
    </>
  )
}