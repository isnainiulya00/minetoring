import {
  HiOutlineBars3,
  HiOutlineBell,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2'

import { useNavigate } from 'react-router-dom'

import { useAuthStore } from '../../store/authStore'
import { ROLE_LABELS } from '../../utils/constants'
import { getInitials } from '../../utils/formatters'

import Button from '../common/Button'

export default function Navbar({ onMenuClick }) {

  // ===============================
  // STORE
  // ===============================

  const user = useAuthStore((s)=>s.user)
  const logout = useAuthStore((s)=>s.logout)

  const navigate = useNavigate()


  // ===============================
  // DATA
  // ===============================

  const displayName =
      user?.first_name ||
      user?.username ||
      'User'

  const roleLabel =
      ROLE_LABELS[user?.role]
      || user?.role

  const initials =
      getInitials(displayName)


  // ===============================
  // HANDLER
  // ===============================

  const handleLogout = () => {
  // 1. Hapus semua token dan data dari memori browser
  localStorage.removeItem('mine_toring_access');
  localStorage.removeItem('mine_toring_refresh');
  
  // (Opsional) Kalau kamu simpan data user di localStorage juga, hapus juga
  // localStorage.removeItem('user_data');

  // 2. Lempar kembali ke halaman login (pakai replace biar bersih)
  window.location.replace('/login');
}


  return (

    <header
      className="
      sticky top-0 z-30

      flex h-16
      items-center justify-between

      border-b border-gray-200
      bg-white/80

      px-4 md:px-6

      backdrop-blur-md
    "
    >

      {/* ===========================
          MOBILE MENU
      =========================== */}

      <button
        type="button"
        onClick={onMenuClick}
        className="
        rounded-xl
        p-2
        text-gray-600
        hover:bg-gray-100
        lg:hidden
      "
      >
        <HiOutlineBars3
          className="h-6 w-6"
        />
      </button>


      <div className="hidden flex-1 lg:block" />


      {/* ===========================
          RIGHT SECTION
      =========================== */}

      <div
        className="
        flex items-center
        gap-3
      "
      >

        {/* Notification */}

        <button
          type="button"
          className="
          relative

          rounded-xl
          p-2

          text-gray-500
          hover:bg-gray-100
        "
        >

          <HiOutlineBell
            className="h-5 w-5"
          />

          <span
            className="
            absolute
            right-1.5
            top-1.5

            h-2 w-2
            rounded-full
            bg-gray-400
          "
          />

        </button>


        {/* Profile */}

        <div
          className="
          flex items-center
          gap-3

          rounded-2xl
          border border-gray-100

          bg-gray-50/80

          px-3 py-1.5
        "
        >

          <div
            className="
            flex h-9 w-9
            items-center justify-center

            rounded-xl

            bg-gray-900
            text-xs
            font-semibold
            text-white
          "
          >
            {initials}
          </div>


          <div className="hidden sm:block min-w-0">

            <p
              className="
              truncate
              text-sm
              font-medium
              text-gray-900
            "
            >
              {displayName}
            </p>

            <p
              className="
              truncate
              text-xs
              text-gray-500
            "
            >
              {roleLabel}
            </p>

          </div>

        </div>


        {/* Logout */}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
        >

          <HiOutlineArrowRightOnRectangle
            className="h-5 w-5"
          />

        </Button>

      </div>

    </header>
  )
}