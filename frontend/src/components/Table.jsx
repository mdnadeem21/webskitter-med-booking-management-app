function Table({ columns, data }) {
    return (
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full bg-white text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-600">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">{row[col.key]}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }
export default Table;