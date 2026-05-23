import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

import {
  HiOutlineSquares2X2,
  HiOutlineUserGroup,
  HiOutlineClipboardDocumentCheck,
  HiOutlineBookOpen,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlineCog6Tooth,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChartBar,
  HiOutlineEye,
  HiOutlineDocumentChartBar,
  HiOutlineCalendarDays,
  HiOutlineIdentification,
} from 'react-icons/hi2'

import { getNavItems } from '../../utils/roleHelpers'
import { useAuthStore } from '../../store/authStore'


// ===============================
// ICON MAPPING
// ===============================

const iconMap = {
  dashboard: HiOutlineSquares2X2,
  monitoring: HiOutlineEye,
  analytics: HiOutlineChartBar,
  reports: HiOutlineDocumentChartBar,

  halaqah: HiOutlineUserGroup,
  presensi: HiOutlineClipboardDocumentCheck,
  materi: HiOutlineBookOpen,
  resume: HiOutlineDocumentText,
  mutabaah: HiOutlineAcademicCap,

  users: HiOutlineUsers,
  mentor: HiOutlineIdentification,
  mentee: HiOutlineUsers,

  jadwal: HiOutlineCalendarDays,
  sertifikat: HiOutlineDocumentText,

  profile: HiOutlineUserCircle,
  settings: HiOutlineCog6Tooth,
}


export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) {

  // ===============================
  // STORE
  // ===============================

  const user = useAuthStore((s) => s.user)

  const navItems = getNavItems(user)


  // ===============================
  // SIDEBAR CONTENT
  // ===============================

  const content = (

    <aside
      className={`
        flex h-full flex-col
        border-r border-gray-200
        bg-white
        transition-all duration-300

        ${collapsed ? 'w-[72px]' : 'w-64'}
      `}
    >

      {/* ==========================
          LOGO
      =========================== */}

      <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-4">

        <div className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-xl
          bg-gray-900
          text-xs font-bold text-white
        ">
          MT
        </div>

        {!collapsed && (
          <div className="min-w-0">

            <p className="
              truncate
              font-display
              text-sm
              font-bold
            ">
              MINE-TORING
            </p>

            <p className="
              truncate
              text-[10px]
              text-gray-500
            ">
              Mentoring AIK
            </p>

          </div>
        )}

      </div>


      {/* ==========================
          NAVIGATION
      =========================== */}

      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">

        {navItems.map((item) => {

          const Icon =
            iconMap[item.icon]
            || HiOutlineSquares2X2

          return (

            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `
                flex items-center gap-3
                rounded-2xl
                px-3 py-2.5
                text-sm font-medium
                transition

                ${
                  isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                }
                `
              }
            >

              <Icon
                className="
                  h-5 w-5 shrink-0
                "
              />

              {!collapsed && (
                <span className="truncate">
                  {item.label}
                </span>
              )}

            </NavLink>

          )
        })}

      </nav>


      {/* ==========================
          COLLAPSE BUTTON
      =========================== */}

      <button
        type="button"
        onClick={onToggle}
        className="
          hidden lg:flex
          items-center justify-center gap-2

          m-3 py-2

          rounded-2xl
          border border-gray-200

          text-sm text-gray-600

          hover:bg-gray-50
        "
      >

        {collapsed
          ? <HiOutlineChevronRight/>
          : <HiOutlineChevronLeft/>
        }

        {!collapsed && (
          <span>Ciutkan</span>
        )}

      </button>

    </aside>

  )


  // ===============================
  // RENDER
  // ===============================

  return (
    <>
      {/* Desktop */}

      <div className="hidden lg:block h-screen sticky top-0">

        {content}

      </div>


      {/* Mobile */}

      {mobileOpen && (

        <div className="fixed inset-0 z-40 lg:hidden">

          <motion.div
            initial={{opacity:0}}
            animate={{opacity:1}}
            exit={{opacity:0}}
            className="
              absolute inset-0
              bg-gray-900/40
            "
            onClick={onMobileClose}
          />

          <motion.div
            initial={{x:-280}}
            animate={{x:0}}
            exit={{x:-280}}
            className="
              absolute left-0 top-0
              h-full w-64
              shadow-xl
            "
          >

            {content}

          </motion.div>

        </div>
      )}

    </>
  )
}