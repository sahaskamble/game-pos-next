"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentSessions } from "@/components/dashboard/RecentSessions";
import { Card } from "@/components/ui/card";
import { BarChart, Users, Timer, Wallet, Gamepad2 } from "lucide-react";
import { useCollection } from "@/lib/hooks/useCollection";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Add these colors for the donut chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: sessions, loading: sessionsLoading } = useCollection("sessions", { expand: "customer_id,branch_id" });
  const { data: customers } = useCollection("customers");
  const { data: games } = useCollection("games");
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    averageSessionDuration: 0,
    mostPlayedGame: { name: '-', popularity_score: 0 },
  });
  const [chartData, setChartData] = useState([]);
  const [gamePopularityData, setGamePopularityData] = useState([]);

  useEffect(() => {
    if (sessions?.length && customers?.length && games?.length) {
      const revenue = sessions.reduce((acc, session) => acc + (session.total_amount || 0), 0);
      const activeSessions = sessions.filter(s => s.status === "active").length;

      // Calculate average session duration
      const completedSessions = sessions.filter(s => s.status === "Closed");
      const avgDuration = completedSessions.reduce((acc, session) => {
        const startTime = new Date(session.session_in);
        const endTime = new Date(session.session_out);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          return acc;
        }

        const duration = endTime.getTime() - startTime.getTime();
        return acc + (duration > 0 ? duration : 0);
      }, 0) / (completedSessions.length || 1);

      // Find most played game based on popularity score
      const mostPlayedGame = games.reduce((prev, current) =>
        (prev.popularity_score > current.popularity_score) ? prev : current
      );

      // Prepare game popularity data for donut chart
      const gamePopularity = games
        .sort((a, b) => b.popularity_score - a.popularity_score)
        .slice(0, 5) // Take top 5 games
        .map(game => ({
          name: game.name,
          value: game.popularity_score || 0
        }));

      setGamePopularityData(gamePopularity);

      setStats({
        totalCustomers: customers.length,
        activeCustomers: activeSessions,
        totalRevenue: revenue,
        averageSessionDuration: Math.round(avgDuration / (1000 * 60)),
        mostPlayedGame: {
          name: mostPlayedGame.name || '-',
          popularity_score: mostPlayedGame.popularity_score || 0
        },
      });

      // Existing chart data preparation...
      const last7DaysData = sessions
        .filter(session => session.status === "Closed")
        .reduce((acc, session) => {
          const date = new Date(session.session_out).toLocaleDateString();
          const existingDay = acc.find(item => item.date === date);

          if (existingDay) {
            existingDay.revenue += session.total_amount || 0;
            existingDay.sessions += 1;
          } else {
            acc.push({
              date,
              revenue: session.total_amount || 0,
              sessions: 1
            });
          }
          return acc;
        }, [])
        .slice(-7)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setChartData(last7DaysData);
    }
  }, [sessions, customers, games]);

  if (sessionsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
        />
        <StatsCard
          title="Active Customers"
          value={stats.activeCustomers}
          icon={Users}
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue}`}
          icon={Wallet}
        />
        <StatsCard
          title="Avg. Session Duration"
          value={`${stats.averageSessionDuration} min`}
          icon={Timer}
        />
        <StatsCard
          title="Most Played Game"
          value={stats.mostPlayedGame.name}
          icon={Gamepad2}
        />
      </div>

      <div className="w-full grid gap-4 grid-cols-1 md:grid-cols-5 md:grid-rows-1">
        <Card className="p-6 col-span-4 row-span-1">
          <div className="text-xl font-bold mb-4">Revenue Trend</div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-sm text-muted-foreground"
                />
                <YAxis
                  className="text-sm text-muted-foreground"
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Revenue
                              </span>
                              <span className="font-bold text-muted-foreground">
                                ₹{payload[0].value}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Sessions
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[1].value}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 col-span-4 md:col-span-1 row-span-1">
          <div className="text-xl font-bold mb-4">Game Popularity</div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gamePopularityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gamePopularityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {payload[0].payload.name}
                            </span>
                            <span className="font-bold text-muted-foreground">
                              Score: {payload[0].value}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <RecentSessions sessions={sessions.slice(-5)} />
    </div>
  );
}
