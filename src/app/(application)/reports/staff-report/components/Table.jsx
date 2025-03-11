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

function StaffTable({ data = [] }) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});

  // Get unique branches from all staff members
  const uniqueBranches = React.useMemo(() => {
    const branches = new Set();
    data.forEach(staff => {
      if (staff.expand?.branch_id) {
        staff.expand.branch_id.forEach(branch => {
          branches.add(branch.name);
        });
      }
    });
    return Array.from(branches).sort();
  }, [data]);

  const columns = [
    {
      accessorKey: "username",
      header: ({ column }) => (
        <div
          className="cursor-pointer select-none flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username
          {{
            asc: " 🔼",
            desc: " 🔽",
          }[column.getIsSorted()] ?? null}
        </div>
      ),
      cell: ({ row }) => row.original.username || 'Unknown'
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <div
          className="cursor-pointer select-none flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          {{
            asc: " 🔼",
            desc: " 🔽",
          }[column.getIsSorted()] ?? null}
        </div>
      ),
      cell: ({ row }) => row.original.role || 'Unassigned'
    },
    {
      accessorKey: "daysPresent",
      header: ({ column }) => (
        <div
          className="cursor-pointer select-none flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Days Present
          {{
            asc: " 🔼",
            desc: " 🔽",
          }[column.getIsSorted()] ?? null}
        </div>
      ),
      cell: ({ row }) => row.original.daysPresent || '0'
    },
    {
      accessorKey: "daysAbsent",
      header: ({ column }) => (
        <div
          className="cursor-pointer select-none flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Days Absent
          {{
            asc: " 🔼",
            desc: " 🔽",
          }[column.getIsSorted()] ?? null}
        </div>
      ),
      cell: ({ row }) => row.original.daysAbsent || '0'
    },
    // Create a separate column for each branch
    ...uniqueBranches.map(branchName => ({
      id: `branch_${branchName}`,
      header: branchName,
      accessorFn: (row) => {
        if (!row.expand?.branch_id) return false;
        return row.expand.branch_id.some(branch => branch.name === branchName);
      },
      cell: ({ row }) => {
        const hasAccess = row.getValue(`branch_${branchName}`);
        return hasAccess ? 'Access' : 'Denied';
      },
    })),
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter staff..."
          value={(table.getColumn("username")?.getFilterValue() ?? "")}
          onChange={(event) =>
            table.getColumn("username")?.setFilterValue(event.target.value)
          }
          className="min-w-sm"
        />
        <PDFExport
          data={data}
          columns={columns}
          fileName="Staff_Report.pdf"
          title="Staff List"
        />
        <CSVExport
          data={data}
          columns={columns}
          fileName="Staff_Report.csv"
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
                    {column.id.startsWith('branch_')
                      ? column.id.replace('branch_', '')
                      : column.id}
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

export default StaffTable; 
