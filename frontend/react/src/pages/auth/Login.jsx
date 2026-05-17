import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi2'
import { useAuthStore } from '../../store/authStore'
import { getLoginRedirectPath } from '../../utils/roleHelpers'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const isLoading = useAuthStore((s) => s.isLoading)

  const [form, setForm] = useState({ username: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await login(form.username, form.password)
      toast.success('Selamat datang kembali!')
      const from = location.state?.from?.pathname || getLoginRedirectPath(result?.user)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail || 'Username atau password salah'
      toast.error(msg)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="mb-8 lg:hidden">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 font-display text-sm font-bold text-white">
          MT
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900">MINE-TORING</h1>
        <p className="text-sm text-gray-500">Masuk ke akun mentoring AIK</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-gray-900">Masuk</h2>
        <p className="mt-1 text-sm text-gray-500">Gunakan kredensial akun Anda</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="username"
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
          <Button type="submit" className="w-full" loading={isLoading}>
            <HiOutlineLockClosed className="h-4 w-4" />
            Masuk
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
