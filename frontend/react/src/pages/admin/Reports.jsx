import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import HalaqohRekapTable from '../../components/rekap/HalaqohRekapTable'
import { useApi } from '../../hooks/useApi'
import { analyticsService } from '../../services/analyticsService'

export default function Reports() {
  const [semester, setSemester] = useState('')
  const { data: rekap, loading, refetch } = useApi(
    () => analyticsService.rekapHalaqah(semester || undefined),
    [semester],
  )

  return (
    <div>
      <PageHeader title="Rekap Mentoring" subtitle="Ringkasan per halaqah — LPPIK" />
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Filter semester:</label>
        <input
          type="text"
          placeholder="Semua semester"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          onBlur={refetch}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <HalaqohRekapTable data={rekap} loading={loading} />
    </div>
  )
}
