"use client";

import { useEffect, useState } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
import { useAuth } from "@/lib/context/AuthContext";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns";
import { AddCashlogDialog } from "./components/AddCashlogDialog";
import { BranchCashStats } from "./components/BranchCashStats";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { startOfWeek, startOfMonth, startOfYear, subDays, endOfDay } from 'date-fns';
import DataFilter from "@/components/superAdmin/DataFilter";

const DATE_RANGE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Year", value: "this_year" },
  { label: "Custom", value: "custom" },
];

export default function CashlogPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [needsInitialCashDrawer, setNeedsInitialCashDrawer] = useState(false);
  const [filteredCashlogs, setFilteredCashlogs] = useState([]);
  const [dateRangeType, setDateRangeType] = useState("today");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBranch, setSelectedBranch] = useState('');

  const { data: cashlogs, loading, mutate } = useCollection("cashlog", {
    expand: "drawer_id,user_id,branch_id",
    sort: "-created",
  });

  const { data: branches } = useCollection("branches");

  useEffect(() => {
    if (user) {
      setIsSuperAdmin(user.role === "SuperAdmin");
      setIsAdmin(user.role === "Admin");
    }
  }, [user]);

  // Update date range based on selected option
  const updateDateRange = (option) => {
    const today = new Date();
    let start = new Date();
    let end = endOfDay(today);

    switch (option) {
      case "today":
        start = new Date(today.setHours(0, 0, 0, 0));
        break;
      case "yesterday":
        start = subDays(today, 1);
        start.setHours(0, 0, 0, 0);
        end = subDays(today, 1);
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

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleDateRangeTypeChange = (value) => {
    setDateRangeType(value);
    updateDateRange(value);
  };

  // Filter cashlogs based on date range and branch
  useEffect(() => {
    if (cashlogs) {
      let filtered = cashlogs.filter(cashlog => {
        // First filter out Drawer category for non-SuperAdmin users
        if (user?.role !== 'SuperAdmin' && cashlog.category === 'Drawer') {
          return false;
        }

        // Then apply date range filter
        const cashlogDate = new Date(cashlog.created);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        return cashlogDate >= start && cashlogDate <= end;
      });

      // Apply branch filter if selected
      if (selectedBranch) {
        filtered = filtered.filter(cashlog => cashlog.branch_id === selectedBranch);
      }

      setFilteredCashlogs(filtered);
    }
  }, [cashlogs, startDate, endDate, selectedBranch]);

  return (
    <div className="container px-8 mx-auto py-10 space-y-8">
      {/* Branch-wise Stats */}
      {(isAdmin || isSuperAdmin) && (
        <BranchCashStats cashlogs={filteredCashlogs} branches={branches} />
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Cash Log</h2>
        <div className="flex items-center gap-4">
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
          <AddCashlogDialog onSuccess={() => mutate()} />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredCashlogs}
        loading={loading}
        searchKey="category"
        searchPlaceholder="Filter by category..."
        meta={{
          isAdmin: isAdmin || isSuperAdmin,
          isSuperAdmin,
          onSuccess: () => mutate(),
        }}
      />
    </div>
  );
}
