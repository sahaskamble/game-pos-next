import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
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
  Label,
} from "recharts";

// Define COLORS since it's imported from another file
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28"];

export default function Charts({ dateRangeType = "today", sessions = [], expenses = [] }) {
  const [gamePopularityData, setGamePopularityData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [expensesChart, setExpensesChart] = useState([]);
  const [popularGame, setPopularGame] = useState('No Games');
  const [topExpenseCategory, setTopExpenseCategory] = useState('No Expenses');

  const prepareChartData = () => {
    // Ensure sessions is an array
    if (!Array.isArray(sessions) || sessions.length === 0) {
      // Return empty placeholder data if no sessions
      return dateRangeType === "today" || dateRangeType === "yesterday"
        ? Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          revenue: 0,
          sessions: 0,
          customers: 0
        }))
        : [{ hour: new Date().toLocaleDateString(), revenue: 0, sessions: 0, customers: 0 }];
    }

    if (dateRangeType === "today" || dateRangeType === "yesterday") {
      // 24-hour view with hourly data
      const hourlyData = sessions
        .filter(session => session && session.status === "Closed")
        .reduce((acc, session) => {
          // Check if session_in exists and is a valid date
          if (!session.session_in) return acc;

          let sessionDate;
          try {
            sessionDate = new Date(session.session_in);
            if (isNaN(sessionDate.getTime())) return acc;
          } catch (e) {
            return acc;
          }

          const hour = sessionDate.getHours();
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
      const dailyData = sessions
        .filter(session => session && session.status === "Closed")
        .reduce((acc, session) => {
          // Check if session_in exists and is a valid date
          if (!session.session_in) return acc;

          let sessionDate;
          try {
            sessionDate = new Date(session.session_in);
            if (isNaN(sessionDate.getTime())) return acc;
          } catch (e) {
            return acc;
          }

          const date = sessionDate.toLocaleDateString();
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
        }, []);

      // Return data sorted by date
      return dailyData.length > 0
        ? dailyData.sort((a, b) => new Date(a.hour) - new Date(b.hour))
        : [{ hour: new Date().toLocaleDateString(), revenue: 0, sessions: 0, customers: 0 }];
    }
  };

  useEffect(() => {
    const fetchData = () => {
      try {
        // Prepare line chart data
        const chart_Data = prepareChartData();
        setChartData(chart_Data);

        // Prepare game popularity data for donut chart
        if (Array.isArray(sessions) && sessions.length > 0) {
          // Filter out sessions that don't have valid game_id expansions
          const validSessions = sessions.filter(
            session => session &&
              session.expand &&
              session.expand.game_id &&
              typeof session.expand.game_id.popularity_score === 'number'
          );

          if (validSessions.length > 0) {
            // Sort by popularity score and take top 5
            const GameSummary = sessions?.reduce((acc, session) => {
              const gameName = session.expand?.game_id?.name;
              if (gameName) {
                if (!acc[gameName]) {
                  acc[gameName] = 0;
                }
                acc[gameName] += 1;
              }
              return acc;
            }, {});
            const GameSummaryArray = Object.entries(GameSummary).map(([name, value]) => ({ name, value }));
            console.log('Games', GameSummaryArray)

            setGamePopularityData(GameSummaryArray);

            // Get most popular game
            if (GameSummaryArray.length > 0) {
              const topGame = GameSummaryArray.reduce((max, game) => (game.value > max.value ? game : max), { name: "", value: 0 });
              setPopularGame(topGame.name || 'Unknown');
            }
          } else {
            setGamePopularityData([{ name: 'No Data', value: 1 }]);
            setPopularGame('No Games');
          }
        } else {
          setGamePopularityData([{ name: 'No Data', value: 1 }]);
          setPopularGame('No Games');
        }

        // Prepare expense data for donut chart
        if (Array.isArray(expenses) && expenses.length > 0) {
          // Filter out expenses without valid data
          const validExpenses = expenses.filter(
            expense => expense &&
              expense.withdraw_from_drawer &&
              typeof expense.withdraw_from_drawer.amount === 'number' &&
              expense.category
          );

          if (validExpenses.length > 0) {
            // Sort by amount and take top 5
            const expensesData = validExpenses
              .sort((a, b) => b.withdraw_from_drawer.amount - a.withdraw_from_drawer.amount)
              .slice(0, 5)
              .map(expense => ({
                name: expense.category || 'Uncategorized',
                value: expense.withdraw_from_drawer.amount || 0
              }));

            setExpensesChart(expensesData);

            // Get top expense category
            const topExpense = validExpenses.reduce((prev, current) =>
              (prev.withdraw_from_drawer.amount > current.withdraw_from_drawer.amount) ? prev : current
            );
            setTopExpenseCategory(topExpense.category || 'Uncategorized');
          } else {
            setExpensesChart([{ name: 'No Data', value: 1 }]);
            setTopExpenseCategory('No Expenses');
          }
        } else {
          setExpensesChart([{ name: 'No Data', value: 1 }]);
          setTopExpenseCategory('No Expenses');
        }
      } catch (error) {
        console.error("Error processing chart data:", error);
        // Set default values on error
        setChartData([{ hour: '0:00', revenue: 0, sessions: 0, customers: 0 }]);
        setGamePopularityData([{ name: 'Error', value: 1 }]);
        setExpensesChart([{ name: 'Error', value: 1 }]);
        setPopularGame('Error');
        setTopExpenseCategory('Error');
      }
    };

    fetchData();
  }, [sessions, expenses, dateRangeType]);

  // Check if we have valid data to display
  const hasData = chartData && chartData.length > 0;

  return (
    <div className="w-full grid gap-4 grid-cols-1 mt-8">
      <Card className="p-6 col-span-4 row-span-1">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold">
            {dateRangeType === "today" || dateRangeType === "yesterday"
              ? "24 Hour Traffic"
              : "Traffic Overview"}
          </div>
        </div>
        <div className="h-[300px]">
          {hasData && (
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
          )}
          {!hasData && (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      </Card>

      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Game Popularity</CardTitle>
          </CardHeader>
          <div className="h-[300px] flex items-center justify-between">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gamePopularityData}
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gamePopularityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
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
                              className="fill-foreground text-sm font-semibold"
                            >
                              {popularGame}
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
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

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Expenses Bifurcation</CardTitle>
          </CardHeader>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensesChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
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
                              className="fill-foreground text-sm font-semibold"
                            >
                              {topExpenseCategory}
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
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
                              Amount: ₹{payload[0].value}
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
    </div>
  );
}
