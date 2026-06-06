import { useState } from 'react'
// 👇 1. Tambahkan useNavigate di sini
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { HiOutlineLockClosed } from 'react-icons/hi2'
import { useAuthStore } from '../../store/authStore'
import { getLoginRedirectPath } from '../../utils/roleHelpers'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import minetoringLogo from '../../assets/2.jpeg'
import umsColor from '../../assets/ums-dark.png'
import lppikColor from '../../assets/lppik.png'
import kmfColor from '../../assets/kmf.png'

export default function Login() {
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })
  
  const location = useLocation()
  const navigate = useNavigate() // 👇 2. Inisialisasi navigate
  const login = useAuthStore((s) => s.login)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('') 
    setLoading(true)

    try {
      // 1. Eksekusi login via state management
      const result = await login(form.username, form.password)
      
      toast.success('Selamat datang kembali!')
      
      // 2. Tentukan rute tujuan 
      const targetPath = getLoginRedirectPath(result?.user)
      
      // 👇 3. GANTI JADI NAVIGATE REACT ROUTER (Sangat Penting!) 👇
      // replace: true gunanya biar user nggak bisa klik tombol "Back" ke halaman login
      navigate(targetPath, { replace: true })
      
    } catch (error) {
      if (error.response) {
        const status = error.response.status
        
        if (status === 401) {
          setErrorMsg(error.response.data?.detail || 'Username atau password salah.')
        } else if (status === 403) {
          setErrorMsg('Akses ditolak (403). Role Anda tidak diizinkan mengakses data ini.')
        } else if (status === 404) {
          setErrorMsg('Sistem tidak merespon (Endpoint tidak ditemukan).')
        } else if (status === 500) {
          setErrorMsg('Terjadi kesalahan di server internal Django.')
        } else {
          setErrorMsg(error.response.data?.detail || 'Gagal masuk. Silakan coba lagi.')
        }
      } else {
        setErrorMsg('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      {/* Header Mobile */}
      <div className="mb-8 lg:hidden">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 font-display text-sm font-bold text-white">
          MT
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900">MINE-TORING</h1>
        <p className="text-sm text-gray-500">Masuk ke akun mentoring AIK</p>
      </div>
      <div className="mb-8 flex flex-col items-center justify-center gap-3">
        
        <div className="flex items-center justify-center gap-3 rounded-3xl bg-slate-50 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200">
          <img src={umsColor} alt="UMS" className="h-7 w-auto object-contain" />
          <img src={lppikColor} alt="LPPIK" className="h-7 w-auto object-contain" />
          <img src={kmfColor} alt="KMF" className="h-7 w-auto object-contain rounded-full" />
        </div>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-gray-900">Masuk</h2>
        <p className="mt-1 mb-6 text-sm text-gray-500">Gunakan kredensial akun Anda</p>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-800">{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="NIM atau username"
            required
            autoComplete="username"
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" loading={loading}>
            <HiOutlineLockClosed className="h-4 w-4" />
            {loading ? 'Memeriksa...' : 'Masuk'}
          </Button>
        </form>
      </div>
    </motion.div>
  )
}