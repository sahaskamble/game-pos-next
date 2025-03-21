'use client';

import { Card, CardContent } from '@/components/ui/card';
import React, { useEffect, useState } from 'react'

export default function StatsCard({ logs = [] }) {
	const [stats, setStats] = useState({
		totalAmount: 0,
		membershipSold: 0,
		mostPopularAgent: '',
		mostPopularPlan: '',
	});

	useEffect(() => {
		const fetchData = () => {
			const totalAmount = logs.reduce((acc, log) => acc + log.expand.plan_id.selling_price, 0);

			{/* Most Popular Plan */ }
			const planContributions = logs.reduce((acc, log) => {
				const planName = log.expand.plan_id?.name || 'Unknown';
				acc[planName] = (acc[planName] || 0) + 1;
				return acc;
			}, {});
			const mostContributedPlan = Object.entries(planContributions)
				.sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown';

			{/* Most Popular Plan */ }
			const agentContributions = logs.reduce((acc, log) => {
				const agentName = log.expand.user_id?.username || 'Unknown';
				acc[agentName] = (acc[agentName] || 0) + 1;
				return acc;
			}, {});
			const mostContributedAgent = Object.entries(agentContributions)
				.sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown';

			setStats({
				totalAmount,
				membershipSold: logs.length,
				mostPopularPlan: mostContributedPlan,
				mostPopularAgent: mostContributedAgent
			})
		}
		if (logs) {
			fetchData();
		}
	}, [logs]);


	return (
		<div className='w-full grid grid-cols-4 gap-4'>
			<Card>
				<CardContent className="pt-6 h-full flex flex-col justify-center">
					<div className="text-sm text-foreground/70">Revenue Generated</div>
					<div className="text-2xl font-bold">Rs. {stats.totalAmount.toLocaleString()}</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-6 h-full flex flex-col justify-center">
					<div className="text-sm  text-foreground/70">Membership Sold</div>
					<div className="text-2xl font-bold">{stats.membershipSold.toLocaleString()}</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-6 h-full flex flex-col justify-center">
					<div className="text-sm text-foreground/70">Most Popular Agent</div>
					<div className="text-xl font-bold">{stats.mostPopularAgent}</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-6 h-full flex flex-col justify-center">
					<div className="text-sm text-foreground/70">Most Popular Plan</div>
					<div className="text-xl font-bold">{stats.mostPopularPlan}</div>
				</CardContent>
			</Card>
		</div>
	)
};
