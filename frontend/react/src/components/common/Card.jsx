import { motion } from 'framer-motion'

export default function Card({ children, className = '', glass = false, hover = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -2, boxShadow: '0 12px 40px -12px rgba(0,0,0,0.12)' } : {}}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl p-5 shadow-sm ${glass ? 'glass-card' : 'bg-white border border-gray-100'} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        {title && <h3 className="font-display text-lg font-semibold text-gray-900">{title}</h3>}
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
