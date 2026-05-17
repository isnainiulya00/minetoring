export default function Table({ columns, data, renderRow, emptyMessage = 'Tidak ada data' }) {
  if (!data?.length) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">{emptyMessage}</p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-semibold text-gray-600">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, i) => (
            <tr key={row.id ?? i} className="transition hover:bg-gray-50/50">
              {renderRow(row)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-white"
      >
        Sebelumnya
      </button>
      <span className="text-sm text-gray-600">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-white"
      >
        Selanjutnya
      </button>
    </div>
  )
}
