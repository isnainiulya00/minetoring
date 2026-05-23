import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'

export default function DashboardLayout() {
  const location = useLocation()

  // ===============================
  // SIDEBAR STATE
  // ===============================
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // ===============================
  // HANDLERS
  // ===============================
  const toggleSidebar = () => {
    setCollapsed(prev => !prev)
  }

  const openMobileSidebar = () => {
    setMobileOpen(true)
  }

  const closeMobileSidebar = () => {
    setMobileOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">

      {/* ===========================
          SIDEBAR
      ============================ */}

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={toggleSidebar}
        onMobileClose={closeMobileSidebar}
      />

      {/* ===========================
          MAIN AREA
      ============================ */}

      <div className="flex flex-1 min-w-0 flex-col">

        {/* ===========================
            NAVBAR
        ============================ */}

        <Navbar
          onMenuClick={openMobileSidebar}
        />

        {/* ===========================
            PAGE CONTENT
        ============================ */}

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">

          <AnimatePresence mode="wait">

            <motion.div
              key={location.pathname}
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -10
              }}
              transition={{
                duration: 0.25
              }}
            >

              <Outlet />

            </motion.div>

          </AnimatePresence>

        </main>
      </div>
    </div>
  )
}