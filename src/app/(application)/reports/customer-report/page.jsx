'use client';

import React, { useEffect, useState } from 'react'
import { StatsCard } from './components/Stats';
import { ChartComponent } from './components/Charts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Blue600, Green600, Orange600, Purple600 } from "@/constants/colors"
import { Clock, IndianRupee, UserCheck, Users } from "lucide-react"
import { useCollection } from "@/lib/hooks/useCollection";
import { format } from 'date-fns';

function CustomerReports() {
	const { data: customers } = useCollection("customers");
	const { data: sessions } = useCollection("sessions");

	const [Stats, setStats] = useState([
		{ title: 'Total Customers', price: 0, icon: Users, iconClass: 'bg-blue-100 p-1.5 rounded-full', iconColor: Blue600 },
		{ title: 'Active Members', price: 0, icon: UserCheck, iconClass: 'bg-green-100 p-1.5 rounded-full', iconColor: Green600 },
		{ title: 'Total Revenue', price: '₹0', icon: IndianRupee, iconClass: 'bg-purple-100 p-1.5 rounded-full', iconColor: Purple600 },
		{ title: 'Max Session', price: '0 hr', icon: Clock, iconClass: 'bg-orange-100 p-1.5 rounded-full', iconColor: Orange600 },
	]);
	const [monthlyData, setMonthlyData] = useState([]);

	useEffect(() => {
		if (customers && sessions) {
			// Calculate stats
			const totalCustomers = customers.length;
			const activeMembers = customers.filter(c => c.is_active).length;
			
			const totalRevenue = sessions.reduce((acc, session) => acc + (session.total_amount || 0), 0);
			const maxSession = Math.max(...sessions.map(s => s.duration || 0));

			// Update Stats
			setStats(prev => prev.map(stat => {
				if (stat.title === "Total Customers") return { ...stat, price: totalCustomers };
				if (stat.title === "Active Members") return { ...stat, price: activeMembers };
				if (stat.title === "Total Revenue") return { ...stat, price: `₹${totalRevenue}` };
				if (stat.title === "Max Session") return { ...stat, price: `${maxSession} hr${maxSession !== 1 ? 's' : ''}` };
				return stat;
			}));

			// Calculate monthly data
			const monthlyStats = sessions.reduce((acc, session) => {
				if (session.created) {
					const month = format(new Date(session.created), 'MMM');
					if (!acc[month]) acc[month] = 0;
					acc[month] += session.total_amount || 0;
				}
				return acc;
			}, {});

			setMonthlyData(Object.entries(monthlyStats).map(([month, value]) => ({
				month,
				value
			})));
		}
	}, [customers, sessions]);

	if (!customers || !sessions) {
		return <div className="p-6">Loading...</div>;
	}

	return (
		<div className="flex flex-col w-full min-h-screen">
			{/* Stats Cards */}
			<div className="p-6">
				<div className="grid auto-rows-min gap-4 md:grid-cols-4">
					<StatsCard Stats={Stats} />
				</div>
			</div>

			{/* Charts Section */}
			<div className="p-4">
				<ChartComponent
					title="Customer Revenue Growth"
					data={monthlyData}
					period="month"
				/>
			</div>
		</div>
	)
}

export default CustomerReports;
