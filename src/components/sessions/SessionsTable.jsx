'use client';

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Edit, FileText, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import InvoiceDownload from "./InvoiceDownload";
import { CSVExport } from "../Table2CSV";
import { PDFExport } from "../Table2PDF";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/context/AuthContext";

export function SessionsTable({ data = [], loading, onEdit, onDelete, displayEditDel = true }) {
  const { user } = useAuth();
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState("customer");

  const filterableColumns = [
    { id: "customer", label: "Customer" },
    { id: "branch", label: "Branch" },
    { id: "status", label: "Status" },
    { id: "created_by", label: "Created By" },
    { id: "closed_by", label: "Closed By" },
  ];

  const columns = [
    {
      id: "customer",  // Simple ID for the column
      accessorKey: "expand.customer_id.customer_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Customer
          </Button>
        );
      },
      cell: ({ row }) => row.original.expand?.customer_id?.customer_name,
    },
    {
      accessorKey: "session_in",
      header: "Session In",
      cell: ({ row }) =>
        row.original.session_in ? format(new Date(row.original.session_in), 'PPp') : '-',
    },
    {
      accessorKey: "session_out",
      header: "Session Out",
      cell: ({ row }) =>
        row.original.session_out ? format(new Date(row.original.session_out), 'PPp') : '-',
    },
    {
      id: "device",
      accessorKey: "expand.device_id.name",
      header: "Device",
      cell: ({ row }) => row.original.expand?.device_id?.name,
    },
    {
      id: "game",
      accessorKey: "expand.game_id.name",
      header: "Game",
      cell: ({ row }) => row.original.expand?.game_id?.name,
    },
    {
      id: "branch",
      accessorKey: "expand.branch_id.name",
      header: "Branch",
      cell: ({ row }) => row.original.expand?.branch_id?.name,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => row.original.status,
    },
    {
      accessorKey: "total_amount",
      header: "Amount",
      cell: ({ row }) => `Rs. ${row.original.total_amount || 0}`,
    },
    {
      id: 'created_by',
      accessorKey: "expand.user_id.username",
      header: "Created By",
      cell: ({ row }) => row.original.expand?.user_id?.username,
    },
    {
      id: 'closed_by',
      accessorKey: "expand.billed_by.username",
      header: "Closed By",
      cell: ({ row }) => row.original.expand?.billed_by?.username,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const session = row.original;
        return (
          <>
            {user?.role === 'SuperAdmin' ? (
              <>
                {
                  displayEditDel && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(session)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(session.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => setSelectedSession(session)}
                      >
                        <FileText className="h-4 w-4" color="#fff" />
                      </Button>
                    </div>
                  )
                }
              </>
            ) : null}
          </>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleFilterChange = (value) => {
    const column = table.getColumn(selectedColumn);
    if (column) {
      column.setFilterValue(value);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col gap-4 py-4">
          {!displayEditDel && (
            <h1 className="text-2xl font-bold">Recent Sessions</h1>
          )}
          <div className="flex items-center gap-4">
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

            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Filter by ${filterableColumns.find(col => col.id === selectedColumn)?.label.toLowerCase()}...`}
                  value={(table.getColumn(selectedColumn)?.getFilterValue() ?? "")}
                  onChange={(event) => handleFilterChange(event.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <PDFExport
              data={data}
              columns={columns}
              fileName="Sessions.pdf"
              title="Session History"
            />
            <CSVExport
              data={data}
              columns={columns}
              fileName="Sessions.csv"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
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
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
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
          <div className="space-x-2">
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
      </div>

      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Download Invoice</DialogTitle>
          </DialogHeader>
          {selectedSession && <InvoiceDownload session={selectedSession} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
