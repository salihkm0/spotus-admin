import React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

const DataTable = ({
  columns,
  data,
  keyExtractor = (item, index) => item.id || index,
  loading = false,
  emptyMessage = "No data found",
  onSort,
  sortBy,
  sortDirection,
  className
}) => {
  const handleSort = (columnKey) => {
    if (onSort && columnKey) {
      onSort(columnKey)
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-200 last:border-b-0">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <p className="text-gray-500 text-sm">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    column.sortable && "cursor-pointer hover:bg-gray-100",
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={cn(
                            "h-3 w-3",
                            sortBy === column.key && sortDirection === 'asc'
                              ? "text-primary-600"
                              : "text-gray-300"
                          )}
                        />
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 -mt-1",
                            sortBy === column.key && sortDirection === 'desc'
                              ? "text-primary-600"
                              : "text-gray-300"
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={keyExtractor(item, index)} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                      column.cellClassName
                    )}
                  >
                    {column.render ? column.render(item, index) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable