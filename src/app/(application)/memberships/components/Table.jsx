"use client";

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PDFExport } from "@/components/Table2PDF";
import { CSVExport } from "@/components/Table2CSV";
import { Edit, Search, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/context/AuthContext";

export function MembershipsTable({ memberships, onEdit, onDelete, displayEditDel = true }) {
  const { user } = useAuth();

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  const columns = [
    {
      id: 'name',
      accessorKey: "name",
      header: "Package Name",
      cell: ({ row }) => (
        <p className="font-semibold">{row.original.name}</p>
      ),
    },
    {
      id: 'selling_price',
      accessorKey: "selling_price",
      header: "Selling Price",
      cell: ({ row }) => (
        <p>Rs. {row.original.selling_price?.toLocaleString()}</p>
      ),
    },
    {
      id: 'amount',
      accessorKey: "amount",
      header: "Amount Credit",
      cell: ({ row }) => (
        <p>Rs. {row.original.amount?.toLocaleString()}</p>
      ),
    },
    {
      id: 'ggPointsCredit',
      accessorKey: "ggPointsCredit",
      header: "Points Credit",
      cell: ({ row }) => (
        <p>{row.original.ggpointsCredit?.toLocaleString()} GG</p>
      ),
    },
    {
      accessorKey: "expand.branch_id.name",
      header: "Branch",
      cell: ({ row }) => (
        <div>
          {row.original.expand?.branch_id?.name || 'Not Assigned'}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const plan = row.original;
        if (user?.role === 'SuperAdmin') {
          return (
            <div className="flex gap-2">
              {
                displayEditDel && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(plan.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )

              }
            </div>
          );
        }
      },
    }
  ];

  // Get filterable columns (exclude action columns and columns with enableHiding: false)
  const filterableColumns = React.useMemo(() => {
    return columns
      .filter(column =>
        column.id !== "actions" &&
        column.enableHiding !== false &&
        typeof column.accessorKey === "string"
      )
      .map(column => ({
        id: column.accessorKey,
        label: column.header?.toString() || column.accessorKey
      }));
  }, [columns]);

  // Initialize selectedColumn with the first filterable column's id
  const [selectedColumn, setSelectedColumn] = React.useState(
    filterableColumns.length > 0 ? filterableColumns[0].id : null
  );

  const table = useReactTable({
    data: memberships,
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
      <div className="flex items-center gap-4 py-4 justify-between">
        {selectedColumn && (
          <>
            <Select
              value={selectedColumn}
              onValueChange={setSelectedColumn}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select column to filter" />
              </SelectTrigger>
              <SelectContent>
                {filterableColumns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Filter by ${filterableColumns.find(col => col.id === selectedColumn)?.label.toLowerCase() || 'column'}...`}
                value={(table.getColumn(selectedColumn)?.getFilterValue() ?? "")}
                onChange={(event) =>
                  table.getColumn(selectedColumn)?.setFilterValue(event.target.value)
                }
                className="pl-8 w-full"
              />
            </div>
          </>
        )}
        <PDFExport
          data={memberships}
          columns={columns}
          fileName="Memberships.pdf"
          title="Memberships List"
        />
        <CSVExport
          data={memberships}
          columns={columns}
          fileName="Memberships.csv"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Columns</Button>
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
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
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
