import { Link } from 'react-router-dom'
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
} from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import { StatCardSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { presensiService } from '../../services/presensiService'
import { hafalanService } from '../../services/hafalanService'
import { halaqahService } from '../../services/halaqahService'
import { useAuthStore } from '../../store/authStore'
import Card, { CardHeader } from '../../components/common/Card'
import Button from '../../components/common/Button'

export default function MentorDashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: presensi, loading: l1 } = useApi(presensiService.getAll, [])
  const { data: hafalan, loading: l2 } = useApi(hafalanService.getAll, [])
  const { data: halaqah, loading: l3 } = useApi(halaqahService.getAll, [])
  const loading = l1 || l2 || l3
  const hadir = presensi?.filter((p) => p.status === 'HADIR').length ?? 0

  return (
    <div>
      <PageHeader
        title={`Dashboard Mentor — ${user?.first_name || user?.username}`}
        subtitle="Kelola presensi & hafalan kelompok Anda"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={HiOutlineUserGroup} label="Halaqah" value={halaqah?.length ?? 0} />
            <StatCard icon={HiOutlineClipboardDocumentCheck} label="Kehadiran Hadir" value={hadir} />
            <StatCard icon={HiOutlineAcademicCap} label="Entri Hafalan" value={hafalan?.length ?? 0} />
          </>
        )}
      </div>

      <Card className="mt-6" glass>
        <CardHeader title="Aksi Cepat" subtitle="Modul operasional mentor" />
        <div className="flex flex-wrap gap-2">
          <Link to="/presensi">
            <Button>Input Presensi</Button>
          </Link>
          <Link to="/hafalan">
            <Button variant="secondary">Kelola Hafalan</Button>
          </Link>
          <Link to="/jadwal">
            <Button variant="secondary">Lihat Jadwal</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
