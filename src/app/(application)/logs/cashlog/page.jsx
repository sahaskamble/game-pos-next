'use client';

import { useState, useEffect } from 'react'
import { useCollection } from "@/lib/hooks/useCollection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataFilter from "@/components/superAdmin/DataFilter";
import { format_Date } from "@/lib/utils/formatDates";
import { startOfMonth, startOfWeek, startOfYear } from "date-fns";
import StatsCard from './components/StatsCard';
import { columns } from './components/columns';
import { CashLogsTable } from './components/LogsTable';

const DATE_RANGE_OPTIONS = [
	{ label: "Today", value: "today" },
	{ label: "Yesterday", value: "yesterday" },
	{ label: "This Week", value: "this_week" },
	{ label: "This Month", value: "this_month" },
	{ label: "This Year", value: "this_year" },
	{ label: "Custom", value: "custom" },
];

export default function SnacksLogsPage() {
	const { data: logs } = useCollection("cashlog", {
		expand: "drawer_id,user_id,branch_id",
		sort: "-created",
	});

	const [dateRangeType, setDateRangeType] = useState(null);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [selectedBranch, setSelectedBranch] = useState('');
	const [filteredLogs, setFilteredLogs] = useState([]);

	useEffect(() => {
		const today = new Date();
		setDateRangeType("today");
		setStartDate(format_Date(today));
		setEndDate(format_Date(today));
	}, []);

	// Update date range based on selected option
	const updateDateRange = (option) => {
		const today = new Date();
		let start = new Date();
		let end = new Date();
		end.setHours(23, 59, 59, 999);

		switch (option) {
			case "today":
				start.setHours(0, 0, 0, 0);
				break;
			case "yesterday":
				start.setDate(today.getDate() - 1);
				end.setDate(today.getDate() - 1);
				start.setHours(0, 0, 0, 0);
				end.setHours(23, 59, 59, 999);
				break;
			case "this_week":
				start = startOfWeek(today, { weekStartsOn: 1 });
				break;
			case "this_month":
				start = startOfMonth(today);
				break;
			case "this_year":
				start = startOfYear(today);
				break;
			case "custom":
				return;
		}

		setStartDate(format_Date(start));
		setEndDate(format_Date(end));
	};

	const handleDateRangeTypeChange = (value) => {
		setDateRangeType(value);
		updateDateRange(value);
	};

	// Filter logs and calculate working hours
	useEffect(() => {
		if (logs) {
			let filtered = logs.filter(log => {
				const logDate = new Date(log.created);
				const start = new Date(startDate);
				const end = new Date(endDate);
				start.setHours(0, 0, 0);
				end.setHours(23, 59, 59);
				return logDate >= start && logDate <= end;
			});

			filtered = filtered.filter((log) => log.category !== 'Drawer');

			// Apply branch filter if selected
			if (selectedBranch) {
				filtered = filtered.filter(session => session.branch_id === selectedBranch);
			}

			setFilteredLogs(filtered);
		}
	}, [logs, startDate, endDate, selectedBranch]);

	return (
		<section className='p-10 w-full'>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-3xl font-bold tracking-tight">Cashlog</h2>
				<div className="flex items-center gap-4">
					<DataFilter
						onBranchChange={setSelectedBranch}
					/>
					{
						dateRangeType && (
							<Select value={dateRangeType} onValueChange={handleDateRangeTypeChange}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Select date range" />
								</SelectTrigger>
								<SelectContent>
									{DATE_RANGE_OPTIONS?.map((option) => (
										<SelectItem key={option?.value} value={option?.value}>
											{option?.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)
					}
				</div>
			</div>
			<div className="space-y-6">
				<StatsCard logs={filteredLogs} />
				<CashLogsTable
					columns={columns}
					data={filteredLogs}
				/>
			</div>
		</section>
	)
};
