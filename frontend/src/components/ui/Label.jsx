export default function Label({ children, htmlFor, className = '', required }) {
  return (
    <label
      htmlFor={htmlFor}
      className={['block text-sm font-medium text-slate-700', className].join(' ')}
    >
      {children}
      {required && <span className="text-red-500"> *</span>}
    </label>
  )
}
