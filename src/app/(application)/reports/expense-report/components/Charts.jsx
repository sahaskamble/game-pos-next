"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
	Tooltip,
	Pie,
	PieChart,
	Cell,
} from "recharts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CustomTooltip = ({ active, payload, label, prefix = "₹" }) => {
	if (active && payload && payload.length) {
		return (
			<div className="rounded-lg border bg-background p-2 shadow-sm">
				<div className="flex flex-col">
					<span className="text-[0.70rem] uppercase text-muted-foreground">
						{payload[0].payload.category}
					</span>
					<span className="font-bold text-muted-foreground">
						{prefix}{payload[0].value.toLocaleString()}
					</span>
				</div>
			</div>
		);
	}
	return null;
};

export const ChartComponent = ({
	title,
	data,
	period = "month",
	prefix = "₹",
	showDetails = false,
	type = "area"
}) => {
	const gradientId = `${period}Gradient`;

	const renderAreaChart = () => (
		<ResponsiveContainer width="100%" height="100%">
			<AreaChart
				data={data}
				margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
			>
				<defs>
					<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
						<stop offset="95%" stopColor="#8884d8" stopOpacity={0.2} />
					</linearGradient>
				</defs>
				<CartesianGrid strokeDasharray="3 3" vertical={false} />
				<XAxis
					dataKey="month"
					axisLine={false}
					tickLine={false}
					tick={{ fill: '#888', fontSize: 12 }}
					padding={{ left: 10, right: 10 }}
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
					dataKey="value"
					stroke="#8884d8"
					fillOpacity={1}
					fill={`url(#${gradientId})`}
				/>
			</AreaChart>
		</ResponsiveContainer>
	);

	const renderDonutChart = () => (
		<ResponsiveContainer width="100%" height="100%">
			<PieChart>
				<Pie
					data={data}
					cx="50%"
					cy="50%"
					innerRadius={60}
					outerRadius={80}
					fill="#8884d8"
					paddingAngle={5}
					dataKey="value"
				>
					{data.map((entry, index) => (
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
											{payload[0].payload.category}
										</span>
										<span className="font-bold text-muted-foreground">
											{prefix}{payload[0].value.toLocaleString()}
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
	);

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base font-medium">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-[300px]">
					{period === "category" ? renderDonutChart() : renderAreaChart()}
				</div>
			</CardContent>
		</Card>
	);
};
