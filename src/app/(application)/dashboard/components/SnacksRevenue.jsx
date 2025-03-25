import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, Tooltip } from "recharts";

export default function SnacksRevenue({ sessions, snacks }) {

  const [TotalRevenue, setTotalRevenue] = useState(0);
  const [snackSummary, setSnackSummary] = useState([]);
  const [TopRatedSnack, setTopRatedSnack] = useState({ name: "", quantity: 0 });

  useEffect(() => {
    const fetchData = () => {
      const snacks_total = sessions.reduce((acc, session) => acc + Number(session?.snacks_total) || 0, 0);
      setTotalRevenue(snacks_total);

      // Chart
      const summary = snacks?.reduce((acc, snack) => {
        const snackName = snack.expand?.snack_id?.name;
        const quantity = Number(snack.quantity) || 0;

        if (snackName) {
          if (!acc[snackName]) {
            acc[snackName] = 0;
          }
          acc[snackName] += quantity;
        }
        return acc;
      }, {});
      const summaryArray = Object.entries(summary).map(([name, quantity]) => ({ name, quantity }));
      setSnackSummary(summaryArray);

      // Top Rated Snack
      if (summaryArray.length > 0) {
        const topSnack = summaryArray.reduce((max, snack) => (snack.quantity > max.quantity ? snack : max), { name: "", quantity: 0 });
        setTopRatedSnack(topSnack);
      }
    }

    if (sessions && snacks) {
      fetchData();
    }
  }, [sessions, snacks]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-md">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">
            Quantity: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='text-sm text-muted-foreground'>Snacks</CardTitle>
        <CardDescription className='text-2xl font-semibold text-foreground'>
          ₹ {TotalRevenue.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className='w-full leading-none'>
        {snackSummary.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={snackSummary}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#64646499"
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: '#6b7280',
                  fontSize: 12
                }}
                tickMargin={8}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar
                dataKey="quantity"
                fill="hsl(var(--chart-1))"
                radius={[10, 10, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2">
          <h1 className="font-bold"> Top Ranked :- </h1>
          <span>{TopRatedSnack.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="font-bold"> Quantity Sold :- </h1>
          <span>{TopRatedSnack.quantity} pcs.</span>
        </div>
      </CardFooter>
    </Card>
  )
};
