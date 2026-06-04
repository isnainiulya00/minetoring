import { useMemo } from 'react'
import { HiOutlineAcademicCap, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { gradeService } from '../../services/gradeService'

const ASPECTS = [
  { key: 'aspek_1', label: 'Aspek 1' },
  { key: 'aspek_2', label: 'Aspek 2' },
  { key: 'aspek_3', label: 'Aspek 3' },
  { key: 'aspek_4', label: 'Aspek 4' },
  { key: 'aspek_5', label: 'Aspek 5' },
]

function normalizeList(data) {
  if (Array.isArray(data)) return data
  return data?.results ?? []
}

export default function MenteeGrade() {
  const { data, loading } = useApi(gradeService.getAll, [])
  const grades = useMemo(() => normalizeList(data), [data])
  const grade = grades[0]

  if (loading) return <TableSkeleton rows={5} cols={2} />

  if (!grade) {
    return (
      <>
        <PageHeader
          title="Nilai Ujian Saya"
          subtitle="Hasil penilaian akhir mentoring akan tampil setelah dinilai"
        />
        <EmptyState
          title="Nilai belum tersedia"
          description="Nilai ujian Anda belum diinput oleh mentor atau KMF."
        />
      </>
    )
  }

  const statusIcon = grade.status_lulus ? HiOutlineCheckCircle : HiOutlineXCircle
  const StatusIcon = statusIcon

  return (
    <>
      <PageHeader
        title="Nilai Ujian Saya"
        subtitle="Ringkasan hasil penilaian akhir mentoring"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Nilai</p>
              <p className="mt-2 text-5xl font-bold tracking-tight text-gray-900">{grade.total_nilai}</p>
              <p className="mt-2 text-sm text-gray-500">KKM kelulusan: 70</p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
              <StatusIcon className={`h-8 w-8 ${grade.status_lulus ? 'text-emerald-600' : 'text-red-600'}`} />
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Status</p>
                <Badge variant={grade.status_lulus ? 'success' : 'danger'}>
                  {grade.status_lulus ? 'Lulus' : 'Belum Lulus'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {ASPECTS.map((aspect) => {
              const value = Number(grade[aspect.key] || 0)
              const percent = Math.min(100, (value / 20) * 100)
              return (
                <div key={aspect.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{aspect.label}</span>
                    <span className="text-sm font-bold text-gray-900">{value}/20</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-gray-900 transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <aside className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
            <HiOutlineAcademicCap className="h-6 w-6" />
          </div>

          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-medium text-gray-500">Nama</dt>
              <dd className="mt-1 font-semibold text-gray-900">{grade.mentee_nama || '-'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">NIM</dt>
              <dd className="mt-1 font-semibold text-gray-900">{grade.mentee_nim || '-'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Program Studi</dt>
              <dd className="mt-1 font-semibold text-gray-900">{grade.mentee_prodi || '-'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Halaqah</dt>
              <dd className="mt-1 font-semibold text-gray-900">{grade.halaqah_nama || '-'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Dinilai Oleh</dt>
              <dd className="mt-1 font-semibold text-gray-900">{grade.dinilai_oleh_nama || '-'}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  )
}
