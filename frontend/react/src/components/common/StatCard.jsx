import { motion } from 'framer-motion'
import Card from './Card'

export default function StatCard({ icon: Icon, label, value, trend, delay = 0 }) {
  return (
    <Card hover className="!p-0 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.08 }}
        className="p-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight text-gray-900">{value}</p>
            {trend && <p className="mt-1 text-xs text-gray-500">{trend}</p>}
          </div>
          {Icon && (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </motion.div>
    </Card>
  )
}
