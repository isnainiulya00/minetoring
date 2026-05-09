export default function Table({
  columns,
  data,
  keyExtractor,
  emptyText = 'Tidak ada data.',
  className = '',
}) {
  return (
    <div className={['overflow-x-auto rounded-xl ring-1 ring-slate-200', className].join(' ')}>
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50/80">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="whitespace-nowrap px-4 py-3 font-medium text-slate-600 first:pl-4 last:pr-4 sm:first:pl-5 sm:last:pr-5"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-slate-500 sm:px-5"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={keyExtractor(row, rowIndex)} className="hover:bg-slate-50/60">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="whitespace-nowrap px-4 py-3 text-slate-800 first:pl-4 last:pr-4 sm:first:pl-5 sm:last:pr-5"
                  >
                    {col.render ? col.render(row, rowIndex) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
