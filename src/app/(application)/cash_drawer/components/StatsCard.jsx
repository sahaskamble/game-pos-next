'use client';
import { Card, CardContent } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'

export default function StatsCard({ logs = [], selected_branch = '', range = 'today' }) {
	const [stats, setStats] = useState({
		totalAmount: 0,
		opening_balance: 0,
		closing_balance: 0,
		snacks: 0,
		sessions: 0,
		session_count: 0,
		membership: 0,
		membership_count: 0,
		expenses: 0,
		expenses_count: 0,
	});

	useEffect(() => {
		const fetchData = () => {
			if (selected_branch && (range === 'today' || range === 'yesterday')) {
				const log_info = logs?.[0];
				if (log_info) {
					setStats({
						totalAmount: log_info.closing_balance - log_info.opening_balance,
						closing_balance: log_info.closing_balance,
						opening_balance: log_info.opening_balance,
						snacks: log_info.sales.snacks.amount,
						sessions: log_info.sales.sessions.amount,
						session_count: log_info.sales.sessions.count,
						membership: log_info.sales.membership.amount,
						membership_count: log_info.sales.membership.amount,
						expenses: log_info.expenses.amount,
						expenses_count: log_info.expenses.amount,
					});
				}
			} else {
				let totalAmount = 0, snacks = 0, sessions = 0, session_count = 0, membership = 0, membership_count = 0, expenses = 0, expenses_count = 0;
				logs.map((log) => {
					totalAmount += (log.closing_balance - log.opening_balance);
					snacks += log.sales.snacks.amount;
					sessions += log.sales.sessions.amount;
					session_count += log.sales.sessions.count;
					membership += log.sales.membership.amount;
					membership_count += log.sales.membership.count;
					expenses += log.expenses.amount;
					expenses_count += log.expenses.count;
				});

				setStats({
					...stats,
					totalAmount,
					snacks,
					sessions,
					session_count,
					membership,
					membership_count,
					expenses,
					expenses_count,
				});
			}
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
						<div className="text-sm lg:text-xl text-foreground/70">Revenue Generated</div>
						<div className="text-2xl lg:text-4xl font-bold">Rs. {stats.totalAmount.toLocaleString()}</div>
					</CardContent>
				</Card>
			</div>

			{/* Right side - Other cards (2/3 width) */}
			<div className='w-full lg:w-2/3 h-full'>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-full'>
					<Card>
						<CardContent className="pt-6">
							<div className="text-sm text-foreground/70">Opening Balance</div>
							<div className="text-2xl font-bold">Rs. {stats.opening_balance.toLocaleString()}</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="text-sm text-foreground/70">Closing Balance</div>
							<div className="text-2xl font-bold">Rs. {stats.closing_balance.toLocaleString()}</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="text-sm text-foreground/70">Expenses</div>
							<div className="text-2xl font-bold">Rs. {stats.expenses.toLocaleString()}</div>
							<div className="text-xs text-foreground/70">Count: {stats.expenses_count.toLocaleString()}</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="text-sm text-foreground/70">Snacks</div>
							<div className="text-2xl font-bold">Rs. {stats.snacks.toLocaleString()}</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="text-sm text-foreground/70">Sessions</div>
							<div className="text-2xl font-bold">Rs. {stats.sessions.toLocaleString()}</div>
							<div className="text-xs text-foreground/70">Count: {stats.session_count.toLocaleString()}</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="text-sm text-foreground/70">Membership</div>
							<div className="text-2xl font-bold">Rs. {stats.membership.toLocaleString()}</div>
							<div className="text-xs text-foreground/70">Count: {stats.membership_count.toLocaleString()}</div>
						</CardContent>
					</Card>

				</div>
			</div>
		</div>
	)
};
