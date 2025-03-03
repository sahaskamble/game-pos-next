"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatsCard } from "./components/StatsCard";
import { ChartComponent } from "./components/Charts";
import { getExpenses, getExpenseStats } from "@/lib/services/expenseService";
import { ExpenseTable } from "./components/ExpenseTable";

export default function ExpenseReports() {
  const [expenses, setExpenses] = useState([]);
  const [dateValue, setDateValue] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    categoryTotals: {},
    monthlyExpenses: {},
    recentExpenses: []
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const data = await getExpenses();
    setExpenses(data);
    setFilteredExpenses(data);
    const expenseStats = getExpenseStats(data);
    setStats(expenseStats);
  };

  const handleDateFilter = (date) => {
    setDateValue(date);
    if (!date) {
      setFilteredExpenses(expenses);
      return;
    }

    const filtered = expenses.filter(expense =>
      expense.date.includes(date)
    );
    setFilteredExpenses(filtered);
  };

  const StatsVar = [
    {
      title: "Total Expenses",
      value: `₹${stats.totalExpenses.toLocaleString()}`,
      description: "Total expenses across all categories"
    },
    {
      title: "Repairs & Maintenance",
      value: `₹${(stats.categoryTotals["Repairs / Maintenance"] || 0).toLocaleString()}`,
      description: "Total repair and maintenance costs"
    },
    {
      title: "Food & Beverages",
      value: `₹${(stats.categoryTotals["Food & Beverages"] || 0).toLocaleString()}`,
      description: "Total food and beverage expenses"
    },
    {
      title: "Hardware/Equipment",
      value: `₹${(stats.categoryTotals["Hardware/Equipment"] || 0).toLocaleString()}`,
      description: "Total hardware and equipment costs"
    }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex items-center justify-between p-4 pb-6">
        <h1 className="text-2xl font-bold">Expense Reports</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              type="date"
              value={dateValue}
              onChange={(e) => handleDateFilter(e.target.value)}
            />
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <StatsCard Stats={StatsVar} />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <ChartComponent
          title="Monthly Expenses"
          data={Object.entries(stats.monthlyExpenses).map(([month, value]) => ({
            month,
            value
          }))}
          period="month"
        />

        <ChartComponent
          title="Category Distribution"
          data={Object.entries(stats.categoryTotals).map(([category, value]) => ({
            category,
            value
          }))}
          period="category"
        />
      </div>

      {/* Expense Table */}
      <div className="p-4">
        <ExpenseTable expenses={filteredExpenses} />
      </div>
    </div>
  );
}
