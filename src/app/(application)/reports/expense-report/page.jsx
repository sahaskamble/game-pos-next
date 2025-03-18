"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "./components/StatsCard";
import { ChartComponent } from "./components/Charts";
import { getExpenses, getExpenseStats } from "@/lib/services/expenseService";
import { ExpenseTable } from "./components/ExpenseTable";
import { format_Date } from "@/lib/utils/formatDates";
import DataFilter from "@/components/superAdmin/DataFilter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { parse } from 'date-fns';

const DATE_RANGE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Year", value: "this_year" },
  { label: "Custom", value: "custom" },
];

export default function ExpenseReports() {
  const [Data, setData] = useState();
  const [expenses, setExpenses] = useState([]);
  const [dateRangeType, setDateRangeType] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    categoryTotals: {},
    monthlyExpenses: {},
    recentExpenses: []
  });

  useEffect(() => {
    const fetchExpenses = async () => {
      const data = await getExpenses();
      setExpenses(data);
      setData(data);
      const expenseStats = await getExpenseStats(data);
      setStats(expenseStats);
    };
    fetchExpenses();
  }, []);


  // Update date range based on selected option
  const updateDateRange = (option) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (option) {
      case "today":
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date(today.setHours(23, 59, 59, 999));
        break;
      case "yesterday":
        start = new Date(today);
        start.setDate(today.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case "this_week":
        start = startOfWeek(today, { weekStartsOn: 1 });
        end = new Date(today);
        end.setHours(23, 59, 59, 999);
        break;
      case "this_month":
        start = startOfMonth(today);
        end = new Date(today);
        end.setHours(23, 59, 59, 999);
        break;
      case "this_year":
        start = startOfYear(today);
        end = new Date(today);
        end.setHours(23, 59, 59, 999);
        break;
      case "custom":
        return;
      default:
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date(today.setHours(23, 59, 59, 999));
    }

    setStartDate(format_Date(start));
    setEndDate(format_Date(end));
  };

  const handleDateRangeTypeChange = (value) => {
    setDateRangeType(value);
    updateDateRange(value);
  };

  // Filter expenses based on date range and branch
  useEffect(() => {
    if (!dateRangeType) {
      handleDateRangeTypeChange('today');
    }
    const fetchFilteredData = async () => {
      if (!expenses?.length || !Data?.length) return;

      try {
        let filtered = Data.filter(expense => {

          // Parse the date string properly
          const expenseDate = parse(expense.date, "dd/MM/yyyy, hh:mm a", new Date());

          // Convert start and end dates to Date objects
          const start = new Date(startDate);
          const end = new Date(endDate);

          // Set consistent times for comparison
          expenseDate.setHours(0, 0, 0, 0);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          // Debug logs
          console.log({
            expenseDate: expenseDate.toISOString(),
            start: start.toISOString(),
            end: end.toISOString(),
            isWithinRange: expenseDate >= start && expenseDate <= end
          });

          return expenseDate >= start && expenseDate <= end;
        });

        // Apply branch filter if selected
        if (selectedBranch) {
          filtered = filtered.filter(expense => expense.branch_id === selectedBranch);
        }

        console.log('Filtered Expenses:', filtered);

        const expenseStats = await getExpenseStats(filtered);
        setStats(expenseStats);
        setFilteredExpenses(filtered);
      } catch (error) {
        console.error('Error filtering data:', error);
        console.error('Error details:', {
          startDate,
          endDate,
          firstExpense: Data[0]?.created
        });
      }
    };

    fetchFilteredData();
  }, [expenses, Data, startDate, endDate, selectedBranch]);

  // Define the stats cards data based on the most relevant categories
  const StatsVar = [
    {
      title: "Total Expenses",
      value: `₹${stats.totalExpenses.toLocaleString()}`,
      description: "Total expenses excluding drawer transactions"
    },
    {
      title: "Snacks & Drinks",
      value: `₹${(stats.categoryTotals["Snacks & Drinks Expenses"] || 0).toLocaleString()}`,
      description: "Total snacks and drinks expenses"
    },
    {
      title: "Repairs & Maintenance",
      value: `₹${(stats.categoryTotals["Repairs / Maintainence"] || 0).toLocaleString()}`,
      description: "Total repair and maintenance costs"
    },
    {
      title: "Miscellaneous",
      value: `₹${(stats.categoryTotals["Miscellaneous"] || 0).toLocaleString()}`,
      description: "Other miscellaneous expenses"
    }
  ];

  // Prepare data for charts
  const monthlyChartData = Object.entries(stats.monthlyExpenses).map(([month, value]) => ({
    month,
    value
  }));

  const categoryChartData = Object.entries(stats.categoryTotals)
    .filter(([category]) => category !== "Drawer") // Exclude Drawer category
    .map(([category, value]) => ({
      category: category.replace(" Expenses", "").replace(" / ", " & "), // Clean up category names
      value
    }));

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex items-center justify-between p-4 pb-6">
        <h1 className="text-2xl font-bold">Expense Reports</h1>
        <div className="flex items-center gap-4">
          <DataFilter
            onBranchChange={setSelectedBranch}
          />
          {dateRangeType && (
            <>
              <Select value={dateRangeType} onValueChange={handleDateRangeTypeChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGE_OPTIONS?.map((option) => (
                    <SelectItem key={option?.value} value={option?.value}>
                      {option?.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {dateRangeType === "custom" && (
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-40"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <StatsCard Stats={StatsVar} />
        </div>
      </div>

      {/* Charts Section */}
      <div className="flex w-full gap-4 p-4">
        <div className="w-2/3">
          <ChartComponent
            title="Monthly Expenses"
            data={monthlyChartData}
            period="month"
            prefix="₹"
            showDetails={true}
            type="area"
          />
        </div>

        <div className="w-1/3">
          <ChartComponent
            title="Category Distribution"
            data={categoryChartData}
            period="category"
            prefix="₹"
            showDetails={true}
            type="pie"
          />
        </div>
      </div>

      {/* Expense Table */}
      <div className="p-4">
        <ExpenseTable
          expenses={filteredExpenses}
        />
      </div>
    </div>
  );
}
