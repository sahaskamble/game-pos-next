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
import { Badge } from "@/components/ui/badge";

export function LoginLogsTable({ logs = [] }) {

	const [sorting, setSorting] = useState([]);
	const [columnFilters, setColumnFilters] = useState([]);
	const [columnVisibility, setColumnVisibility] = useState({});

	const columns = [
		{
			id: 'user_id',
			accessorKey: "expand.user_id.username",
			header: "User",
			cell: ({ row }) => (
				<div>
					{row.original.expand?.user_id?.username || 'Not Assigned'}
				</div>
			),
		},
		{
			id: 'login_time',
			accessorKey: "login_time",
			header: "Login",
			cell: ({ row }) => format(new Date(row.getValue("login_time")), "dd/MM/yyyy HH:mm"),
		},
		{
			id: 'logout_time',
			accessorKey: "logout_time",
			header: "Logout",
			cell: ({ row }) => {
				const logoutTime = row.getValue("logout_time");
				return (
					<div className="flex items-center gap-2">
						{logoutTime ? (
							format(new Date(logoutTime), "dd/MM/yyyy HH:mm")
						) : "Active Session"}
					</div>
				);
			},
		},
		{
			id: 'working_hours',
			accessorKey: "working_hours.formatted",
			header: "Duration",
			cell: ({ row }) => {
				const workingHours = row.original.working_hours;
				return (
					<span>{workingHours.formatted}</span>
				);
			},
		},
		{
			id: 'status',
			accessorKey: "working_hours.formatted",
			header: "Status",
			cell: ({ row }) => {
				const workingHours = row.original.working_hours;
				return (
					<div className="flex items-center gap-2">
						{workingHours.is_active ? 'Working' : 'Logged Off'}
					</div>
				);
			},
		},
		{
			id: 'branch',
			accessorKey: "expand.branch_id.name",
			header: "Branch",
			cell: ({ row }) => (
				<div>
					{row.original.expand?.branch_id?.name || 'Not Assigned'}
				</div>
			),
		},
	];

	// Get filterable columns (exclude action columns and columns with enableHiding: false)
	const filterableColumns = React.useMemo(() => {
		return columns
			.filter(column =>
				column.id !== "actions" &&
				column.enableHiding !== false
			)
			.map(column => ({
				id: column.id, // Use column.id instead of accessorKey
				label: column.header?.toString() || column.id
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
					fileName="login_logs.pdf"
					title="Login Logs"
				/>
				<CSVExport
					data={logs}
					columns={columns}
					fileName="login_logs.csv"
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
