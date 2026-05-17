import { HiOutlineBars3, HiOutlineBell, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2'
import { useAuthStore } from '../../store/authStore'
import { ROLE_LABELS } from '../../utils/constants'
import { getInitials } from '../../utils/formatters'
import Button from '../common/Button'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuthStore()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
      >
        <HiOutlineBars3 className="h-6 w-6" />
      </button>

      <div className="hidden flex-1 lg:block" />

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Notifikasi"
        >
          <HiOutlineBell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gray-400" />
        </button>

        <div className="hidden items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 px-3 py-1.5 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-800 text-xs font-semibold text-white">
            {getInitials(user?.first_name || user?.username)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {user?.first_name || user?.username}
            </p>
            <p className="truncate text-xs text-gray-500">
              {ROLE_LABELS[user?.role] || user?.role}
            </p>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={logout} title="Keluar">
          <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
