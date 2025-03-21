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
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export function MembershipLogsTable({ logs = [] }) {

	const [sorting, setSorting] = useState([]);
	const [columnFilters, setColumnFilters] = useState([]);
	const [columnVisibility, setColumnVisibility] = useState({});

	const columns = [
		{
			id: 'taken_date',
			accessorKey: "taken_date",
			header: "Taken On",
			cell: ({ row }) => format(new Date(row.getValue("taken_date")), "dd/MM/yyyy HH:mm"),
		},
		{
			id: 'customer',
			accessorKey: "expand.customer.customer_name",
			header: "Customer",
			cell: ({ row }) => (
				<div>
					{row.original.expand?.customer?.customer_name || 'Not Assigned'}
				</div>
			),
		},
		{
			id: 'plan',
			accessorKey: "expand.plan_id.name",
			header: "Plan",
			cell: ({ row }) => (
				<div>
					{row.original.expand?.plan_id?.name || 'Not Assigned'}
				</div>
			),
		},
		{
			id: 'agent',
			accessorKey: "expand.user_id.username",
			header: "Agent",
			cell: ({ row }) => (
				<div>
					{row.original.expand?.user_id?.username || 'Not Assigned'}
				</div>
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
			id: "payment_mode",
			accessorKey: "payment_mode",
			header: "Payment Mode",
			cell: ({ row }) => (
				<div>
					{row.original.payment_mode}
				</div>
			),
		},
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
		data: logs,
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
					data={logs}
					columns={columns}
					fileName="logs.pdf"
					title="logs List"
				/>
				<CSVExport
					data={logs}
					columns={columns}
					fileName="logs.csv"
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
