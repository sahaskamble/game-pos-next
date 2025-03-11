"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 p-2 border rounded-lg shadow-sm">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm">
          {prefix}
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export const AttendanceDistributionChart = ({ data }) => {
  // Process data to show attendance distribution over the range (0-30 days)
  const attendanceDistribution = Array(31).fill(0);
  data.forEach(staff => {
    attendanceDistribution[staff.daysPresent]++;
  });

  const chartData = attendanceDistribution.map((count, days) => ({
    days: days.toString(),
    count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="days"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888', fontSize: 12 }}
                label={{ value: 'Days Present', position: 'bottom', offset: 0 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888', fontSize: 12 }}
                label={{ value: 'Number of Staff', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip prefix="Staff: " />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                fill="url(#attendanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const RoleDistributionChart = ({ data }) => {
  // Calculate role distribution
  const roleDistribution = data.reduce((acc, staff) => {
    const role = staff.role || 'Unassigned';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(roleDistribution).map(([role, count]) => ({
    role,
    count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="role"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip prefix="Staff: " />} />
              <Bar
                dataKey="count"
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const AttendanceTrendChart = ({ data }) => {
  // Calculate daily attendance trend for the last 30 days
  const today = new Date();
  const trendData = Array(30).fill(0).map((_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - index));
    const dateStr = date.toISOString().split('T')[0];
    
    const presentCount = data.filter(staff => {
      // This is a placeholder - you'll need to implement the actual logic
      // based on your staff_logins data structure
      return staff.daysPresent > index % 5; // Dummy logic for demonstration
    }).length;

    return {
      date: dateStr,
      present: presentCount,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>30-Day Attendance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888', fontSize: 12 }}
                tickFormatter={(value) => value.split('-')[2]} // Show only day
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip prefix="Present: " />} />
              <Area
                type="monotone"
                dataKey="present"
                stroke="#82ca9d"
                fill="url(#trendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
