import PageHeader from '../../components/layout/PageHeader'
import Card from '../../components/ui/Card'

const tiles = [
  { label: 'Halaqoh', value: '56' },
  { label: 'Mentor', value: '56' },
  { label: 'Mentee', value: '500' },
]

export default function CoordinatorDashboard() {
  return (
    <>
      <PageHeader
        title="Halo, Koordinator Mentoring!"
        // description="Kelola halaqoh, pengguna, materi, dan pantau presensi dari satu panel."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} padding className="!p-5">
            <p className="text-sm text-slate-500">{t.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{t.value}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6" title="Aktivitas">
        <p className="text-sm text-slate-600">
          diisi materi dll
        </p>
      </Card>
    </>
  )
}
