"use client";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
	Tooltip,
	Cell
} from "recharts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Blue600 } from "@/constants/colors";

// Chart component with alternating colored bars
export const ChartComponent = ({
	title,
	data,
	period = "day", // 'day' or 'month'
	primaryColor = "#FFFFFF",
	secondaryColor = "#3B82F6", // Blue color
}) => {
	return (
		<Card>
			<CardHeader className="pb-2 flex flex-row justify-between items-center">
				<CardTitle className="text-base font-bold">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-64">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={data}
							height={200}
							margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
						>
							<CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#444" />
							<XAxis
								dataKey="month"
								axisLine={true}
								tickLine={true}
								tick={{ fill: '#aaa', fontSize: 12 }}
								interval={0}  // Show all ticks
								angle={-45}   // Rotate labels
								textAnchor="end"  // Align rotated labels
								height={100}   // Provide space for rotated labels
							/>
							<YAxis 
								hide={false}
								axisLine={false}
								tickLine={false}
								tick={{ fill: '#aaa', fontSize: 12 }}
							/>
							<Tooltip
								contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}
								labelStyle={{ color: '#fff' }}
								cursor={{ fill: 'rgba(97, 97, 97, 0.27)' }}
								formatter={(value) => [`${value}${title.includes('Rate') ? '%' : ''}`]}
							/>
							<Bar
								dataKey="value"
								radius={[4, 4, 0, 0]}
								barSize={70}
							>
								{data.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={index % 2 === 0 ? primaryColor : secondaryColor}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
};
