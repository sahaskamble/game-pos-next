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

export const ChartComponent = ({
  title,
  data,
  period = "day",
  type = "area",
  xAxisDataKey = "month",
  dataKey = "value",
  prefix = "",
  gradientColor = "#8884d8",
  showDetails = false,
}) => {
  const gradientId = `${period}Gradient`;

  const CustomTooltip = ({ active, payload, label }) => {
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

  const renderChart = () => {
    if (type === "bar") {
      return (
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xAxisDataKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#888', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#888', fontSize: 12 }}
            width={60}
          />
          <Tooltip content={<CustomTooltip prefix={prefix} />} />
          <Bar dataKey={dataKey} fill={gradientColor} />
        </BarChart>
      );
    }

    return (
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gradientColor} stopOpacity={0.8} />
            <stop offset="95%" stopColor={gradientColor} stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={xAxisDataKey}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#888', fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#888', fontSize: 12 }}
          width={60}
        />
        <Tooltip content={<CustomTooltip prefix={prefix} />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={gradientColor}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
