export default function TableComponent({ list = [], columns = [], recordName = "applicant"}) {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((col, i) => (
              <th key={i} className="p-2 font-medium">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center p-4">
                No {recordName}s found.
              </td>
            </tr>
          ) : (
            list.map((row, idx) => (
              <tr key={idx} className="border-t">
                {columns.map((col, i) => (
                  <td key={i} className="p-2">
                    {col.render ? col.render(row) : row[col.accessor]}
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
