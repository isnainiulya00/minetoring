import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/common/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="font-display text-8xl font-bold text-gray-200">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-gray-900">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-gray-500">URL yang Anda akses tidak tersedia.</p>
        <Link to="/dashboard" className="mt-8 inline-block">
          <Button>Kembali ke Dashboard</Button>
        </Link>
      </motion.div>
    </div>
  )
}
