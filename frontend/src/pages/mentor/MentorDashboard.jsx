import PageHeader from '../../components/layout/PageHeader'
import Card from '../../components/ui/Card'
import { Link } from 'react-router-dom'

// const stats = [
//   { label: 'Jumlah Mentee', value: '10', hint: 'Semester ini' },
//   { label: 'Pertemuan minggu ini', value: '3', hint: 'Jadwal terdekat' },
//   { label: 'Presensi terisi', value: '94%', hint: '4 dari 5 sesi' },
// ]
const stats = [
  { label: 'Jumlah Mentee', value: '10' },
  { label: 'Presensi terisi', value: '94%'},
]

export default function MentorDashboard() {
  return (
    <>
      <PageHeader
        title="Selamat datang, Mentor!"
        description="Halaqoh AA-01"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} padding className="!p-5">
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{s.value}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="Aksi cepat" description="Tugas yang sering dipakai mentor.">
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/mentor/presensi"
                className="font-medium text-brand-700 hover:text-brand-800"
              >
                Isi presensi pertemuan →
              </Link>
            </li>
            <li>
              <Link
                to="/mentor/materi"
                className="font-medium text-brand-700 hover:text-brand-800"
              >
                Buka materi pertemuan →
              </Link>
            </li>
          </ul>
        </Card>
        {/* <Card title="Jadwal hari ini" description="Contoh data statis; sambungkan ke DRF nanti.">
          <p className="text-sm text-slate-600">
            Tidak ada jadwal untuk hari ini. Endpoint{' '}
            <code className="rounded bg-slate-100 px-1 text-xs">GET /sessions/today/</code> bisa
            mengisi blok ini.
          </p>
        </Card> */}
      </div>
    </>
  )
}
