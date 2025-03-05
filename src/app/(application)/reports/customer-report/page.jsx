'use client';

import React, { useEffect, useState } from 'react'
import { StatsCard } from './components/Stats';
import { ChartComponent } from './components/Charts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Blue600, Green600, Orange600, Purple600 } from "@/constants/colors"
import { Clock, IndianRupee, UserCheck, Users } from "lucide-react"
import { useCollection } from "@/lib/hooks/useCollection";
import { format } from 'date-fns';
import { CustomerTable } from './components/CustomerTable';

function CustomerReports() {
	const { data: customers } = useCollection("customers",{ expand: 'branch_id,user_id' });
	const { data: sessions } = useCollection("sessions",{ 
		expand: 'customer_id,branch_id,device_id,game_id,session_snacks.snack_id',
		sort: '-created'
	});

	const [Stats, setStats] = useState([
		{ title: 'Total Customers', price: 0, icon: Users, iconClass: 'bg-blue-100 p-1.5 rounded-full', iconColor: Blue600 },
		{ title: 'Active Members', price: 0, icon: UserCheck, iconClass: 'bg-green-100 p-1.5 rounded-full', iconColor: Green600 },
		{ title: 'Total Revenue', price: '₹0', icon: IndianRupee, iconClass: 'bg-purple-100 p-1.5 rounded-full', iconColor: Purple600 },
		{ title: 'Max Session', price: '0 hr', icon: Clock, iconClass: 'bg-orange-100 p-1.5 rounded-full', iconColor: Orange600 },
	]);
	const [monthlyData, setMonthlyData] = useState([]);
	const [customerActivityData, setCustomerActivityData] = useState([]);

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
				if (stat.title === "Total Revenue") return { ...stat, price: `₹${totalRevenue.toLocaleString()}` };
				if (stat.title === "Max Session") return { ...stat, price: `${maxSession} hr${maxSession !== 1 ? 's' : ''}` };
				return stat;
			}));

			// Initialize all months with zero values
			const allMonths = [
				'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
				'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
			];
			
			const initialMonthlyData = allMonths.reduce((acc, month) => {
				acc[month] = { revenue: 0, sessions: 0 };
				return acc;
			}, {});

			// Calculate monthly revenue data
			const monthlyStats = sessions.reduce((acc, session) => {
				if (session.created) {
					const month = format(new Date(session.created), 'MMM');
					acc[month].revenue += session.total_amount || 0;
					acc[month].sessions += 1;
				}
				return acc;
			}, initialMonthlyData);

			// Convert to array format for charts
			setMonthlyData(Object.entries(monthlyStats).map(([month, data]) => ({
				month,
				revenue: data.revenue,
				sessions: data.sessions
			})));

			// Calculate customer activity data
			const customerActivity = customers.reduce((acc, customer) => {
				const customerSessions = sessions.filter(s => s.customer_id === customer.id);
				const totalSpent = customerSessions.reduce((sum, s) => sum + (s.total_amount || 0), 0);
				const sessionCount = customerSessions.length;

				if (sessionCount > 0) {
					acc.push({
						name: customer.name || 'Unknown',
						sessions: sessionCount,
						spent: totalSpent,
						lastVisit: customerSessions[0]?.created || null
					});
				}
				return acc;
			}, []);

			setCustomerActivityData(customerActivity
				.sort((a, b) => b.spent - a.spent)
				.slice(0, 5)
			);
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
			<div className="grid grid-cols-2 gap-4 p-4">
				<ChartComponent
					title="Monthly Revenue"
					data={monthlyData}
					period="month"
					dataKey="revenue"
					prefix="₹"
					showDetails={true}
				/>

				<ChartComponent
					title="Monthly Sessions"
					data={monthlyData}
					period="month"
					dataKey="sessions"
					gradientColor="#22c55e"
					showDetails={true}
				/>
			</div>

			{/* Top Customers Chart */}
			{/* <div className="p-4">
				<Card>
					<CardHeader>
						<CardTitle>Top 5 Customers by Spending</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-[300px]">
							<ChartComponent
								title=""
								data={customerActivityData}
								type="bar"
								xAxisDataKey="name"
								dataKey="spent"
								prefix="₹"
								gradientColor="#8b5cf6"
								showDetails={true}
							/>
						</div>
					</CardContent>
				</Card>
			</div> */}

			{/* Customers Table */}
			<div className="p-4">
				<CustomerTable 
					customers={customers} 
					sessions={sessions} 
				/>
			</div>
		</div>
	)
}

export default CustomerReports;
