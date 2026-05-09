const base =
  'block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50'

export default function Select({ className = '', children, ...props }) {
  return (
    <select className={[base, className].join(' ')} {...props}>
      {children}
    </select>
  )
}
