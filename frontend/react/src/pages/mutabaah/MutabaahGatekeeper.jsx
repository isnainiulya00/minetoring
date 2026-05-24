import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function MutabaahGatekeeper() {
  const user = useAuthStore((s) => s.user)

  // Asumsi: Di data user kamu ada keterangan tipe halaqahnya
  // Silakan sesuaikan nama variabel 'jenis_halaqah' dengan yang ada di backend-mu
  const tipeHalaqah = user?.jenis_halaqah?.toLowerCase()

  // Logika otomatis melempar Mentee ke ruangannya masing-masing
  if (tipeHalaqah === 'takhasus') return <Navigate to="/mutabaah/takhasus" replace />
  if (tipeHalaqah === 'tahfidz') return <Navigate to="/mutabaah/tahfidz" replace />
  
  // Default (Kalau kosong atau Tahsin)
  return <Navigate to="/mutabaah/tahsin" replace />
}