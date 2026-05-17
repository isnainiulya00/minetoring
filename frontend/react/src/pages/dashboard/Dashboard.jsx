import { useAuthStore } from '../../store/authStore'
import { ROLES } from '../../utils/constants'
import AdminDashboard from './AdminDashboard'
import KMFDashboard from './KMFDashboard'
import MentorDashboard from './MentorDashboard'
import MenteeDashboard from './MenteeDashboard'

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)

  switch (user?.role) {
    case ROLES.ADMIN:
      return <AdminDashboard />
    case ROLES.KMF:
      return <KMFDashboard />
    case ROLES.MENTOR:
      return <MentorDashboard />
    case ROLES.MENTEE:
    default:
      return <MenteeDashboard />
  }
}
