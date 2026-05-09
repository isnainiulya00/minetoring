import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const materi = [
  {
    id: 1,
    title: 'Pertemuan 5 — Berorganisasi yang baik sesuai ajaran islam',
    updated: '2 hari lalu',
    type: 'PDF + tautan',
  },
  {
    id: 2,
    title: 'Pertemuan 4 — Pakaian muslim yang baik',
    updated: '1 minggu lalu',
    type: 'Slide',
  },
]

export default function MentorMaterials() {
  return (
    <>
      <PageHeader
        title="Materi pertemuan"
        // description="Akses materi yang diunggah koordinator untuk setiap pertemuan."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {materi.map((m) => (
          <Card key={m.id} padding className="!p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
              {m.type}
            </p>
            <h3 className="mt-2 text-base font-semibold text-slate-900">{m.title}</h3>
            <p className="mt-1 text-sm text-slate-500">Diperbarui {m.updated}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" size="sm">
                Buka materi
              </Button>
              <Button type="button" variant="secondary" size="sm">
                Unduh
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
