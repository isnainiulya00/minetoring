import { NavLink } from 'react-router-dom'
import { NAV_BY_ROLE, ROLE_LABEL } from '../../constants/navigation'
import { useAuth } from '../../hooks/useAuth'

function NavItem({ to, label, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-50 text-brand-800 ring-1 ring-brand-100'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth()
  const items = user ? NAV_BY_ROLE[user.role] || [] : []

  const panel = (
    <>
      <div className="flex h-14 items-center gap-2 border-b border-slate-100 px-4 lg:h-16 lg:px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
          MT
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">Mine-Toring</p>
          <p className="truncate text-xs text-slate-500">
            {user ? ROLE_LABEL[user.role] : ''}
          </p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 lg:p-4">
        {items.map((item) => (
          <NavItem key={item.to} {...item} onNavigate={onClose} />
        ))}
      </nav>
      <div className="border-t border-slate-100 p-3 lg:p-4">
        <button
          type="button"
          onClick={() => {
            onClose?.()
            logout()
          }}
          className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Keluar
        </button>
      </div>
    </>
  )

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex lg:sticky lg:top-0 lg:h-dvh">
        {panel}
      </aside>

      <div
        className={[
          'fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden',
          mobileOpen ? 'block' : 'hidden',
        ].join(' ')}
        aria-hidden={!mobileOpen}
        onClick={onClose}
      />
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-[min(100%,18rem)] flex-col bg-white shadow-xl transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {panel}
      </aside>
    </>
  )
}
