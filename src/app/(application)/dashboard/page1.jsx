"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card } from "@/components/ui/card";
import { Users, Timer, Wallet, Gamepad2, IndianRupee } from "lucide-react";
import { useCollection } from "@/lib/hooks/useCollection";
import { useAuth } from "@/lib/context/AuthContext";
import {
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import DataFilter from "@/components/superAdmin/DataFilter";
import { format } from 'date-fns';
import { format_Date } from "@/lib/utils/formatDates";
import { SessionsTable } from "@/components/sessions/SessionsTable";

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

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: sessions, loading: sessionsLoading } = useCollection("sessions", {
    expand: 'customer_id,branch_id,device_id,game_id,session_snacks.snack_id,user_id,billed_by',
    sort: '-created',
  });

  // Update cashDrawerData fetch to filter by user_id
  const { data: cashDrawerData } = useCollection("cashIndrawer", {
    sort: '-created',
    expand: "branch_id"
  });

  const { data: customers } = useCollection("customers");
  const { data: games } = useCollection("games");
  const { data: branches } = useCollection("branches");

  // Date filter states
  const [dateRangeType, setDateRangeType] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [selectedBranch, setSelectedBranch] = useState('');
  const [filteredSessions, setFilteredSessions] = useState([]);

  // Add this near the top with other state declarations
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    averageSessionDuration: 0,
    mostPlayedGame: {
      name: '-',
      popularity_score: 0
    },
    peakPeriod: {
      time: '-',
      customers: 0
    },
    cashInDrawer: 0,
    controllerCount: 0,
    estimatedClosingBalance: 0
  });

  // Also add gamePopularityData state since it's used in the pie chart
  const [gamePopularityData, setGamePopularityData] = useState([]);
  const [chartData, setChartData] = useState([]);

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

  // Filter sessions based on date range and branch
  useEffect(() => {
    if (!sessions) return;

    // Initialise, by default today's date
    if (!startDate || !endDate) {
      handleDateRangeTypeChange('today');
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    let filtered = sessions.filter(session => {
      const sessionDate = new Date(session.created);
      return sessionDate >= start && sessionDate <= end;
    });

    // Apply branch filter if selected
    if (selectedBranch) {
      filtered = filtered.filter(session => session.branch_id === selectedBranch);
    }

    setFilteredSessions(filtered);
  }, [sessions, startDate, endDate, selectedBranch]);

  // Set initial date range
  useEffect(() => {
    if (sessions) {
      updateDateRange("today");
    }
  }, [sessions]); // Only run when sessions first loads

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
    if (filteredSessions?.length && customers?.length && games?.length) {
      // Get latest cash drawer data for each branch
      let branchCashDrawers = {};

      if (branches?.length && cashDrawerData?.length) {
        branchCashDrawers = branches.reduce((acc, branch) => {
          // Find the latest cash drawer record for this branch
          const latestDrawer = cashDrawerData
            .filter(drawer => drawer.branch_id === branch.id)
            .sort((a, b) => new Date(b.created) - new Date(a.created))[0];

          acc[branch.id] = {
            cashInDrawer: latestDrawer?.withdraw_from_drawer?.amount || 0,
            controllerCount: latestDrawer?.controller_count || 0
          };
          return acc;
        }, {});
      }

      // Get current branch's cash drawer data if branch is selected
      let currentCashInDrawer = 0;
      let currentControllerCount = 0;

      if (selectedBranch) {
        currentCashInDrawer = branchCashDrawers[selectedBranch]?.cashInDrawer || 0;
        currentControllerCount = branchCashDrawers[selectedBranch]?.controllerCount || 0;
      } else {
        // Sum up all branches' cash drawer amounts if no branch is selected
        currentCashInDrawer = Object.values(branchCashDrawers)
          .reduce((sum, drawer) => sum + drawer.cashInDrawer, 0);
        currentControllerCount = Object.values(branchCashDrawers)
          .reduce((sum, drawer) => sum + drawer.controllerCount, 0);
      }

      // Calculate revenue from filtered sessions
      const revenue = filteredSessions.reduce((acc, session) =>
        acc + (session.amount_paid || 0), 0);

      // Calculate estimated closing balance
      const estimatedClosing = currentCashInDrawer + revenue;

      // Calculate number of active sessions
      const activeSessions = filteredSessions.filter(session => session.status === 'Active').length;

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
        },
        cashInDrawer: currentCashInDrawer || 0,
        controllerCount: currentControllerCount || 0,
        estimatedClosingBalance: estimatedClosing,
      }));
    }
  }, [filteredSessions, customers, games, cashDrawerData, dateRangeType, branches, selectedBranch]);

  if (sessionsLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container px-8 mx-auto py-10 space-y-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <DataFilter
          onBranchChange={setSelectedBranch}
        />
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          className="lg:col-span-1"
        />
        <StatsCard
          title="Active Customers"
          value={stats.activeCustomers}
          icon={Users}
          className="lg:col-span-1"
        />
        <StatsCard
          title="Avg. Session Duration"
          value={`${stats.averageSessionDuration} min`}
          icon={Timer}
          className="lg:col-span-1"
        />
        <StatsCard
          title="Most Played Game"
          value={stats.mostPlayedGame.name}
          icon={Gamepad2}
          className="lg:col-span-1"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Cash in Drawer"
          value={`₹${stats.cashInDrawer.toLocaleString()}`}
          subtitle={stats.lastUpdated ? `Last updated: ${format(new Date(stats.lastUpdated), "dd/MM/yyyy HH:mm")}` : 'No data'}
          icon={IndianRupee}
          className="lg:col-span-1"
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={Wallet}
          className="lg:col-span-1"
        />
        <StatsCard
          title="Est. Closing Balance"
          value={`₹${stats.estimatedClosingBalance.toLocaleString()}`}
          icon={IndianRupee}
          className="lg:col-span-1 bg-green-50"
        />
        <StatsCard
          title="Controllers"
          value={stats.controllerCount}
          icon={Gamepad2}
          className="lg:col-span-1"
        />
      </div>

      <div className="w-full grid gap-4 grid-cols-1 md:grid-cols-5 md:grid-rows-1">
        <Card className="p-6 col-span-4 row-span-1">
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
                  {gamePopularityData.map((_, index) => (
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

      <SessionsTable loading={sessionsLoading} data={filteredSessions.slice(-5)} displayEditDel={false} />
    </div>
  );
}
