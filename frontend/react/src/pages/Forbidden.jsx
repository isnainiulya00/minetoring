import { Link } from 'react-router-dom'
import Button from '../components/common/Button'

export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] p-6 text-center">
      <p className="font-display text-6xl font-bold text-gray-300">403</p>
      <h1 className="mt-4 font-display text-xl font-semibold text-gray-900">Akses ditolak</h1>
      <p className="mt-2 max-w-md text-gray-500">
        Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button variant="secondary">Kembali</Button>
      </Link>
    </div>
  )
}
