"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentSessions } from "@/components/dashboard/RecentSessions";
import { Card } from "@/components/ui/card";
import { BarChart as BarChartIcon, Users, Timer, Wallet, Gamepad2 } from "lucide-react";
import { useCollection } from "@/lib/hooks/useCollection";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startOfWeek, startOfMonth, startOfYear, subDays, endOfDay } from 'date-fns';

// Add these colors for the donut chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DATE_RANGE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Year", value: "this_year" },
  { label: "Custom", value: "custom" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: sessions, loading: sessionsLoading } = useCollection("sessions", {
    expand: "customer_id,branch_id,device_id"
  });
  const { data: customers } = useCollection("customers");
  const { data: games } = useCollection("games");
  const { data: devices } = useCollection("devices");

  // Date filter states
  const [dateRangeType, setDateRangeType] = useState("today");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [membershipFilter, setMembershipFilter] = useState("all"); // "all", "member", "non-member"
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("all");

  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    averageSessionDuration: 0,
    mostPlayedGame: { name: '-', popularity_score: 0 },
  });
  const [chartData, setChartData] = useState([]);
  const [gamePopularityData, setGamePopularityData] = useState([]);

  // Update date range based on selected option
  const updateDateRange = (option) => {
    const today = new Date();
    let start = new Date();
    let end = endOfDay(today);

    switch (option) {
      case "today":
        start = new Date(today.setHours(0, 0, 0, 0));
        break;
      case "yesterday":
        start = subDays(today, 1);
        start.setHours(0, 0, 0, 0);
        end = subDays(today, 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "this_week":
        start = startOfWeek(today, { weekStartsOn: 1 }); // Week starts on Monday
        break;
      case "this_month":
        start = startOfMonth(today);
        break;
      case "this_year":
        start = startOfYear(today);
        break;
      case "custom":
        // Keep existing custom dates
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // Handle date range type change
  const handleDateRangeTypeChange = (value) => {
    setDateRangeType(value);
    updateDateRange(value);
  };

  const filterSessions = (sessions) => {
    if (!sessions) return [];

    return sessions.filter(session => {
      const sessionDate = new Date(session.created);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);

      const dateInRange = sessionDate >= start && sessionDate <= end;

      const membershipMatch =
        membershipFilter === "all" ? true :
          membershipFilter === "member" ? session.expand?.customer_id?.isMember :
            !session.expand?.customer_id?.isMember;

      const deviceMatch =
        deviceTypeFilter === "all" ? true :
          session.expand?.device_id?.type === deviceTypeFilter;

      return dateInRange && membershipMatch && deviceMatch;
    });
  };

  const prepareChartData = (filteredSessions, dateRangeType) => {
    if (dateRangeType === "today" || dateRangeType === "yesterday") {
      // 24-hour view with hourly data
      const hourlyData = filteredSessions
        .filter(session => session.status === "Closed")
        .reduce((acc, session) => {
          const hour = new Date(session.session_in).getHours();
          const hourKey = `${hour}:00`;
          
          const existingHour = acc.find(item => item.hour === hourKey);
          if (existingHour) {
            existingHour.revenue += session.total_amount || 0;
            existingHour.sessions += 1;
            existingHour.customers += 1;
          } else {
            acc.push({
              hour: hourKey,
              revenue: session.total_amount || 0,
              sessions: 1,
              customers: 1
            });
          }
          return acc;
        }, []);

      // Fill in missing hours
      return Array.from({ length: 24 }, (_, i) => {
        const hour = `${i}:00`;
        const existingData = hourlyData.find(item => item.hour === hour);
        return existingData || {
          hour,
          revenue: 0,
          sessions: 0,
          customers: 0
        };
      }).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
    } else {
      // Daily view for longer ranges
      return filteredSessions
        .filter(session => session.status === "Closed")
        .reduce((acc, session) => {
          const date = new Date(session.session_in).toLocaleDateString();
          const existingDay = acc.find(item => item.hour === date);
          
          if (existingDay) {
            existingDay.revenue += session.total_amount || 0;
            existingDay.sessions += 1;
            existingDay.customers += 1;
          } else {
            acc.push({
              hour: date,
              revenue: session.total_amount || 0,
              sessions: 1,
              customers: 1
            });
          }
          return acc;
        }, [])
        .sort((a, b) => new Date(a.hour) - new Date(b.hour));
    }
  };

  useEffect(() => {
    if (sessions?.length && customers?.length && games?.length) {
      const filteredSessions = filterSessions(sessions);
      
      // Calculate stats
      const revenue = filteredSessions.reduce((acc, session) => acc + (session.total_amount || 0), 0);
      const activeSessions = filteredSessions.filter(s => s.status === "active").length;

      // Calculate average session duration for filtered sessions
      const completedSessions = filteredSessions.filter(s => s.status === "Closed");
      const avgDuration = completedSessions.reduce((acc, session) => {
        const startTime = new Date(session.session_in);
        const endTime = new Date(session.session_out);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          return acc;
        }

        const duration = endTime.getTime() - startTime.getTime();
        return acc + (duration > 0 ? duration : 0);
      }, 0) / (completedSessions.length || 1);

      // Calculate game popularity based on session count
      const gameSessionCounts = games.reduce((acc, game) => {
        const sessionCount = sessions.filter(s => s.game_id === game.id).length;
        acc[game.id] = {
          name: game.name,
          sessions: sessionCount
        };
        return acc;
      }, {});

      // Find most played game based on session count
      const mostPlayedGame = Object.values(gameSessionCounts)
        .sort((a, b) => b.sessions - a.sessions)[0];

      // Prepare game popularity data for bar chart
      const gamePopularity = Object.values(gameSessionCounts)
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 5) // Take top 5 games
        .map(game => ({
          name: game.name,
          sessions: game.sessions
        }));

      setGamePopularityData(gamePopularity);

      setStats(prevStats => ({
        ...prevStats,
        mostPlayedGame: {
          name: mostPlayedGame?.name || '-',
          sessions: mostPlayedGame?.sessions || 0
        }
      }));

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

      // Prepare chart data based on date range
      const chartData = prepareChartData(filteredSessions, dateRangeType);
      setChartData(chartData);

      // Find peak period
      const peakPeriod = chartData.reduce((peak, current) => 
        current.customers > (peak?.customers || 0) ? current : peak
      , null);

      setStats(prevStats => ({
        ...prevStats,
        totalCustomers: customers.length,
        activeCustomers: activeSessions,
        totalRevenue: revenue,
        averageSessionDuration: Math.round(avgDuration / (1000 * 60)),
        mostPlayedGame: {
          name: mostPlayedGame.name || '-',
          popularity_score: mostPlayedGame.popularity_score || 0
        },
        peakPeriod: {
          time: peakPeriod?.hour,
          customers: peakPeriod?.customers || 0
        }
      }));
    }
  }, [sessions, customers, games, startDate, endDate, dateRangeType, membershipFilter, deviceTypeFilter]);

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={dateRangeType} onValueChange={handleDateRangeTypeChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Show date range picker only for custom option */}
        {dateRangeType === "custom" && (
          <div className="flex gap-2 items-center">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
            <span>to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>
        )}

        <Select value={membershipFilter} onValueChange={setMembershipFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Membership" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="member">Members Only</SelectItem>
            <SelectItem value="non-member">Non-Members</SelectItem>
          </SelectContent>
        </Select>

        <Select value={deviceTypeFilter} onValueChange={setDeviceTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Device Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Devices</SelectItem>
            <SelectItem value="PS">PS5</SelectItem>
            <SelectItem value="VR">VR Games</SelectItem>
            <SelectItem value="SIM">Car Simulator</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
          value={`${stats.mostPlayedGame.name} (${stats.mostPlayedGame.sessions} sessions)`}
          icon={Gamepad2}
        />
      </div>

      <div className="w-full grid gap-4 grid-cols-1 md:grid-cols-5 md:grid-rows-1">
        <Card className="p-6 col-span-3 row-span-1">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-bold">
              {dateRangeType === "today" || dateRangeType === "yesterday" 
                ? "24 Hour Traffic" 
                : "Traffic Overview"}
            </div>
            <div className="text-sm text-muted-foreground">
              Peak {dateRangeType === "today" || dateRangeType === "yesterday" ? "Hour" : "Day"}: 
              {stats.peakPeriod?.time} ({stats.peakPeriod?.customers} customers)
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="hour"
                  className="text-sm text-muted-foreground"
                />
                <YAxis
                  className="text-sm text-muted-foreground"
                  yAxisId="left"
                  tickFormatter={(value) => `₹${value}`}
                />
                <YAxis
                  className="text-sm text-muted-foreground"
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-3 gap-2">
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
                                Customers
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[2].value}
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
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sessions"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="customers"
                  stroke="#ffc658"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 col-span-4 md:col-span-2 row-span-1">
          <div className="text-xl font-bold mb-4">Game Popularity</div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={gamePopularityData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
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
                              Sessions: {payload[0].value}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="sessions"
                  fill="#8884d8"
                  radius={[0, 4, 4, 0]}
                >
                  {gamePopularityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={`hsl(${index * 25 + 200}, 70%, 60%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <RecentSessions sessions={sessions.slice(-5)} />
    </div>
  );
}
