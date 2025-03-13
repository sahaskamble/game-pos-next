'use client';

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
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

export function AdvanceBookingsTable({ data = [], loading, onEdit, onDelete }) {
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
      id: "customer_name",
      accessorKey: "expand.customer_id.customer_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => row.original.expand?.customer_id?.customer_name,
    },
    {
      id: "visiting_time",
      accessorKey: "visiting_time",
      header: "Visiting Time",
      cell: ({ row }) => {
        return format(new Date(row.getValue("visiting_time")), "PPpp");
      },
    },
    {
      id: "no_of_players",
      accessorKey: "no_of_players",
      header: "Players",
      cell: ({ row }) => row.original.no_of_players,
    },
    {
      id: "note",
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => row.original.note,
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return (
          <Badge variant={row.getValue("status") === "Closed" ? "secondary" : "default"}>
            {row.getValue("status")}
          </Badge>
        );
      },
    },
    {
      id: "created_by",
      accessorKey: "expand.created_by.username",
      header: "Created By",
      cell: ({ row }) => row.original.expand?.created_by?.username,
    },
    {
      id: "closed_by",
      accessorKey: "expand.closed_by.username",
      header: "Closed By",
      cell: ({ row }) => row.original.expand?.closed_by?.username,
    },
    {
      id: "branch",
      accessorKey: "expand.branch_id.name",
      header: "Branch",
      cell: ({ row }) => row.original.expand?.branch_id?.name,
    },
    {
      id: "created",
      accessorKey: "created",
      header: "Created At",
      cell: ({ row }) => {
        return format(new Date(row.getValue("created")), "PPpp");
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
