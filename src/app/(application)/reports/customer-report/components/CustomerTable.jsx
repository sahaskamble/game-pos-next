"use client";

import { useState } from "react";
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
import { format } from "date-fns";
import { PDFExport } from "@/components/Table2PDF";
import { CSVExport } from "@/components/Table2CSV";

export function CustomerTable({ customers, sessions }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  const columns = [
    {
      accessorKey: "customer_name",
      header: "Name",
    },
    {
      accessorKey: "customer_contact",
      header: "Contact",
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
      accessorKey: "isMember",
      header: "Membership",
      cell: ({ row }) => (
        <div className={`font-medium ${row.original.isMember ? 'text-green-600' : 'text-red-600'}`}>
          {row.original.isMember ? 'Member' : 'Non-Member'}
        </div>
      ),
    },
    {
      accessorKey: "total_visits",
      header: "Total Visits",
      cell: ({ row }) => row.original.total_visits || 0,
    },
    {
      accessorKey: "total_rewards",
      header: "Wallet",
      cell: ({ row }) => `${row.original.total_rewards} GG` || 0,
    },
    {
      accessorKey: "created",
      header: "Joined Date",
      cell: ({ row }) => format(new Date(row.original.created), 'MMM dd, yyyy'),
    },
    {
      id: "totalSpent",
      header: "Total Spent",
      cell: ({ row }) => {
        const customerSessions = sessions.filter(s => s.customer_id === row.original.id);
        const totalSpent = customerSessions.reduce((sum, s) => sum + (s.total_amount || 0), 0);
        return `Rs. ${totalSpent.toLocaleString()}`;
      },
    },
    {
      id: "sessionCount",
      header: "Total Sessions",
      cell: ({ row }) => {
        const sessionCount = sessions.filter(s => s.customer_id === row.original.id).length;
        return sessionCount;
      },
    },
  ];

  const table = useReactTable({
    data: customers,
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
        <Input
          placeholder="Filter customers..."
          value={(table.getColumn("customer_name")?.getFilterValue() ?? "")}
          onChange={(event) =>
            table.getColumn("customer_name")?.setFilterValue(event.target.value)
          }
          className="min-w-sm"
        />
        <PDFExport
          data={customers}
          columns={columns}
          fileName="Customers_Report.pdf"
          title="Customers List"
        />
        <CSVExport
          data={customers}
          columns={columns}
          fileName="Customers_Report.csv"
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
