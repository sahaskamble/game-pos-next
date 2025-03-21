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
import { ChevronDown, Search } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CashLogsTable({
	data,
	columns,
}) {
	const [sorting, setSorting] = React.useState([]);
	const [columnFilters, setColumnFilters] = React.useState([]);
	const [columnVisibility, setColumnVisibility] = React.useState({});
	const [rowSelection, setRowSelection] = React.useState({});

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
		data: data || [],
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

	// Don't render the filter section if there are no filterable columns
	if (filterableColumns.length === 0) {
		return (
			<div className="w-full">
				{/* Rest of the table without filter section */}
				{/* ... */}
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="flex items-center gap-4 py-4">
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
					data={data}
					columns={columns}
					fileName="export.pdf"
					title="Data Export"
				/>
				<CSVExport
					data={data}
					columns={columns}
					fileName="export.csv"
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
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
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
	);
}

