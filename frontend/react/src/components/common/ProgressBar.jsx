import { motion } from 'framer-motion'

export default function ProgressBar({ value = 0, max = 100, label, showPercent = true }) {
  const percent = Math.min(100, Math.round((value / max) * 100))
  return (
    <div>
      {(label || showPercent) && (
        <div className="mb-1.5 flex justify-between text-sm">
          {label && <span className="text-gray-600">{label}</span>}
          {showPercent && <span className="font-medium text-gray-800">{percent}%</span>}
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-slate-500 to-slate-700"
        />
      </div>
    </div>
  )
}
