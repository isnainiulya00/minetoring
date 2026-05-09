export default function Card({
  children,
  className = '',
  title,
  description,
  action,
  padding = true,
  ...props
}) {
  return (
    <section
      className={[
        'rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-sm',
        padding ? 'p-4 sm:p-5' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {(title || description || action) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title && (
              <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
