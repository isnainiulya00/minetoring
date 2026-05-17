import { Link } from 'react-router-dom'
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineAcademicCap,
  HiOutlineDocumentText,
} from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import { StatCardSkeleton } from '../../components/common/Skeleton'
import ProgressBar from '../../components/common/ProgressBar'
import { useApi } from '../../hooks/useApi'
import { presensiService } from '../../services/presensiService'
import { hafalanService } from '../../services/hafalanService'
import { resumeService } from '../../services/resumeService'
import { useAuthStore } from '../../store/authStore'
import Card, { CardHeader } from '../../components/common/Card'
import Button from '../../components/common/Button'
import { formatPercent } from '../../utils/formatters'

export default function MenteeDashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: presensi, loading: l1 } = useApi(presensiService.getAll, [])
  const { data: hafalan, loading: l2 } = useApi(hafalanService.getAll, [])
  const { data: resumes, loading: l3 } = useApi(resumeService.getAll, [])
  const loading = l1 || l2 || l3

  const hadir = presensi?.filter((p) => p.status === 'HADIR').length ?? 0
  const hafalanLulus = hafalan?.filter((h) => h.is_lulus).length ?? 0
  const progress = formatPercent(hadir, presensi?.length || 1)

  return (
    <div>
      <PageHeader
        title={`Portal Akademik — ${user?.first_name || user?.username}`}
        subtitle="Pantau progress mentoring & aktivitas pribadi"
      />

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-700">Progress Mentoring</p>
        <ProgressBar value={hadir} max={presensi?.length || 1} className="mt-3" />
        <p className="mt-2 text-xs text-gray-500">{progress}% kehadiran dari total pertemuan</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={HiOutlineClipboardDocumentCheck} label="Kehadiran" value={hadir} />
            <StatCard icon={HiOutlineDocumentText} label="Resume" value={resumes?.length ?? 0} />
            <StatCard icon={HiOutlineAcademicCap} label="Hafalan Lulus" value={hafalanLulus} />
          </>
        )}
      </div>

      <Card className="mt-6" glass>
        <CardHeader title="Menu Cepat" subtitle="Akses fitur mentee" />
        <div className="flex flex-wrap gap-2">
          <Link to="/resume">
            <Button>Upload Resume</Button>
          </Link>
          <Link to="/presensi">
            <Button variant="secondary">Riwayat Presensi</Button>
          </Link>
          <Link to="/hafalan">
            <Button variant="secondary">Hafalan Saya</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
