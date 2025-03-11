import React from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function PDFExport({
  data,
  columns,
  fileName = 'export.pdf',
  title = 'Data Export',
  buttonProps,
  className
}) {
  const handleExportPDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF()

    // Prepare table headers and columns to export
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

    // Prepare table rows
    const tableRows = data.map(row =>
      exportColumns.map(column => {
        // If custom cell rendering is provided, use it
        if (column.cell) {
          // Create a mock row object with getValue method
          const mockRow = {
            getValue: (key) => {
              // Handle nested properties or direct access
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

    // Add title to the PDF
    doc.setFontSize(16)
    doc.text(title, 14, 15)

    // Generate the table using autoTable plugin
    autoTable(doc, {
      head: [headers],
      body: tableRows,
      startY: 25,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185], // Blue header
        textColor: 255, // White text
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240] // Light gray alternate rows
      },
    })

    // Save the PDF
    doc.save(fileName)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExportPDF}
      className={`ml-2 ${className || ''}`}
      {...buttonProps}
    >
      <Download className="mr-2 h-4 w-4" /> Export PDF
    </Button>
  )
}
