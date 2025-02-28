"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Users, Calendar, CreditCard } from "lucide-react";
import { getRecords } from "@/lib/PbUtilityFunctions";

export default function Dashboard() {
	const { user, logout, isValid } = useAuth();
	const [stats, setStats] = useState({ users: 0, sales: 0, bookings: 0, shifts: 0 });
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!isValid) {
			toast.info("User is not Authenticated");
			return redirect("/login");
		}

		async function fetchStats() {
			try {
				const usersRes = await getRecords("users");
				const salesRes = await getRecords("sessions");
				const bookingsRes = await getRecords("sessions");
				const shiftsRes = await getRecords("staff_logins");

				setStats({
					users: usersRes.success ? usersRes.data.length : 0,
					sales: salesRes.success ? salesRes.data.reduce((acc, sale) => acc + sale.amount_paid, 0) : 0,
					bookings: bookingsRes.success ? bookingsRes.data.length : 0,
					shifts: shiftsRes.success ? shiftsRes.data.length : 0,
				});

			} catch (error) {
				console.error("Error fetching dashboard stats:", error);
				toast.error("Failed to load stats");
			} finally {
				setLoading(false);
			}
		}

		fetchStats();
	}, [isValid]);

	if (!isValid) return null;

	return (
		<div className="container mx-auto py-10">
			<h1 className="text-3xl font-bold">Dashboard</h1>
			<p className="text-muted-foreground">Welcome, {user.username}</p>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
				<DashboardCard title="Total Users" value={stats.users} icon={<Users className="w-6 h-6 text-blue-500" />} loading={loading} />
				<DashboardCard title="Total Sales" value={`$${stats.sales}`} icon={<CreditCard className="w-6 h-6 text-green-500" />} loading={loading} />
				<DashboardCard title="Bookings" value={stats.bookings} icon={<Calendar className="w-6 h-6 text-orange-500" />} loading={loading} />
				<DashboardCard title="Shifts" value={stats.shifts} icon={<BarChart className="w-6 h-6 text-purple-500" />} loading={loading} />
			</div>

			<div className="mt-6">
				<Button onClick={() => logout(user.id)} variant="destructive">Logout</Button>
			</div>
		</div>
	);
}

// Dashboard Stat Card Component
function DashboardCard({ title, value, icon, loading }) {
	return (
		<Card className="p-4 flex items-center">
			<div className="mr-4">{icon}</div>
			<CardContent>
				<CardHeader className="p-0">
					<CardTitle className="text-lg">{title}</CardTitle>
				</CardHeader>
				{loading ? <Skeleton className="h-6 w-24" /> : <p className="text-2xl font-semibold">{value}</p>}
			</CardContent>
		</Card>
	);
}

