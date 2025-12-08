// components/UI/DataTable.jsx
import React from 'react'
import { cn } from '../../utils/cn'

const DataTable = ({ 
  columns, 
  data = [], 
  loading = false, 
  emptyMessage = "No data found",
  keyExtractor = (item) => item?._id || item?.id || Math.random().toString()
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key || index}
                className={cn(
                  "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                  column.headerClassName
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => {
            // Skip null or undefined items
            if (!item) return null
            
            const key = keyExtractor(item) || index
            
            return (
              <tr key={key}>
                {columns.map((column, colIndex) => (
                  <td
                    key={column.key || colIndex}
                    className={cn(
                      "px-6 py-4 whitespace-nowrap",
                      column.cellClassName
                    )}
                  >
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable