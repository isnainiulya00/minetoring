import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Card from '../../components/ui/Card'

export default function MenteeDashboard() {
  return (
    <>
      <PageHeader
        title="Beranda mentee"
        description="Materi pertemuan dan pengumpulan resume Anda dalam satu tempat."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Lanjutkan belajar" className="lg:col-span-2">
          <p className="text-sm text-slate-600">
            Tonton atau unduh materi terbaru.
          </p>
          <Link
            to="/mentee/materi"
            className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Buka materi pertemuan →
          </Link>
        </Card>
        <Card title="Resume">
          <p className="text-sm text-slate-600">Kumpulkan ringkasan pertemuan tepat waktu.</p>
          <Link
            to="/mentee/resume"
            className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Kirim resume →
          </Link>
        </Card>
      </div>
    </>
  )
}
