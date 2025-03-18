"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PDFExport } from "@/components/Table2PDF";
import { CSVExport } from "@/components/Table2CSV";

export function ExpenseTable({ expenses }) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});

  const columns = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <div
          className="cursor-pointer select-none flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          {{
            asc: " 🔼",
            desc: " 🔽",
          }[column.getIsSorted()] ?? null}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <div
          className="cursor-pointer select-none flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          {{
            asc: " 🔼",
            desc: " 🔽",
          }[column.getIsSorted()] ?? null}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <div
          className="cursor-pointer select-none flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          {{
            asc: " 🔼",
            desc: " 🔽",
          }[column.getIsSorted()] ?? null}
        </div>
      ),
      cell: ({ row }) => `Rs. ${row.original?.amount?.toLocaleString()}`,
    },
    {
      accessorKey: "created_by",
      header: "Taken By",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];

  const table = useReactTable({
    data: expenses,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Filter expenses..."
          value={(table.getColumn("description")?.getFilterValue() ?? "")}
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
          }
          className="min-w-sm w-full"
        />
        <PDFExport
          data={expenses}
          columns={columns}
          fileName="Expenses_Report.pdf"
          title="Expenses List"
        />
        <CSVExport
          data={expenses}
          columns={columns}
          fileName="Expenses_Report.csv"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null :
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    }
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
