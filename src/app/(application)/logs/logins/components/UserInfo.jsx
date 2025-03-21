'use client';

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { useCollection } from '@/lib/hooks/useCollection';
import { Label } from '@/components/ui/label';
import { Check, Search } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { differenceInMinutes, format } from 'date-fns';
import Image from 'next/image';

export default function UserInfo({ logs = [], setLogs }) {
	const { data: staffs } = useCollection('users', {
		expand: 'branch_id',
		sort: 'username',
	});

	const [selectedStaff, setSelectedStaff] = useState(null);
	const [staffInput, setStaffInput] = useState('');
	const [showStaffSuggestions, setShowStaffSuggestions] = useState(false);
	const [filteredStaffs, setFilteredStaffs] = useState([]);
	const [staffStats, setStaffStats] = useState({
		totalWorkingHours: 0,
		avgWorkingHours: 0,
		mostContributedBranch: '',
		daysLoggedIn: 0
	});

	// Filter staffs based on input
	useEffect(() => {
		if (staffInput && staffs?.length) {
			const filtered = staffs.filter(staff =>
				staff.username.toLowerCase().includes(staffInput.toLowerCase())
			);
			setFilteredStaffs(filtered);
			setShowStaffSuggestions(true);
		} else {
			setFilteredStaffs([]);
			setShowStaffSuggestions(false);
		}
	}, [staffInput, staffs]);

	const calculateWorkingHours = (staffLogs) => {
		let totalMinutes = 0;
		const now = new Date();

		staffLogs.forEach(log => {
			const loginTime = new Date(log.login_time);
			const logoutTime = log.logout_time ? new Date(log.logout_time) : now;
			totalMinutes += differenceInMinutes(logoutTime, loginTime);
		});

		return Math.round(totalMinutes / 60);
	};

	const handleSelect = (staff) => {
		const staffLogs = logs.filter((log) => log.user_id === staff.id);
		setLogs(staffLogs);

		// Calculate total working hours
		const totalHours = calculateWorkingHours(staffLogs);

		// Calculate unique days logged in
		const uniqueDays = new Set(
			staffLogs.map(log => format(new Date(log.login_time), 'yyyy-MM-dd'))
		).size;

		// Calculate average working hours per day
		const avgHours = uniqueDays > 0 ? Math.round(totalHours / uniqueDays) : 0;

		// Calculate most contributed branch
		const branchContributions = staffLogs.reduce((acc, log) => {
			const branchName = log.expand.branch_id?.name || 'Unknown';
			acc[branchName] = (acc[branchName] || 0) + 1;
			return acc;
		}, {});

		const mostContributedBranch = Object.entries(branchContributions)
			.sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown';

		setStaffStats({
			totalWorkingHours: totalHours,
			avgWorkingHours: avgHours,
			mostContributedBranch,
			daysLoggedIn: uniqueDays
		});

		setSelectedStaff(staff);
		setStaffInput(staff.username);
		setShowStaffSuggestions(false);
	};

	const handleInputChange = (e) => {
		const value = e.target.value;
		setStaffInput(value);
		setSelectedStaff(null);
		setStaffStats({
			totalWorkingHours: 0,
			avgWorkingHours: 0,
			mostContributedBranch: '',
			daysLoggedIn: 0
		});

		if (value) {
			setShowStaffSuggestions(true);
		} else {
			setShowStaffSuggestions(false);
		}
	};

	const handleInputFocus = () => {
		if (staffInput) {
			setShowStaffSuggestions(true);
		}
	};

	return (
		<div className='w-full pt-6 flex gap-6 lg:flex-row flex-col items-center justify-between'>
			{/* Left Container */}
			<div className="space-y-2 mb-4 w-1/2">
				<div className='w-full flex items-center justify-center'>
					<Image src={'/user.png'} width={150} height={150} alt='Staff' />
				</div>
				<Label htmlFor="staff_name">Staff Name</Label>
				<div className="relative">
					<Input
						id="staff_name"
						value={staffInput}
						onChange={handleInputChange}
						onFocus={handleInputFocus}
						className="pr-8"
						placeholder='Search staff name...'
						autoComplete="off"
					/>
					<Search className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />

					{showStaffSuggestions && filteredStaffs.length > 0 && (
						<div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto">
							{filteredStaffs.map(staff => (
								<div
									key={staff.id}
									className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
									onClick={() => handleSelect(staff)}
								>
									<div className="flex flex-col">
										<div className="font-medium">{staff.username}</div>
										<div className="text-sm text-gray-500">
											{staff.expand?.branch_id?.name || 'No Branch'}
										</div>
									</div>
									{selectedStaff?.id === staff.id && (
										<Check className="h-4 w-4 text-green-500" />
									)}
								</div>
							))}
						</div>
					)}

					{showStaffSuggestions && filteredStaffs.length === 0 && staffInput && (
						<div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg p-2 text-center text-gray-500">
							No staff found
						</div>
					)}
				</div>
			</div>

			{/* Right Container */}
			<div className="grid grid-cols-2 gap-4 w-full">
				<Card>
					<CardContent className="pt-6">
						<div className="text-sm text-foreground/70">Total Working Hours</div>
						<div className="text-2xl font-bold">{staffStats.totalWorkingHours} hrs.</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-sm text-foreground/70">Avg. Working Hours</div>
						<div className="text-2xl font-bold">{staffStats.avgWorkingHours} hrs.</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-sm text-foreground/70">Most Active Branch</div>
						<div className="text-2xl font-bold">{staffStats.mostContributedBranch}</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-sm text-foreground/70">Days Logged In</div>
						<div className="text-2xl font-bold">{staffStats.daysLoggedIn} days</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
