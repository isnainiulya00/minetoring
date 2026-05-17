import { motion } from 'framer-motion'
import { HiOutlineInbox } from 'react-icons/hi2'

export default function EmptyState({ title = 'Belum ada data', description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/60 px-6 py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <HiOutlineInbox className="h-8 w-8" />
      </div>
      <h3 className="font-display text-lg font-semibold text-gray-800">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
