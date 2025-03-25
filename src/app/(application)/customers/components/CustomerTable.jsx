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
import { format } from "date-fns";
import { PDFExport } from "@/components/Table2PDF";
import { CSVExport } from "@/components/Table2CSV";
import { ExternalLink, Route, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";

export function CustomerTable({ customers, sessions, displayMembership, customerInfo }) {
  const { user } = useAuth();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  const columns = [
    {
      accessorKey: "created",
      header: "Joined Date",
      cell: ({ row }) => format(new Date(row.original.created), 'MMM dd, yyyy'),
    },
    {
      accessorKey: "customer_name",
      header: "Name",
      cell: ({ row }) => row.original.customer_name,
    },
    {
      accessorKey: "customer_contact",
      header: "Contact",
      cell: ({ row }) => <p>+91 {row.original.customer_contact}</p>,
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
      id: "sessionCount",
      header: "Total Visits",
      cell: ({ row }) => {
        const sessionCount = sessions.filter(s => s.customer_id === row.original.id).length;
        return sessionCount;
      },
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
      accessorKey: "wallet",
      header: "Wallet",
      cell: ({ row }) => `Rs. ${row.original.wallet || 0}`,
    },
    {
      accessorKey: "total_rewards",
      header: "GG Points",
      cell: ({ row }) => `${row.original.total_rewards || 0} GG`,
    },
    {
      id: "totalSpent",
      header: "Amount Spent",
      cell: ({ row }) => {
        const customerSessions = sessions.filter(s => s.customer_id === row.original.id);
        const totalSpent = customerSessions.reduce((sum, s) => sum + (s.amount_paid || 0), 0);
        return `Rs. ${totalSpent.toLocaleString()}`;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const customer__info = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => {
              displayMembership(true);
              customerInfo(customer__info)
            }}>
              <Route className="h-6 w-6" />
            </Button>
            {
              user?.role === 'SuperAdmin' ? (
                <Link href={`/customers/${customer__info.id}`}>
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-6 w-6" />
                  </Button>
                </Link>
              ) : null
            }
          </div>
        );
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
