import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function MembershipCard({ memberships = [] }) {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [membershipsSold, setMembershipsSold] = useState(0);
  const [chartData, setChartData] = useState([]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 p-2 border rounded-lg shadow-sm">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            Customers: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const fetchData = () => {
      // Calculate total revenue from membership sales
      const membership_total = memberships.reduce((acc, log) => {
        const sellingPrice = log.expand?.plan_id?.selling_price || 0;
        return acc + Number(sellingPrice);
      }, 0);

      // Set number of memberships sold
      setMembershipsSold(memberships.length);
      setTotalRevenue(membership_total);

      // Create chart data by grouping memberships by plan name
      const summary = memberships.reduce((acc, log) => {
        const planName = log.expand?.plan_id?.name;
        if (planName) {
          if (!acc[planName]) {
            acc[planName] = 0;
          }
          acc[planName] += 1;
        }
        return acc;
      }, {});

      // Convert summary object to array format for chart
      const summaryArray = Object.entries(summary).map(([name, count]) => ({ name, count }));
      setChartData(summaryArray);
    }

    if (memberships && Array.isArray(memberships)) {
      fetchData();
    }
  }, [memberships]);

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='text-sm text-muted-foreground'>Membership Sales</CardTitle>
        <CardDescription className='text-2xl font-semibold text-foreground'>
          ₹ {totalRevenue.toLocaleString()}
        </CardDescription>
      </CardHeader>
      {chartData.length > 0 ? (
        <CardContent className="px-2">
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                >
                  {
                    chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))
                  }
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {membershipsSold.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-sm"
                            >
                              Plans Sold
                            </tspan>
                          </text>
                        )
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <div className="flex items-center justify-center h-[160px] text-muted-foreground">
            No membership data available
          </div>
        </CardContent>
      )}
    </Card>
  )
}
