import PageHeader from '../../components/common/PageHeader'
import HalaqohRekapTable from '../../components/rekap/HalaqohRekapTable'
import { useApi } from '../../hooks/useApi'
import { analyticsService } from '../../services/analyticsService'

export default function RekapPresensi() {
  const { data: rekap, loading } = useApi(analyticsService.rekapHalaqah, [])

  return (
    <>
      <PageHeader 
        title="Rekap Presensi Global" 
        subtitle="Monitoring kehadiran seluruh halaqah (KMF/LPPIK)" 
      />
      <div className="mt-6">
        <HalaqohRekapTable data={rekap} loading={loading} showResume={false} showHafalan={false} />
      </div>
    </>
  )
}