'use client';
import { Card, CardContent } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'

export default function StatsCard({ logs = [] }) {
	const [stats, setStats] = useState({
		totalAmount: 0,
		repairs: 0,
		snacks: 0,
		new_hardware: 0,
		miscellaneous: 0,
		salary: 0,
		purchases: 0
	});

	useEffect(() => {
		const fetchData = () => {
			let totalAmount = 0, repairs = 0, snacks = 0, new_hardware = 0, miscellaneous = 0, salary = 0, purchases = 0;
			logs.map((log) => {
				totalAmount += Number(log.withdraw_from_drawer.amount);
				switch (log.category) {
					case 'Repairs / Maintainence':
						repairs += Number(log.withdraw_from_drawer.amount);
						break;
					case 'Snacks & Drinks Expenses':
						snacks += Number(log.withdraw_from_drawer.amount);
						break;
					case 'New Hardware/Equipment':
						new_hardware += Number(log.withdraw_from_drawer.amount);
						break;
					case 'Miscellaneous':
						miscellaneous += Number(log.withdraw_from_drawer.amount);
						break;
					case 'Salary':
						salary += Number(log.withdraw_from_drawer.amount);
						break;
					case 'Purchases':
						purchases += Number(log.withdraw_from_drawer.amount);
						break;
					default:
						break;
				}
			});
			setStats({
				totalAmount,
				repairs,
				snacks,
				new_hardware,
				miscellaneous,
				salary,
				purchases,
			});
		}
		if (logs) {
			fetchData();
		}
	}, [logs]);

	return (
		<div className='w-full flex flex-col lg:flex-row gap-4'>
			<div className='w-full lg:w-1/3 min-h-[30dvh] flex'>
				<Card className='w-full h-full flex-1'>
					<CardContent className="pt-6 h-full flex flex-col justify-center">
						<div className="text-sm lg:text-xl text-foreground/70">Total Amount</div>
						<div className="text-2xl lg:text-4xl font-bold">Rs. {stats.totalAmount.toLocaleString()}</div>
					</CardContent>
				</Card>
			</div>

			{/* Right side - Other cards (2/3 width) */}
			<div className='w-full lg:w-2/3 h-full'>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-full'>
					<Card>
						<CardContent className="pt-6">
							<div className="text-sm text-foreground/70">Repairs / Maintainence</div>
							<div className="text-2xl font-bold">Rs. {stats.repairs.toLocaleString()}</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="text-sm text-foreground/70">Snacks & Drinks</div>
							<div className="text-2xl font-bold">Rs. {stats.snacks.toLocaleString()}</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="text-sm text-foreground/70">New Equipment</div>
							<div className="text-2xl font-bold">Rs. {stats.new_hardware.toLocaleString()}</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="text-sm text-foreground/70">Miscellaneous</div>
							<div className="text-2xl font-bold">Rs. {stats.miscellaneous.toLocaleString()}</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="text-sm text-foreground/70">Salary</div>
							<div className="text-2xl font-bold">Rs. {stats.salary.toLocaleString()}</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="text-sm text-foreground/70">Purchases</div>
							<div className="text-2xl font-bold">Rs. {stats.purchases.toLocaleString()}</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
};
