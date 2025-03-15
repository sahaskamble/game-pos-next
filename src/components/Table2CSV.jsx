import React from 'react'
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useAuth } from '@/lib/context/AuthContext'

export function CSVExport({
  data,
  columns,
  fileName = 'export.csv',
  buttonProps,
  className
}) {
  const { user } = useAuth();

  const handleExportCSV = () => {
    // Filter out action columns and excluded columns
    const exportColumns = columns.filter(column =>
      column.id !== 'actions' &&
      column.header !== 'Actions' &&
      !column.exclude
    )

    // Prepare headers
    const headers = exportColumns.map(column => {
      // Handle header that might be a function or string
      if (typeof column.header === 'function') {
        return column.accessorKey || 'Column'
      }
      return column.header
    })

    // Prepare rows
    const rows = data.map(row =>
      exportColumns.map(column => {
        // If custom cell rendering is provided, use it
        if (column.cell) {
          // Create a mock row object with getValue method
          const mockRow = {
            getValue: (key) => {
              return key.split('.').reduce(
                (obj, k) => obj && obj[k],
                row
              )
            },
            original: row
          }

          // Call cell function with mock row
          const cellValue = column.cell({ row: mockRow })

          // Convert React component to string
          if (React.isValidElement(cellValue)) {
            return cellValue.props.children || ''
          }

          return cellValue || ''
        }

        // If accessorKey is provided, use it
        if (column.accessorKey) {
          // Handle nested properties
          const value = column.accessorKey.split('.').reduce(
            (obj, key) => obj && obj[key],
            row
          )
          return value ?? ''
        }

        return ''
      })
    )

    // Combine headers and rows
    const csvContent = [
      headers,
      ...rows
    ]
      .map(row =>
        row
          .map(cell => {
            // Handle cells that might contain commas or quotes
            const cellStr = String(cell).replace(/"/g, '""')
            return `"${cellStr}"`
          })
          .join(',')
      )
      .join('\n')

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (user?.role==='SuperAdmin') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        className={`ml-2 ${className || ''}`}
        {...buttonProps}
      >
        <Download className="mr-2 h-4 w-4" /> Export CSV
      </Button>
    )
  } else {
    return null;
  }  
}