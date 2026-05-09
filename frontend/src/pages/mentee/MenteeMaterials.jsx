import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const items = [
  { id: 1, title: 'Pertemuan 5 — Berorganisasi yang baik sesuai ajaran islam', meta: 'PDF · 2.4 MB' },
  { id: 2, title: 'Pertemuan 4 — Pakaian muslim yang baik', meta: 'Slide · Tautan' },
]

export default function MenteeMaterials() {
  return (
    <>
      <PageHeader
        title="Materi pertemuan"
        // description="Semua file dan tautan yang dibagikan untuk halaqoh Anda."
      />
      <div className="space-y-3">
        {items.map((m) => (
          <Card key={m.id} padding className="!p-4 sm:!p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">{m.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{m.meta}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button type="button" size="sm" variant="secondary">
                  Pratinjau
                </Button>
                <Button type="button" size="sm">
                  Unduh
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
