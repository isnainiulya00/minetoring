import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ROLES, ROLE_LABEL } from '../constants/navigation'
import { useAuth } from '../hooks/useAuth'
import { loginRequest } from '../services/authService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Form from '../components/ui/Form'
import Input from '../components/ui/Input'
import Label from '../components/ui/Label'
import Select from '../components/ui/Select'

export default function LoginPage() { 
  const { user, setSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [demoRole, setDemoRole] = useState(ROLES.MENTEE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user) {
    return <Navigate to={from || `/${user.role}/dashboard`} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginRequest({ email, password })
      const nextUser = data.user ?? {
        id: data.id,
        name: data.name ?? email.split('@')[0],
        email: data.email ?? email,
        role: data.role,
      }
      setSession(nextUser, data.access ?? data.token)
      navigate(from || `/${nextUser.role}/dashboard`, { replace: true })
    } catch {
      const name = email.trim() ? email.split('@')[0] : 'Pengguna'
      setSession(
        {
          id: 'demo',
          name: name.charAt(0).toUpperCase() + name.slice(1),
          email: email.trim() || 'demo@mine-toring.local',
          role: demoRole,
        },
        null
      )
      navigate(`/${demoRole}/dashboard`, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
            MT
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Mine-Toring</h1>
          <p className="mt-2 text-sm text-slate-600">
            Mentoring AIK UMS
          </p>
        </div>

        <Card title="Masuk" description="Gunakan akun kampus Anda.">
          <Form onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nim@ums.ac.id"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">Kata sandi</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="role">Peran</Label>
              <Select
                id="role"
                value={demoRole}
                onChange={(e) => setDemoRole(e.target.value)}
                className="mt-1.5"
              >
                <option value={ROLES.MENTEE}>{ROLE_LABEL[ROLES.MENTEE]}</option>
                <option value={ROLES.MENTOR}>{ROLE_LABEL[ROLES.MENTOR]}</option>
                <option value={ROLES.COORDINATOR}>{ROLE_LABEL[ROLES.COORDINATOR]}</option>
              </Select>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses…' : 'Masuk'}
            </Button>
          </Form>
        </Card>

        {/* <p className="mt-6 text-center text-xs text-slate-500">
          Atur URL API di variabel lingkungan{' '}
          <code className="rounded bg-slate-200/80 px-1 py-0.5">VITE_API_URL</code>.
        </p> */}
      </div>
    </div>
  )
}
